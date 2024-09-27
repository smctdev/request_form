import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import Slice from "./assets/Slice.png";
import building from "./assets/building.jpg";
import Select from "react-select";
import { useForm, Controller, set } from "react-hook-form";
import { z, ZodType } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { error } from "console";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import BounceLoader from "react-spinners/ClipLoader";
import SignaturePad from "react-signature-pad-wrapper";
import SignatureCanvas from "react-signature-canvas";
import {
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import { sign } from "crypto";

type UserCredentials = z.infer<typeof schema>;

const roleOptions = [
  { label: "", value: "" },
  { label: "Accounting Clerk", value: "Accounting Clerk" },
  { label: "Accounting Manager", value: "Accounting Manager" },
  { label: "Accounting Staff", value: "Accounting Staff" },
  { label: "Accounting Supervisor", value: "Accounting Supervisor" },
  { label: "Area Manager", value: "Area Manager" },
  { label: "Assistant Manager", value: "Assistant Manager" },
  { label: "Assistant Web Developer", value: "Assistant Web Developer" },
  { label: "Audit Manager", value: "Audit Manager" },
  { label: "Audit Staff", value: "Audit Staff" },
  { label: "Audit Supervisor", value: "Audit Supervisor" },
  { label: "Automation Staff", value: "Automation Staff" },
  { label: "AVP - Finance", value: "AVP - Finance" },
  { label: "AVP - Sales and Marketing", value: "AVP - Sales and Marketing" },
  { label: "Branch Supervisor/Manager", value: "Branch Supervisor/Manager" },
  { label: "Cashier", value: "Cashier" },
  { label: "CEO", value: "CEO" },
  { label: "HR Manager", value: "HR Manager" },
  { label: "HR Staff", value: "HR Staff" },
  { label: "IT Staff", value: "IT Staff" },
  { label: "IT/Automation Manager", value: "IT/Automation Manager" },
  { label: "Junior Web Developer", value: "Junior Web Developer" },
  { label: "Managing Director", value: "Managing Director" },
  { label: "Payroll Manager", value: "Payroll Manager" },
  { label: "Payroll Staff", value: "Payroll Staff" },
  { label: "Sales Representative", value: "Sales Representative" },
  { label: "Senior Web Developer", value: "Senior Web Developer" },
  { label: "Vice President", value: "Vice President" },

];

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
const inputStyle = "w-full  lg:h-[56px] md:h-10  p-2 bg-gray-300 rounded-lg  autofill-input text-black";

const Registration: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [signature, setSignature] = useState<SignatureCanvas | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [signatureEmpty, setSignatureEmpty] = useState(false);
  const sigCanvasRef = useRef<SignatureCanvas | null>(null);
  const [errorMessage, setErrorMessage] = useState<string[]>([]);
  const [branchList, setBranchList] = useState<
    { id: number; branch_code: string; branch: string }[]
  >([]);
  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        const response = await axios.get(
          `http://122.53.61.91:6002/api/view-branch`
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
        "http://122.53.61.91:6002/api/register",
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
        alert("Success");
        window.setTimeout(() => {
          navigate("/login"); // Navigate to login after successful registration
        }, 2000);
      } else {
        const errors = response.data.errors;
        const message = [];

        if (errors.email) {
          message.push(...errors.email);
        }
        if (errors.employee_id) {
          message.push(...errors.employee_id);
        }
        setErrorMessage(message);

        setLoading(false);
      }
    } catch (error) {
      console.error("Registration Error:", error);
      alert("An error occurred during the registration process.");
      setLoading(false);
    }
  };

  const onSubmit = (data: UserCredentials) => {
    submitData(data);
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
    <div className="flex flex-col lg:flex-row items-center justify-center text-black bg-[#FFFFFF]" >
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <img
          className="hidden md:block absolute inset-0 object-cover w-full h-screen lg:hidden z-0"
          src={building}
          alt="photo"
        />
        <div className="w-full  bg-white   lg:p-8 p-4  lg:mt-0  mt-20 rounded-lg z-10 lg:m-0 m-10">
          
          <h1 className="text-primary font-bold lg:text-[32px] md:text-2xl mb-6 text-left">
            ACCOUNT REGISTRATION
          </h1>
          <form onSubmit={handleSubmit(submitData, () => setLoading(false))}>
            <div className={`${fieldStyle}`}>
              <div className="w-full md:w-1/2 mb-4 ">
                <h1 className={`${headerStyle}`}>First Name</h1>
                <input
                  type="text"
                  {...register("firstName")}
                  placeholder="Enter first name"
                  className={`${inputStyle}`}
                />
                <div>
                  {errors.firstName && (
                    <span className="text-red-500 text-xs">
                      {" "}
                      {errors.firstName.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full md:w-1/2 mb-4">
                <h1 className={`${headerStyle}`}>Last Name</h1>
                <input
                  type="text"
                  {...register("lastName")}
                  placeholder="Enter last name"
                  className={`${inputStyle}`}
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs">
                    {" "}
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
            <div className={`${fieldStyle}`}>
              <div className="w-full md:w-1/2 mb-4">
                <h1 className={`${headerStyle}`}>Username</h1>
                <input
                  type="text"
                  {...register("userName")}
                  placeholder="Enter username"
                  className={`${inputStyle}`}
                />
                <div>
                  {errors.userName && (
                    <span className="text-red-500 text-xs">
                      {" "}
                      {errors.userName.message}
                    </span>
                  )}
                </div>
              </div>

              <div className="w-full md:w-1/2 mb-4">
                <h1 className={`${headerStyle}`}>Email</h1>
                <input
                  type="text"
                  {...register("email")}
                  placeholder="Enter email"
                  className={`${inputStyle}`}
                />
                <div>
                  {errors.email && (
                    <span className="text-red-500 text-xs">
                      {" "}
                      {errors.email.message}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className={`${fieldStyle}`}>
              <div className="w-full md:w-1/2 mb-4">
                <h1 className={`${headerStyle}`}>Password</h1>
                <div className=" flex justify-center items-center relative w-full ">
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
                    <span className="text-red-500 text-xs">
                      {" "}
                      {errors.password.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full md:w-1/2 mb-4">
                <h1 className={`${headerStyle}`}>Confirm Password</h1>
                <div className=" flex justify-center items-center relative w-full ">
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
                    <span className="text-red-500 text-xs">
                      {" "}
                      {errors.confirmPassword.message}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className={`${fieldStyle}`}>
              <div className="w-full md:w-1/2 mb-4">
                <h1 className={`${headerStyle}`}>Contact</h1>
                <input
                  type="text"
                  {...register("contact")}
                  placeholder="Enter contact number"
                  className={`${inputStyle}`}
                />
                <div>
                  {errors.contact && (
                    <span className="text-red-500 text-xs">
                      {" "}
                      {errors.contact.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full md:w-1/2 mb-4">
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
                        <option value="">Select Position</option>
                        {roleOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  <div>
                    {errors.position && (
                      <span className="text-red-500 text-xs">
                        {errors.position.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className={`${fieldStyle}`}>
              <div className="w-full md:w-1/2 mb-4">
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
                        <option value="">Select branch</option>
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
                    <span className="text-red-500 text-xs">
                      {errors.branchCode.message}
                    </span>
                  )}
                </div>
              </div>
              <div className="w-full md:w-1/2 mb-4">
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
                  <span className="text-red-500 text-xs">
                    {errors.branch.message}
                  </span>
                )}
              </div>
            </div>

            <div className={`${fieldStyle}`}>
              <div className="w-full md:w-1/2 mb-4 flex flex-col">
                <h1 className={`${headerStyle}`}>Signature</h1>
                <SignatureCanvas
                  penColor="black"
                  ref={(ref) => setSignature(ref)}
                  canvasProps={{
                    className: "sigCanvas border border-black h-36 w-full",
                  }}
                />
                {signatureEmpty && (
                  <span className="text-red-500 text-xs">
                    Please provide a signature.
                  </span>
                )}
                <button
                  onClick={(e) => handleClear(e)}
                  className="bg-gray-300 p-1 mt-2 rounded-lg"
                >
                  Clear
                </button>
              </div>
              <div className="w-full md:w-1/2 mb-4">
                <h1 className={`${headerStyle}`}>Employee ID</h1>
                <input
                  type="text"
                  {...register("employee_id")}
                  placeholder="Enter your employee ID"
                  className={`${inputStyle}`}
                />
                <div>
                  {errors.employee_id && (
                    <span className="text-red-500 text-xs">
                      {" "}
                      {errors.employee_id.message}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-center">
              {Array.isArray(errorMessage) && errorMessage.length > 0 && (
                <div className="text-red-500 text-xs">
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
              <p className="text-center italic">Already have an account? </p>
              <p className="pl-2 italic font-bold text-primary underline">
                Log In
              </p>
            </div>
          </Link>
        </div>
      </div>
      <div className="hidden lg:block w-1/2  items-center justify-center">
        <img className="object-cover h-screen w-full" src={Slice} alt="photo" />
      </div>
    </div>
  );
};

export default Registration;
