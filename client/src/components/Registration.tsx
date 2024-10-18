import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Slice from "./assets/Slice.png";
import building from "./assets/building.jpg";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BounceLoader from "react-spinners/ClipLoader";
import SignatureCanvas from "react-signature-canvas";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/solid";
import Swal from "sweetalert2";

type UserCredentials = z.infer<typeof schema>;

interface Position {
  id: number;
  value: string;
  label: string;
}

const schema = z
  .object({
    email: z.string().email(),
    password: z.string().min(5).max(20),
    userName: z.string().min(5).max(20),
    firstName: z.string().min(2).max(30),
    lastName: z.string().min(2).max(30),
    contact: z.string().refine((value) => /^\d{11}$/.test(value), {
      message: "Contact number must be 11 digits",
    }),
    branchCode: z.string().nonempty(),
    confirmPassword: z.string().min(5).max(20),
    position: z.string().nonempty(),
    branch: z.string().nonempty(),
    employee_id: z.string().min(2).max(30),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const fieldStyle = "flex flex-col md:flex-row gap-4";
const headerStyle = "lg:text-lg text-base mb-2";
const inputStyle =
  "w-full  lg:h-[56px] md:h-10  p-2 bg-gray-300 rounded-lg  autofill-input text-black";

const Registration: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [signature, setSignature] = useState<SignatureCanvas | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signatureEmpty, setSignatureEmpty] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string[]>([]);
  const [roleOptions, setRoleOptions] = useState<Position[]>([]);
  const [positionError, setPositionError] = useState("");
  const [branchList, setBranchList] = useState<
    { id: number; branch_code: string; branch: string }[]
  >([]);

  useEffect(() => {
    const fetchPositionData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/positions`
        );

        if (response.status === 200) {
          setRoleOptions(response.data.position);
        }
      } catch (error: any) {
        console.error("Error fetching position data:", error);
      }
    };

    fetchPositionData();
  }, []);

  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/view-branch`
        );
        const branches = response.data.data;
        // Assuming response.data.data is the array of branches
        const branchOptions = branches.map(
          (branch: { id: number; branch_code: string; branch: string }) => ({
            id: branch.id,
            branch_code: branch.branch_code,
            branch: branch.branch,
          })
        );
        setBranchList(branchOptions);
      } catch (error) {
        console.error("Error fetching branch data:", error);
      }
    };

    fetchBranchData();
  }, []);

  const signatureIsEmpty = () => {
    if (signature && signature.isEmpty && signature.isEmpty()) {
      setSignatureEmpty(true);
      return true;
    }
    return false;
  };
  useEffect(() => {
    if (signature) {
      signature.toDataURL("image/png");
    }
  }, [signature]);
  const {
    control,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UserCredentials>({
    resolver: zodResolver(schema),
  });

  const handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    signature?.clear();
  };

  const capitalizeWords = (str: string) => {
    return str.replace(
      /\b\w+/g,
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );
  };

  const submitData = async (data: UserCredentials) => {
    try {
      setLoading(true);

      // Check if signature is empty
      if (signatureIsEmpty()) {
        setSignatureEmpty(true);
        setLoading(false);
        return; // Exit function early if signature is empty
      }

      const signatureDataURL = signature?.toDataURL("image/png");

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/register`,
        {
          email: data.email,
          password: data.password,
          userName: data.userName,
          firstName: capitalizeWords(data.firstName),
          lastName: capitalizeWords(data.lastName),
          contact: data.contact,
          branch_code: data.branchCode,
          position: data.position,
          confirmPassword: data.password,
          signature: signatureDataURL,
          role: "User",
          branch: data.branch,
          employee_id: data.employee_id,
        }
      );

      setErrorMessage(response.data.errors);
      if (response.data.status) {
        setLoading(false);
        localStorage.setItem("token", response.data.token);
        Swal.fire({
          icon: "success",
          title: response.data.message || "Registration Successful",
          iconColor: "#007bff",
          text: "You will be redirected to the login page",
          confirmButtonText: "Close",
          confirmButtonColor: "#007bff",
        });
        window.setTimeout(() => {
          navigate("/login"); // Navigate to login after successful registration
        }, 2000);
      } else {
        setPositionError(response.data.errors.position[0]);
        const errors = response.data.errors;
        const message = [];

        if (errors.email) {
          message.push(...errors.email);
        }
        if (errors.employee_id) {
          message.push(...errors.employee_id);
        }
        setErrorMessage(message);
        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          iconColor: "#dc3545",
          text:
            message.join(", ") ||
            "An error occurred during the registration process. Please try again.",
          confirmButtonText: "Close",
          confirmButtonColor: "#dc3545",
        });

        setLoading(false);
      }
    } catch (error) {
      // console.error("Registration Error:", error);
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        iconColor: "#dc3545",
        text: "An error occurred during the registration process. Please try again.",
        confirmButtonText: "Close",
        confirmButtonColor: "#dc3545",
      });
      setLoading(false);
    }
  };

  const handleBranchCodeChange = (selectedBranchId: number) => {
    const selectedBranch = branchList.find(
      (branch) => branch.id === selectedBranchId
    );

    if (selectedBranch) {
      setValue("branch", selectedBranch.branch);
    } else {
      setValue("branch", "Honda Des, Inc.");
    }
  };
  return (
    <div className="flex flex-col lg:flex-row items-center justify-center text-black bg-[#FFFFFF]">
      <div className="flex items-center justify-center w-full p-8 lg:w-1/2">
        <img
          className="absolute inset-0 z-0 hidden object-cover w-full h-screen md:block lg:hidden"
          src={building}
          alt=""
        />
        <div className="z-10 w-full p-4 m-10 mt-20 bg-white rounded-lg lg:p-8 lg:mt-0 lg:m-0">
          <h1 className="text-primary font-bold lg:text-[32px] md:text-2xl mb-6 text-left">
            ACCOUNT REGISTRATION
          </h1>
          <form onSubmit={handleSubmit(submitData, () => setLoading(false))}>
            <div className={`${fieldStyle}`}>
              <div className="w-full mb-4 md:w-1/2 ">
                <h1 className={`${headerStyle}`}>First Name</h1>
                <input
                  type="text"
                  {...register("firstName")}
                  placeholder="Enter first name"
                  className={`${inputStyle}`}
                />
                <div>
                  {errors.firstName && (
                    <span className="text-xs text-red-500">
                      {" "}
                      {errors.firstName.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full mb-4 md:w-1/2">
                <h1 className={`${headerStyle}`}>Last Name</h1>
                <input
                  type="text"
                  {...register("lastName")}
                  placeholder="Enter last name"
                  className={`${inputStyle}`}
                />
                {errors.lastName && (
                  <p className="text-xs text-red-500">
                    {" "}
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
            <div className={`${fieldStyle}`}>
              <div className="w-full mb-4 md:w-1/2">
                <h1 className={`${headerStyle}`}>Username</h1>
                <input
                  type="text"
                  {...register("userName")}
                  placeholder="Enter username"
                  className={`${inputStyle}`}
                />
                <div>
                  {errors.userName && (
                    <span className="text-xs text-red-500">
                      {" "}
                      {errors.userName.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="w-full mb-4 md:w-1/2">
                <h1 className={`${headerStyle}`}>Email</h1>
                <input
                  type="text"
                  {...register("email")}
                  placeholder="Enter email"
                  className={`${inputStyle}`}
                />
                <div>
                  {errors.email && (
                    <span className="text-xs text-red-500">
                      {" "}
                      {errors.email.message}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className={`${fieldStyle}`}>
              <div className="w-full mb-4 md:w-1/2">
                <h1 className={`${headerStyle}`}>Password</h1>
                <div className="relative flex items-center justify-center w-full ">
                  <input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="Enter password"
                    className={`${inputStyle}`}
                  />
                  {showPassword ? (
                    <EyeSlashIcon
                      className="size-[24px] absolute right-3 cursor-pointer "
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  ) : (
                    <EyeIcon
                      className="size-[24px] absolute right-3 cursor-pointer "
                      onClick={() => setShowPassword(!showPassword)}
                    />
                  )}
                </div>
                <div>
                  {errors.password && (
                    <span className="text-xs text-red-500">
                      {" "}
                      {errors.password.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full mb-4 md:w-1/2">
                <h1 className={`${headerStyle}`}>Confirm Password</h1>
                <div className="relative flex items-center justify-center w-full ">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    placeholder="Confirm password"
                    className={`${inputStyle}`}
                  />
                  {showConfirmPassword ? (
                    <EyeSlashIcon
                      className="size-[24px] absolute right-3 cursor-pointer "
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    />
                  ) : (
                    <EyeIcon
                      className="size-[24px] absolute right-3 cursor-pointer "
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    />
                  )}
                </div>
                <div>
                  {errors.confirmPassword && (
                    <span className="text-xs text-red-500">
                      {" "}
                      {errors.confirmPassword.message}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className={`${fieldStyle}`}>
              <div className="w-full mb-4 md:w-1/2">
                <h1 className={`${headerStyle}`}>Contact</h1>
                <input
                  type="text"
                  {...register("contact")}
                  placeholder="Enter contact number"
                  className={`${inputStyle}`}
                />
                <div>
                  {errors.contact && (
                    <span className="text-xs text-red-500">
                      {" "}
                      {errors.contact.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full mb-4 md:w-1/2">
                <h1 className={`${headerStyle}`}>Position</h1>
                <div className="relative">
                  <Controller
                    name="position"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full  lg:h-[56px] md:h-10 p-2 bg-gray-300 rounded-lg"
                      >
                        <option value="" hidden>
                          Select Position
                        </option>
                        <option value="" disabled>
                          Select Position
                        </option>
                        {roleOptions.length === 0 ? (
                          <option disabled>No position added yet</option>
                        ) : (
                          roleOptions.map((option) => (
                            <option key={option.id} value={option.value}>
                              {option.label}
                            </option>
                          ))
                        )}
                      </select>
                    )}
                  />
                  
            {positionError && (
              <div className="flex items-start justify-start text-red-500">
                {positionError}
              </div>
            )}
                  <div>
                    {errors.position && (
                      <span className="text-xs text-red-500">
                        {errors.position.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className={`${fieldStyle}`}>
              <div className="w-full mb-4 md:w-1/2">
                <h1 className={`${headerStyle}`}>Branch Code</h1>
                <div className="relative">
                  <Controller
                    name="branchCode"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="w-full p-2 lg:h-[56px] md:h-10 bg-gray-300 rounded-lg"
                        onChange={(e) => {
                          field.onChange(e);
                          handleBranchCodeChange(Number(e.target.value));
                        }}
                      >
                        <option value="" hidden>
                          Select branch
                        </option>
                        <option value="" disabled>
                          Select branch
                        </option>
                        {branchList.length > 0 ? (
                          branchList.map((branch) => (
                            <option key={branch.id} value={branch.id}>
                              {branch.branch_code}
                            </option>
                          ))
                        ) : (
                          <option value="" disabled>
                            No branch codes available
                          </option>
                        )}
                      </select>
                    )}
                  />
                  {errors.branchCode && (
                    <span className="text-xs text-red-500">
                      {errors.branchCode.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full mb-4 md:w-1/2">
                <h1 className={`${headerStyle}`}>Branch</h1>
                <Controller
                  name="branch"
                  control={control}
                  render={({ field }) => (
                    <input
                      {...field}
                      readOnly
                      className="w-full lg:h-[56px] md:h-10 p-2 bg-gray-300 rounded-lg"
                    />
                  )}
                />
                {errors.branch && (
                  <span className="text-xs text-red-500">
                    {errors.branch.message}
                  </span>
                )}
              </div>
            </div>

            <div className={`${fieldStyle}`}>
              <div className="flex flex-col w-full mb-4 md:w-1/2">
                <h1 className={`${headerStyle}`}>Signature</h1>
                <SignatureCanvas
                  penColor="black"
                  ref={(ref) => setSignature(ref)}
                  canvasProps={{
                    className: "sigCanvas border border-black h-36 w-full",
                  }}
                />
                {signatureEmpty && (
                  <span className="text-xs text-red-500">
                    Please provide a signature.
                  </span>
                )}
                <button
                  onClick={(e) => handleClear(e)}
                  className="p-1 mt-2 bg-gray-300 rounded-lg"
                >
                  Clear
                </button>
              </div>
              <div className="w-full mb-4 md:w-1/2">
                <h1 className={`${headerStyle}`}>Employee ID</h1>
                <input
                  type="text"
                  {...register("employee_id")}
                  placeholder="Enter your employee ID"
                  className={`${inputStyle}`}
                />
                <div>
                  {errors.employee_id && (
                    <span className="text-xs text-red-500">
                      {" "}
                      {errors.employee_id.message}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              {Array.isArray(errorMessage) && errorMessage.length > 0 && (
                <div className="text-xs text-red-500">
                  {errorMessage.map((message, index) => (
                    <p key={index}>{message}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="relative flex items-center justify-center">
              <button
                className="bg-primary text-white px-4 rounded-lg w-full lg:h-[56px] h-10"
                type="submit"
                onClick={() => setLoading(!loading)}
              >
                {!loading && "Register"}
              </button>
              {loading ? (
                <BounceLoader color="#FFFFFF" className="absolute" />
              ) : null}
            </div>
          </form>
          <Link to="/login">
            <div className="flex flex-row justify-center mt-4 ">
              <p className="italic text-center">Already have an account? </p>
              <p className="pl-2 italic font-bold underline text-primary">
                Log In
              </p>
            </div>
          </Link>
        </div>
      </div>
      <div className="items-center justify-center hidden w-1/2 lg:block">
        <img className="object-cover w-full h-screen" src={Slice} alt="" />
      </div>
    </div>
  );
};

export default Registration;
