import React, { useState, useEffect } from "react";
import { XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { set, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

type Record = {
  id: number;
  name: string;
  firstname: string;
  lastname: string;
  branch_code: string;
  email: string;
  role: string;
  contact: string;
  position: string;
};

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
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const AddApproverModal = ({
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
  const [isLoading, setisLoading] = useState(false);
  const [users, setUsers] = useState<Record[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [filterTerm, setFilterTerm] = useState("");
  useEffect(() => {
    const fetchUsers = async () => {
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
          `${process.env.REACT_APP_API_BASE_URL}/view-users`,
          {
            headers,
          }
        );

        // Filter and map data to desired format
        const transformedData = response.data.data
          .filter((item: Record) => item.role.trim() === "User")
          .map((item: Record) => ({
            id: item.id,
            name: `${item.firstname} ${item.lastname}`,
            branch_code: item.branch_code,
            email: item.email,
            role: item.role.trim(),
            position: item.position,
          }));

        setUsers(transformedData);
      } catch (error) {
        console.error("Error fetching users data:", error);
      }
    };

    if (modalIsOpen) {
      fetchUsers();
    }
  }, [modalIsOpen]);

  const filteredApproverlist = users.filter((user) =>
    Object.values(user).some((value) =>
      String(value).toLowerCase().includes(filterTerm.toLowerCase())
    )
  );

  useEffect(() => {
    // Check if at least one user is selected
    setIsButtonVisible(selectedUsers.length > 0);
  }, [selectedUsers]);

  const handleCheckboxChange = (userId: number) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleConfirmSelection = async () => {
    try {
      setisLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token is missing");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // Prepare the data to send to the backend
      const data = {
        role: "approver", // Replace with the actual role value you want to update
        userIds: selectedUsers, // Send selected user IDs to update
      };

      // Send PUT request to update roles
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/update-role`, // Assuming your API endpoint structure (no IDs in the URL)
        data,
        { headers }
      );
      setisLoading(false);
      openCompleteModal();
      refreshData();
      setSelectedUsers([]);

      // Optionally handle success message or UI updates after successful update
    } catch (error) {
      setisLoading(false);
      console.error("Error updating role:", error);
      // Handle error state or show error message to the user
    }
  };

  const handleCancel = () => {
    // Reset all selected users
    setSelectedUsers([]);
  };

  if (!modalIsOpen) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 flex-col  ">
      <div className="p-4  w-10/12 md:w-1/2 lg:w-1/3 relative bg-primary flex justify-center mx-20  border-b rounded-t-[12px]">
        <h2 className="text-center  text-xl md:text-[32px] font-bold text-white">
          Add {entityType}
        </h2>
        <XMarkIcon
          className="size-6 text-black absolute right-3 cursor-pointer"
          onClick={closeModal}
        />
      </div>

      <div className="bg-white w-10/12 md:w-1/2 lg:w-1/3 x-20 overflow-y-auto overflow-x-hidden h-2/3 relative">
        <div className="sm:mx-0 md:mx-4 sm:px-5 lg:px-5 lg:mx-0 my-2 relative w-full">
          <div className="relative flex-grow">
            <input
              type="text"
              className="border bg-white border-black rounded-md pl-10 pr-3 py-2 w-full"
              value={filterTerm}
              onChange={(e) => setFilterTerm(e.target.value)}
              placeholder="Search approvers"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-black absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <ClipLoader size={35} color={"#123abc"} loading={loading} />
          </div>
        ) : (
          <div className="">
            {filteredApproverlist.map((user, index) => (
              <div
                key={user.id}
                className={`flex items-center justify-between mb-2 ${
                  index % 2 === 0 ? "bg-white" : "bg-blue-100"
                }`}
              >
                <div className="flex w-full items-center justify-between p-4">
                  <div>
                    <p>{user.name}</p>
                    <p>{user.email}</p>
                    <p>{user.position}</p>
                  </div>
                  <div>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.id)}
                      onChange={() => handleCheckboxChange(user.id)}
                      className="size-5 text-blue-500 cursor-pointer mx-1"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {isButtonVisible && (
        <div className="bg-white w-10/12 md:w-1/2 lg:w-1/4  rounded-b-[12px] shadow-lg p-2 bottom-4 right-4 flex space-x-2">
          <button
            onClick={handleConfirmSelection}
            className="bg-primary text-white  h-12 font-bold py-2 px-4 rounded cursor-pointer"
          >
            {isLoading ? <ClipLoader color="#36d7b7" /> : "Add Approver"}
          </button>
          <button
            onClick={handleCancel}
            className="bg-red-500 text-white font-bold  h-12 py-2 px-4 rounded cursor-pointer"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
};

export default AddApproverModal;
