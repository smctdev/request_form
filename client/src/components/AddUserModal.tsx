import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useForm, Controller, set } from "react-hook-form";
import { z, ZodType } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { error } from "console";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import {
  EyeIcon,
  EyeSlashIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";

type UserCredentials = z.infer<typeof schema>;
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
    role: z.string().nonempty(),
    position: z.string().nonempty(),
    branch: z.string().nonempty(),
    employee_id: z.string().min(2).max(30),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
const positionOptions = [
  { label: "Approver", value: "approver" },
  { label: "User", value: "User" },
  { label: "Admin", value: "Admin" },
];
const roleOptions = [
  { label: "Accounting Clerk", value: "Accounting Clerk" },
  { label: "Accounting Manager", value: "Accounting Manager" },
  { label: "Accounting Staff", value: "Accounting Staff" },
  { label: "Accounting Supervisor", value: "Accounting Supervisor" },
  { label: "Admin", value: "Admin" },
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
  { label: "Vice - President", value: "Vice - President" },
  { label: "User", value: "User" },
];

const AddUserModal = ({
  modalIsOpen,
  closeModal,
  openCompleteModal,
  entityType,
  refreshData,
}: {
  modalIsOpen: boolean;
  closeModal: any;
  openCompleteModal: any;
  entityType: string;
  refreshData: () => void;
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [branchList, setBranchList] = useState<
    { id: number; branch_code: string; branch: string }[]
  >([]);
  const {
    control,
    register,
    reset,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<UserCredentials>({
    resolver: zodResolver(schema),
  });

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

  if (!modalIsOpen) {
    return null;
  }

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
  const capitalizeWords = (str: string) => {
    return str.replace(
      /\b\w+/g,
      (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    );
  };
  // Check form state details

  const submitData = async (data: UserCredentials) => {
    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/register`,
        {
          email: data.email,
          password: data.password,
          userName: data.userName,
          firstName: data.firstName,
          lastName: data.lastName,
          contact: data.contact,
          branch_code: data.branchCode,
          confirmPassword: data.password,
          position: data.position,
          role: data.role,
          branch: data.branch,
          employee_id: data.employee_id,
        }
      );

      if (response.data.status) {
        openCompleteModal();
        refreshData();
        reset();
      } else {
        alert("Registration failed. Please check your details and try again.");
      }
    } catch (error) {
      console.error("Registration Error:", error);
      alert("An error occurred during the registration process.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (data: UserCredentials) => {
    submitData(data);
  };
  const pStyle = "font-medium w-full";
  const inputStyle = "border border-black rounded-md p-1 w-full";
  return (
    modalIsOpen && (
      <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 flex-col ">
        <div className=" p-4  w-7/12 md:w-2/5  relative bg-primary flex justify-center mx-20  border-b rounded-t-[12px]">
          <h2 className="text-center text-xl md:text-[32px] font-bold text-white">
            Add {entityType}
          </h2>
          <XMarkIcon
            className="size-6 text-white absolute right-3 cursor-pointer"
            onClick={closeModal}
          />
        </div>
        <div className="bg-white w-7/12 md:w-2/5 x-20 rounded-b-[12px] shadow-lg  overflow-y-auto  h-2/3">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg mt-2">

              {/* Form Fields */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    {...register("firstName")}
                    placeholder="Enter first name"
                    className="input input-bordered bg-white w-full mt-2"
                  />
                  {errors.firstName && (
                    <span className="text-red-500 text-xs">
                      {errors.firstName.message}
                    </span>
                  )}
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    {...register("lastName")}
                    placeholder="Enter last name"
                    className="input input-bordered bg-white w-full mt-2"
                  />
                  {errors.lastName && (
                    <span className="text-red-500 text-xs">
                      {errors.lastName.message}
                    </span>
                  )}
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="text"
                    {...register("email")}
                    placeholder="Enter email"
                    className="input input-bordered bg-white w-full mt-2"
                  />
                  {errors.email && (
                    <span className="text-red-500 text-xs">
                      {errors.email.message}
                    </span>
                  )}
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    type="text"
                    {...register("userName")}
                    placeholder="Enter username"
                    className="input input-bordered bg-white w-full mt-2"
                  />
                  {errors.userName && (
                    <span className="text-red-500 text-xs">
                      {errors.userName.message}
                    </span>
                  )}
                </div>

                {/* Contact Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Contact
                  </label>
                  <input
                    type="text"
                    {...register("contact")}
                    placeholder="Enter contact number"
                    className="input input-bordered bg-white w-full mt-2"
                  />
                  {errors.contact && (
                    <span className="text-red-500 text-xs">
                      {errors.contact.message}
                    </span>
                  )}
                </div>

                {/* Branch Code */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Branch Code
                  </label>
                  <Controller
                    name="branchCode"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="select select-bordered bg-white w-full mt-2"
                        onChange={(e) => {
                          field.onChange(e);
                          handleBranchCodeChange(Number(e.target.value));
                        }}
                      >
                        <option value="" hidden>Select branch</option>
                        <option value="" disabled>Select branch</option>
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

                {/* Branch */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Branch
                  </label>
                  <Controller
                    name="branch"
                    control={control}
                    render={({ field }) => (
                      <input
                        {...field}
                        readOnly
                        className="input input-bordered bg-white w-full mt-2"
                      />
                    )}
                  />
                  {errors.branch && (
                    <span className="text-red-500 text-xs">
                      {errors.branch.message}
                    </span>
                  )}
                </div>

                {/* Employee ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Employee ID
                  </label>
                  <input
                    type="text"
                    {...register("employee_id")}
                    placeholder="Enter your employee ID"
                    className="input input-bordered bg-white w-full mt-2"
                  />
                  {errors.employee_id && (
                    <span className="text-red-500 text-xs">
                      {errors.employee_id.message}
                    </span>
                  )}
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <Controller
                    name="role"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="select select-bordered bg-white w-full mt-2"
                      >
                        <option value="" hidden>Select Role</option>
                        <option value="" disabled>Select Role</option>
                        {positionOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.role && (
                    <span className="text-red-500 text-xs">
                      {errors.role.message}
                    </span>
                  )}
                </div>

                {/* Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Position
                  </label>
                  <Controller
                    name="position"
                    control={control}
                    render={({ field }) => (
                      <select
                        {...field}
                        className="select select-bordered bg-white w-full mt-2"
                      >
                        <option value="" hidden>Select Position</option>
                        <option value="" disabled>Select Position</option>
                        {roleOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    )}
                  />
                  {errors.position && (
                    <span className="text-red-500 text-xs">
                      {errors.position.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Password Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mt-6">
                  Password
                </h3>
                <div className="border-t my-4"></div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Enter Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        {...register("password")}
                        placeholder="Enter password"
                        className="input input-bordered bg-white w-full mt-2"
                      />
                      {showPassword ? (
                        <EyeSlashIcon
                          className="size-[24px] absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                          onClick={() => setShowPassword(!showPassword)}
                        />
                      ) : (
                        <EyeIcon
                          className="size-[24px] absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                          onClick={() => setShowPassword(!showPassword)}
                        />
                      )}
                    </div>
                    {errors.password && (
                      <span className="text-red-500 text-xs">
                        {errors.password.message}
                      </span>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        {...register("confirmPassword")}
                        placeholder="Confirm password"
                        className="input input-bordered bg-white w-full mt-2"
                      />
                      {showConfirmPassword ? (
                        <EyeSlashIcon
                          className="size-[24px] absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        />
                      ) : (
                        <EyeIcon
                          className="size-[24px] absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                        />
                      )}
                    </div>
                    {errors.confirmPassword && (
                      <span className="text-red-500 text-xs">
                        {errors.confirmPassword.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2 items-center mt-8">
                <button
                  type="button"
                  className="btn btn-secondary bg-gray-500 border-gray-500 hover:bg-gray-600 hover:border-gray-600 w-24"
                  onClick={() => closeModal()}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`btn btn-primary bg-blue-500 border-blue-500 hover:bg-blue-600 hover:border-blue-600 text-white hover:text-white w-1/3`}
                >
                  {loading ? "Submitting..." : "Add User"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  );
};
export default AddUserModal;
