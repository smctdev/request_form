import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";
import { set } from "react-hook-form";
import { Chip } from "@mui/material";

type User = {
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

type Branch = {
  id: number;
  branch: string;
  branch_code: string;
};

const AddBranchHeadModal = ({
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
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranches, setSelectedBranches] = useState<number[]>([]);
  const [isButtonVisible, setIsButtonVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
          .filter((item: User) => item.position.trim() === "Area Manager")
          .map((item: User) => ({
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
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token is missing");
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

        setBranches(response.data.data);
      } catch (error) {
        console.error("Error fetching branches:", error);
        setError("Failed to fetch branches");
        setBranches([]);
      }
    };

    if (selectedUser) {
      fetchBranches();
    } else {
      setBranches([]);
    }
  }, [selectedUser]);

  useEffect(() => {
    // Check if at least one branch is selected
    setIsButtonVisible(selectedBranches.length > 0);
  }, [selectedBranches]);

  const handleCheckboxChange = (id: number) => {
    if (selectedBranches.includes(id)) {
      setSelectedBranches(
        selectedBranches.filter((branchId) => branchId !== id)
      );
    } else {
      setSelectedBranches([...selectedBranches, id]);
    }
  };

  const handleConfirmSelection = async () => {
    if (selectedUser && selectedBranches.length > 0) {
      setIsLoading(true);

      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token is missing");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // Example of POST request to add branch head with selectedBranches
        const postData = {
          user_id: selectedUser.id,
          branch_id: selectedBranches, // Ensure this is an array of branch IDs
        };

        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/create-branch-head`,
          postData,
          {
            headers,
          }
        );

        // Assuming successful, close modal or show success message
        setIsLoading(false);
        closeModal();
        openCompleteModal(); // Implement your completion modal or alert
        refreshData(); // Refresh parent data if needed
      } catch (error) {
        console.error("Error creating branch head:", error);
        setIsLoading(false);
        // Handle error state or show error message
      }
    } else {
      // Handle case where user or branches are not selected
      console.warn("Please select a user and at least one branch.");
    }
  };

  const handleCancel = () => {
    setSelectedUser(null);
    setSelectedBranches([]);
    closeModal();
  };

  if (!modalIsOpen) {
    return null;
  }
  const handleRemoveBranch = (branchIdToRemove: number) => {
    setSelectedBranches(
      selectedBranches.filter((id) => id !== branchIdToRemove)
    );
  };
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 flex-col">
      <div className="p-4 w-10/12 sm:w-1/3 relative bg-primary flex justify-center mx-20 border-b rounded-t-[12px]">
        <h2 className="text-center text-xl md:text-[32px] font-bold text-white">
          Add {entityType}
        </h2>
        <XMarkIcon
          className="size-6 text-black absolute right-3 cursor-pointer"
          onClick={closeModal}
        />
      </div>
      <div className="bg-white w-10/12 sm:w-1/3 x-20 overflow-y-auto h-2/3 relative">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <ClipLoader size={35} color={"#123abc"} loading={loading} />
          </div>
        ) : error ? (
          <div className="text-red-500 p-4">
            <ClipLoader size={35} color={"#123abc"} />
          </div>
        ) : (
          <div>
            {selectedUser ? (
              <div className="bg-white flex-col w-10/12 sm:w-full h-1/2 rounded-b-[12px] shadow-lg p-2 bottom-4 right-4 flex space-x-2">
                <h3 className="text-lg font-bold p-4">
                  Branches for {`${selectedUser.name} `}:
                </h3>
                <input
                  type="text"
                  placeholder="Search branches..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="p-2 mb-2  border border-gray-300 rounded-md "
                />
                <div className="mt-4 mb-4 px-4">
                  {selectedBranches.map((branchId) => {
                    const branch = branches.find((b) => b.id === branchId);
                    return (
                      <Chip
                        key={branchId}
                        label={
                          <div className="flex flex-col">
                            <span className="text-white">
                              {branch?.branch_code}
                            </span>
                          </div>
                        }
                        onDelete={() => handleRemoveBranch(branchId)}
                        deleteIcon={<XMarkIcon className="h-4 w-4 stroke-white" />}
                        sx={{
                          marginBottom: "5px",
                          marginRight: "2px",
                          backgroundColor: "#389df1"
                        }}
                      />
                    );
                  })}
                </div>
                <div className="px-4">
                  {branches.length === 0 ? (
                    <ClipLoader size={35} color={"#123abc"} loading={loading} />
                  ) : (
                    branches
                      .filter((branch) => {
                        const branchName = branch.branch.toLowerCase();
                        const branchCode = branch.branch_code.toLowerCase();
                        const query = searchQuery.toLowerCase();
                        return (
                          branchName.includes(query) ||
                          branchCode.includes(query)
                        );
                      })
                      .map((branch) => (
                        <div
                          key={branch.id}
                          className="flex items-center justify-between mb-2 bg-blue-100"
                        >
                          <div className="flex w-full items-center justify-between p-4">
                            <div>
                              <p>{branch.branch}</p>
                              <p>{branch.branch_code}</p>
                            </div>
                            <div>
                              <input
                                type="checkbox"
                                checked={selectedBranches.includes(branch.id)}
                                onChange={() => handleCheckboxChange(branch.id)}
                                className="size-5 text-blue-500 cursor-pointer mx-1"
                              />
                            </div>
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            ) : (
              <div>
                <div className="px-4">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr
                          key={user.id}
                          className={`cursor-pointer hover:bg-gray-200  ${
                            selectedUser === user.id ? "bg-blue-200" : ""
                          }`}
                          onClick={() => setSelectedUser(user)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {user.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {`${user.name}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {user.email}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="bg-white w-10/12 sm:w-1/3 rounded-b-[12px] shadow-lg p-2 bottom-4 right-4 justify-end flex space-x-2">
        <button
          onClick={handleCancel}
          className="bg-gray-500 text-white font-bold h-12 py-2 px-4 rounded cursor-pointer"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirmSelection}
          className="bg-primary text-white h-12 font-bold py-2 px-4 rounded cursor-pointer"
        >
          {isLoading ? <ClipLoader color="#36d7b7" /> : "Add Branch Head"}
        </button>
      </div>
    </div>
  );
};
export default AddBranchHeadModal;
