import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";
import EyeSlashIcon from "@heroicons/react/24/solid/EyeSlashIcon";
import { EyeIcon } from "@heroicons/react/24/solid";
import { set } from "react-hook-form";

type EntityType = "User" | "Branch" | "Custom" | "Approver";
const EditUserModal = ({
  editModal,
  editModalClose,
  openSuccessModal,
  entityType,
  selectedUser,
  refreshData,
}: {
  editModal: boolean;
  editModalClose: any;
  openSuccessModal: any;
  entityType: EntityType;
  selectedUser: any;
  refreshData: any;
}) => {
  const [editedBranch, setEditedBranch] = useState<string>("");
  const [editedBranchCode, setEditedBranchCode] = useState<string>("");
  const [firstname, setFirstName] = useState<string>("");
  const [lastname, setLastName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [contact, setContact] = useState<string>("");
  const [editedRole, setEditedRole] = useState<string>("");
  const [editedPosition, setEditedPosition] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [notedBy, setNotedBy] = useState<number[]>([]);
  const [approvedBy, setApprovedBy] = useState<number[]>([]);
  const [approvers, setApprovers] = useState<any[]>([]);
  const [name, setName] = useState<string>("");
  const [branchList, setBranchList] = useState<
  { id: number; branch_code: string; branch: string }[]
>([]);

useEffect(() => {
  const fetchBranchData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token is missing");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/view-branch`,
        {
          headers,
        }
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

  useEffect(() => {
    if (entityType === "Custom") {
      const userId = localStorage.getItem("id");
      const fetchApprovers = async () => {
        try {
          setLoading(true);
          const response = await axios.get(
           `${process.env.REACT_APP_API_BASE_URL}/view-approvers/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          );
          const allApprovers = [
            ...(response.data.HOApprovers || []),
            ...(response.data.areaManagerApprover || []),
            ...(response.data.sameBranchApprovers || [])
          ];
  
          // Update state with the combined approvers data
          setApprovers(allApprovers);
        

          setLoading(false);
        } catch (error) {
          console.error("Error fetching approvers:", error);
          setLoading(false);
        }
      };

      fetchApprovers();
    }
  }, []);
  useEffect(() => {
    if (editModal && selectedUser) {
      setName(selectedUser.name || "");
      // Set the approvedBy state when the modal opens
      setApprovedBy(selectedUser.approved_by || []);
      setNotedBy(selectedUser.noted_by || []);
    }
  }, [editModal, selectedUser]);
  const toggleNotedBy = (userId: number) => {
    setNotedBy((prevNotedBy) =>
      prevNotedBy.includes(userId)
        ? prevNotedBy.filter((id) => id !== userId)
        : [...prevNotedBy, userId]
    );
  };

  const toggleApprovedBy = (userId: number) => {
    setApprovedBy((prevApprovedBy) =>
      prevApprovedBy.includes(userId)
        ? prevApprovedBy.filter((id) => id !== userId)
        : [...prevApprovedBy, userId]
    );
  };

  useEffect(() => {
    if (selectedUser) {
      setFirstName(selectedUser.firstname || "");
      setLastName(selectedUser.lastname || "");
      setEmail(selectedUser.email || "");
      setUsername(selectedUser.username || "");
      setContact(selectedUser.contact || "");
      setEditedBranch(selectedUser.branch || "");
      setEditedBranchCode(selectedUser.branch_code );
      setEditedRole(selectedUser.role || "");
      setEditedPosition(selectedUser.position || "");
    }
  }, [selectedUser]);
  
  const handleCancel = () => {
    // Reset state to selectedUser data
    if (selectedUser) {
      setFirstName(selectedUser.firstname);
      setLastName(selectedUser.lastname);
      setEmail(selectedUser.email);
      setUsername(selectedUser.username);
      setContact(selectedUser.contact);
      setEditedBranch(selectedUser.branch);
      setEditedBranchCode(selectedUser.branch_code);
      setEditedRole(selectedUser.role);
      setEditedPosition(selectedUser.position);
    }
    editModalClose();
  };
  
  const handleBranchCodeChange = (selectedBranchId: number) => {
    const selectedBranch = branchList.find(
      (branch) => branch.id === selectedBranchId
    );
    setEditedBranchCode(selectedBranch?.id.toString() || "");
    console.log("brancfh", selectedBranch);
    if (selectedBranch) {
      setEditedBranch(selectedBranch.branch.toString());
    } else {
      setEditedBranch("Honda Des, Inc.");
    }
};




  const handleUpdate = async () => {
    // Validation based on entityType
    if (entityType === "User") {
      if (
        firstname.trim() === "" ||
        lastname.trim() === "" ||
        email.trim() === "" ||
        username.trim() === "" ||
        contact.trim() === "" ||
        editedBranch.trim() === "" ||
        editedBranchCode.trim() === "" ||
        editedRole.trim() === "" ||
        editedPosition.trim() === ""
      ) {
        setErrorMessage("Please fill out all required fields.");
        return;
      }
    } else if (entityType === "Branch") {
      if (editedBranch.trim() === "" || editedBranchCode.trim() === "") {
        setErrorMessage("Please fill out all required fields.");
        return;
      }
    } else if (entityType === "Custom") {
      if (notedBy.length === 0 || approvedBy.length === 0) {
        setErrorMessage(
          "You must select at least one noted by and one approved by."
        );
        return;
      }
    } else {
      setErrorMessage("Invalid entity type.");
      return;
    }

    // Check if password is entered and matches confirmPassword
    if (password.trim() !== confirmPassword.trim()) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Define type for updatedData
      interface UpdatedData {
        id: any;
        firstName: string;
        lastName: string;
        email: string;
        userName: string;
        contact: string;
        branch?: string; // Optional for Branch entityType
        branch_code?: string; // Optional for Branch entityType
        role?: string; // Optional for User entityType
        position?: string; // Optional for User entityType
        password?: string; // Make password optional
        notedBy?: number[];
        approvedBy?: number[];
      }

      // Create updatedData object
      const updatedData: UpdatedData = {
        id: selectedUser.id,
        firstName: firstname,
        lastName: lastname,
        email: email,
        userName: username,
        contact: contact,
        branch:
          entityType === "Branch" || entityType === "User"
            ? editedBranch
            : undefined,
        branch_code:
          entityType === "Branch" || entityType === "User"
            ? editedBranchCode
            : undefined,

        role: entityType === "User" ? editedRole : undefined,
        position: entityType === "User" ? editedPosition : undefined,
        password: password.trim() !== "" ? password.trim() : undefined,
      };

      // Include password field only if a new password is provided
      if (password.trim() !== "") {
        updatedData.password = password.trim();
      }

      // Perform the API request based on entityType
      let response;
      if (entityType === "Branch") {
        response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/update-branch/${selectedUser.id}`,
          updatedData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      
      } else if (entityType === "User") {
        response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/update-profile/${selectedUser.id}`,
          updatedData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
      
      } else if (entityType === "Custom") {
        try {

       
          const response = await axios.post(
            `${process.env.REACT_APP_API_BASE_URL}/update-approvers/${selectedUser.id}`,
            {
              approved_by: approvedBy,
              noted_by: notedBy,
              name: name,
              // Include other fields as necessary
            },
            {
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            }
          );
        
        } catch (error) {
          console.error("Error updating approvers:", error);
        }
      }

      // Handle success
      refreshData();
      openSuccessModal();
      setErrorMessage(""); // Clear error message on success
    } catch (error) {
      setErrorMessage("Failed to update. Please try again.");
      console.error("Error updating:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!editModal) {
    return null;
  }

  const fieldsConfig: { [key: string]: string[] } = {
    User: [
      "Firstname",
      "Lastname",
      "Email",
      "Username",
      "Contact",
      "Position",
      "Role",
      "Branch Code",
      "Branch Name",
    ],
    Branch: ["Branch", "BranchCode"],
    Manager: ["Manager Name", "Manager ID", "Branch Code"],
  };

  const fields = fieldsConfig[entityType] || [];
  const pStyle = "font-medium w-full";
  const inputStyle = "border border-black bg-white rounded-md p-1 w-full";
  const roleOptions = [
    { label: "", value: "" },
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

  const branch = [
    "Des Strong Appliance, Inc.",
    "Des Strong Motors, Inc.",
    "Strong Motocentrum, Inc.",
    "Honda Des, Inc.",
    "Head Office",
  ];
  const positionOptions = [
    { label: "", value: "" },
    { label: "Approver", value: "approver" },
    { label: "User", value: "User" },
    { label: "Area Manager", value: "Area Manager" },
    { label: "Admin", value: "Admin" },
  ];



  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 flex-col">
      <div className="p-4 w-10/12 md:w-2/5 relative bg-primary flex justify-center mx-20 border-b rounded-t-[12px]">
        <h2 className="text-center text-xl md:text-[32px] font-bold text-white">
          Edit {entityType}
        </h2>
        <XMarkIcon
          className="size-6 text-black absolute right-3 cursor-pointer"
          onClick={handleCancel}
        />
      </div>
      <div className="bg-white h-2/3 w-10/12 md:w-2/5 x-20 rounded-b-[12px] shadow-lg overflow-y-auto sm:h-2/3">
        <div className="mx-10 mt-10 grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* Render input fields dynamically */}
          {fields.map((field, index) => (
            <div key={index}>
              <p className={`${pStyle}`}>{field}</p>
              {field === "Role" ? (
                <select
                  className={`${inputStyle}`}
                  value={editedRole}
                  onChange={(e) => setEditedRole(e.target.value)}
                >
                  {positionOptions.map((option, index) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              ) : field === "Branch Code" ? (
                <select
                  className={`${inputStyle}`}
                  value={editedBranchCode}
                  onChange={(e) => handleBranchCodeChange(Number(e.target.value))}
                >
                  <option value="">Select branch</option>
                      
                          {branchList.map((branch) => (
                            <option key={branch.id} value={branch.id}>
                              {branch.branch_code}
                            </option>
                          ))}
                     
                </select>
              ) : (
                <>
                  {field === "Position" ? (
                    <select
                      className={`${inputStyle}`}
                      value={editedPosition}
                      onChange={(e) => setEditedPosition(e.target.value)}
                    >
                      {roleOptions.map((option, index) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : field === "Branch Name" ? (
                    <input
                      className={`${inputStyle}`}
                      value={editedBranch}
                      readOnly
                    />
                  ) : field === "Branch" ? (
                    <select className={`${inputStyle}`} 
                    value={editedBranch}>
                      {" "}
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
                  ) : field === "BranchCode" ? (
                    <input
                      className={`${inputStyle}`}
                      value={editedBranchCode}
                      onChange={(e) => setEditedBranchCode(e.target.value)}
                    />
                  ) : (
                    <input
                      type="text"
                      className={`${inputStyle}`}
                      value={
                        field === "Firstname"
                          ? firstname
                          : field === "Lastname"
                          ? lastname
                          : field === "Email"
                          ? email
                          : field === "Username"
                          ? username
                          : field === "Contact"
                          ? contact
                          : field === "Branch Code"
                          ? branch
                          : field === "Branch Name"
                          ? branch
                          : ""
                      }
                      onChange={(e) =>
                        field === "Firstname"
                          ? setFirstName(e.target.value)
                          : field === "Lastname"
                          ? setLastName(e.target.value)
                          : field === "Email"
                          ? setEmail(e.target.value)
                          : field === "Username"
                          ? setUsername(e.target.value)
                          : field === "Contact"
                          ? setContact(e.target.value)
                          : null
                      }
                    />
                  )}
                </>
              )}
            </div>
          ))}
        
         
</div>
          {entityType === "Custom" && (
            <div className=" flex flex-col  mx-4 lg:mx-20 ">
           <div className="grid grid-cols-2 w-full">
                <div className="">
                  <p className={`${pStyle}`}>Name</p>
                  <input
                    type="text"
                    className="w-full border bg-white border-black rounded-md p-1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  {errorMessage && (
                    <p className="text-red-500">{errorMessage}</p>
                  )}
                </div>
                
                  </div>
                <div className="flex space-x-6 w-full">
               
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 mt-4 ">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Noted By
                </label>
                {approvers.map((person) => (
                  <div key={person.id} className="flex items-center py-1">
                    <input
                      type="checkbox"
                      id={`noted_by_${person.id}`}
                      checked={notedBy.includes(person.id)}
                      onChange={() => toggleNotedBy(person.id)}
                      className="mr-2 size-6 bg-white"
                    />
                    <label
                      htmlFor={`noted_by_${person.id}`}
                      className="text-lg"
                    >
                      {person.firstName} {person.lastName}
                    </label>
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Approved By
                </label>
                {approvers.map((person) => (
                  <div key={person.id} className="flex items-center py-1">
                    <input
                      type="checkbox"
                      id={`approved_by_${person.id}`}
                      checked={approvedBy.includes(person.id)}
                      onChange={() => toggleApprovedBy(person.id)}
                      className="mr-2 size-6 bg-white"
                    />
                    <label
                      htmlFor={`approved_by_${person.id}`}
                      className="text-lg"
                    >
                      {person.firstName} {person.lastName}
                    </label>
                  </div>
                ))}
              </div>
              </div>
            </div>
          )}
     
        <div className="mx-10 mt-4">
          {errorMessage && <p className="text-red-600">{errorMessage}</p>}
        </div>
        <div className="flex justify-center mx-10 mt-6 lg:justify-end items-center space-x-2 md:mt-20 md:mr-10 mb-10">
          <button
            className="bg-[#9C9C9C] p-2 w-full h-14 lg:w-1/4 rounded-[12px] text-white font-medium"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            className="bg-primary p-2 w-full h-14 lg:w-1/4 rounded-[12px] text-white font-medium"
            onClick={handleUpdate}
          >
            {loading ? <ClipLoader color="#36d7b7" /> : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;
