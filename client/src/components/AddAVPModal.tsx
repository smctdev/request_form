import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";

type User = {
  id: number;
  name: string;
  firstname: string;
  lastname: string;
  firstName: string;
  lastName: string;
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

const AddAVPModal = ({
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
  const [avpList, setAvpList] = useState<User[]>([]);
  const [selectedAVPStaff, setSelectedAVPStaff] = useState<User | null>(null);
  const [selectedAVP, setSelectedAVP] = useState<User | null>(null);

  useEffect(() => {
    const fetchAVP = async () => {
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
          `${process.env.REACT_APP_API_BASE_URL}/getAVP`,
          {
            headers,
          }
        );

        setAvpList(response.data.HOApprovers);
      } catch (error) {
        console.error("Error fetching users data:", error);
      }
    };

    if (modalIsOpen) {
      fetchAVP();
    }
  }, [modalIsOpen]);
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
          `${process.env.REACT_APP_API_BASE_URL}/getStaff`,
          {
            headers,
          }
        );

        setUsers(response.data.HOApprovers);
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
      setError(null);
    } else {
      setSelectedBranches([...selectedBranches, id]);
      setError(null);
    }
  };

  const handleConfirmSelection = async () => {
    if (selectedUser && selectedBranches.length > 0) {
      setIsLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("Token is missing");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const postData = {
          branch_id: selectedBranches,
          staff_id: selectedUser.id,
          user_id: selectedAVP?.id,
        };

        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/add-avpstaff-branch`,
          postData,
          {
            headers,
          }
        );

        setIsLoading(false);
        closeModal();
        openCompleteModal(); // Implement your completion modal or alert
        refreshData(); // Refresh parent data if needed
        setSelectedAVP(null);
        setSelectedBranches([]);
        setSelectedAVPStaff(null);
      } catch (error: unknown) {
        setIsLoading(false); // Ensure loading state is cleared

        if (axios.isAxiosError(error)) {
          // Check if the error has a response from the server
          if (error.response) {
            // Log the full error for debugging purposes
            console.error("Error response data:", error.response.data);

            // Set the error message from the backend
            setError(
              error.response.data.message || "An unexpected error occurred."
            );
          } else {
            // If there’s no response, log a general error
            console.error("Error creating area manager:", error.message);
            setError("An unexpected error occurred.");
          }
        } else {
          // Handle unexpected errors that are not AxiosErrors
          console.error("Unexpected error:", error);
          setError("An unexpected error occurred.");
        }
      }
    } else {
      // Handle case where user or branches are not selected
      console.warn("Please select a user and at least one branch.");
    }
  };

  const handleCancel = () => {
    setSelectedUser(null);
    setSelectedBranches([]);
    setSelectedAVP(null);
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
    <div className="fixed top-0 left-0 flex flex-col items-center justify-center w-full h-full bg-black bg-opacity-50">
      <div className="p-4 w-10/12 sm:w-1/3 relative bg-primary flex justify-center mx-20 border-b rounded-t-[12px]">
        <h2 className="text-center text-xl md:text-[32px] font-bold text-white">
          Add {entityType}
        </h2>
        <XMarkIcon
          className="absolute text-black cursor-pointer size-6 right-3"
          onClick={closeModal}
        />
      </div>

      <div className="relative w-10/12 overflow-y-auto bg-white sm:w-1/3 x-20 h-2/3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <ClipLoader size={35} color={"#123abc"} loading={loading} />
          </div>
        ) : (
          <div>
            {/* Step 1: Select AVP */}
            {selectedAVP ? (
              <>
                {/* Step 2: Select User */}
                {selectedAVP && !selectedUser ? (
                  <div className="px-4">
                    <h3 className="text-lg font-bold">
                      Select User for {`${selectedAVP?.firstName}`}
                    </h3>
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            ID
                          </th>
                          <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            Name
                          </th>
                          <th className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                            Email
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user: User) => (
                          <tr
                            key={user.id}
                            className={`cursor-pointer hover:bg-gray-200 `}
                            onClick={() => setSelectedUser(user)}
                          >
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 whitespace-nowrap">
                              {user.id}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {`${user.firstName} ${user.lastName}`}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                              {user.email}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <>
                    {/* Step 3: Select Branch */}
                    {selectedAVP && selectedUser && (
                      <div className="bg-white flex-col w-10/12 sm:w-full h-1/2 rounded-b-[12px] shadow-lg p-2 bottom-4 right-4 flex space-x-2">
                        <h3 className="p-4 text-lg font-bold">
                          Branches for {`${selectedUser?.firstName}`}:
                        </h3>
                        <input
                          type="text"
                          placeholder="Search branches..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="p-2 mb-2 border border-gray-300 rounded-md"
                        />

                        <div className="px-4">
                          {branches.length === 0 ? (
                            <ClipLoader
                              size={35}
                              color={"#123abc"}
                              loading={loading}
                            />
                          ) : (
                            branches
                              .filter((branch) => {
                                const branchName = branch.branch.toLowerCase();
                                const branchCode =
                                  branch.branch_code.toLowerCase();
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
                                  <div className="flex items-center justify-between w-full p-4">
                                    <div>
                                      <p>{branch.branch}</p>
                                      <p>{branch.branch_code}</p>
                                    </div>
                                    <div>
                                      <input
                                        type="checkbox"
                                        checked={selectedBranches.includes(
                                          branch.id
                                        )}
                                        onChange={() =>
                                          handleCheckboxChange(branch.id)
                                        }
                                        className="mx-1 text-blue-500 cursor-pointer size-5"
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="p-4">
                <h3 className="text-lg font-bold">Select AVP</h3>
                <div className="mt-2">
                  {avpList.map((avp) => (
                    <div
                      key={avp.id}
                      className="flex items-center justify-between mb-2"
                    >
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedAVP === avp.id}
                          onChange={() => setSelectedAVP(avp)}
                          className="form-checkbox"
                        />
                        <span>
                          {avp.firstName} {avp.lastName}
                        </span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      {/* Selected Branches Section */}
      {selectedBranches.length > 0 && (
        <div className="flex flex-col w-10/12 p-2 bg-white shadow-lg sm:w-1/3 bottom-4 right-4 ">
          <div className="flex flex-wrap gap-2 ">
            {selectedBranches.map((branchId) => {
              const branch = branches.find((b) => b.id === branchId);
              return (
                <div
                  key={branchId}
                  className="relative p-3 mb-2 bg-gray-300 rounded-sm"
                >
                  <XMarkIcon
                    className="absolute top-0 right-0 text-gray-500 cursor-pointer size-4"
                    onClick={() => handleRemoveBranch(branchId)}
                  />
                  <div>
                    <p>{branch?.branch}</p>
                    <p>{branch?.branch_code}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div>{error && <p className="text-red-500">{error}</p>}</div>
        </div>
      )}

      <div className="bg-white w-10/12 sm:w-1/3 rounded-b-[12px] shadow-lg p-2 bottom-4 right-4 flex justify-end space-x-2">
        <button
          onClick={handleCancel}
          className="h-12 px-4 py-2 font-bold text-white bg-gray-500 rounded cursor-pointer hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          onClick={handleConfirmSelection}
          className="h-12 px-4 py-2 font-bold text-white rounded cursor-pointer bg-primary hover:bg-blue-400"
        >
          {isLoading ? <ClipLoader color="#36d7b7" /> : "Add AVP Staff"}
        </button>
      </div>
    </div>
  );
};
export default AddAVPModal;
