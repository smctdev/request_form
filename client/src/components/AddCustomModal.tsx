import React, { useState, useEffect } from "react";
import { XMarkIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";
import Swal from "sweetalert2";

interface AddCustomModalProps {
  modalIsOpen: boolean;
  closeModal: () => void;
  openCompleteModal: () => void;
  entityType: string;
  initialNotedBy: Approver[]; // Update to Approver[]
  initialApprovedBy: Approver[]; // Update to Approver[]
  refreshData: () => void;
  handleAddCustomData: (notedBy: Approver[], approvedBy: Approver[]) => void; // Update to Approver[]
}

interface Approver {
  id: number;
  firstName: string;
  lastName: string;
  comment?: string;
  position: string;
  signature?: string;
  status?: string;
}

const AddCustomModal: React.FC<AddCustomModalProps> = ({
  modalIsOpen,
  closeModal,
  openCompleteModal,
  entityType,
  initialNotedBy,
  initialApprovedBy,
  refreshData,
  handleAddCustomData,
}) => {
  const [notedBy, setNotedBy] = useState<Approver[]>([]);
  const [approvedBy, setApprovedBy] = useState<Approver[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [approvers, setApprovers] = useState<Approver[]>([]);

  useEffect(() => {
    if (modalIsOpen) {
      setNotedBy(initialNotedBy);
      setApprovedBy(initialApprovedBy);
      const fetchApprovers = async () => {
        try {
          setLoading(true);
          const userId = localStorage.getItem("id");
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
            ...(response.data.sameBranchApprovers || []),
          ];
          const currentUserId = Number(userId);
          const currentUsers = allApprovers.filter(
            (approver) => approver.id !== currentUserId
          );

          const uniqueIds = new Set(
            currentUsers.map((approver) => approver.id)
          );
          const uniqueApprovers = allApprovers.filter(
            (approver) =>
              uniqueIds.has(approver.id) && uniqueIds.delete(approver.id)
          );

          setApprovers(uniqueApprovers);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching approvers:", error);
          Swal.fire({
            icon: "error",
            iconColor: "#dc3545",
            title: "Error",
            text: "An error occurred while fetching approvers. Please try again or reload the page. If the error persists, please contact support.",
            confirmButtonText: "Close",
            confirmButtonColor: "#dc3545",
          });
          setLoading(false);
        }
      };

      fetchApprovers();
    }
  }, [modalIsOpen]);

  const filteredApprovers = approvers.filter((approver) =>
    Object.values(approver).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );
  const handleResetSelection = () => {
    setNotedBy([]);
    setApprovedBy([]);
  };
  const toggleNotedBy = (approver: Approver) => {
    const isApproved = approvedBy.some((a) => a.id === approver.id);
    setNotedBy((prevNotedBy) =>
      prevNotedBy.some((a) => a.id === approver.id)
        ? prevNotedBy.filter((a) => a.id !== approver.id)
        : [...prevNotedBy, approver]
    );
  };

  const toggleApprovedBy = (approver: Approver) => {
    const isNoted = notedBy.some((a) => a.id === approver.id);
    setApprovedBy((prevApprovedBy) =>
      prevApprovedBy.some((a) => a.id === approver.id)
        ? prevApprovedBy.filter((a) => a.id !== approver.id)
        : [...prevApprovedBy, approver]
    );
  };

  const handleCancel = () => {
    setNotedBy([]);
    setApprovedBy([]);
    setSearchTerm("");
    closeModal();
  };

  const handleAddCustomRequest = () => {
    if (notedBy.length === 0 || approvedBy.length === 0) {
      setErrorMessage(
        "You must select at least one noted by and one approved by."
      );
      return;
    }

    handleAddCustomData(notedBy, approvedBy);

    setNotedBy([]);
    setApprovedBy([]);
    setSearchTerm("");
    setErrorMessage("");
    closeModal();
  };

  if (!modalIsOpen) return null;

  return (
    <div className="z-10 fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 flex-col">
      <div className="bg-white w-10/12 sm:w-1/3 mx-20 flex flex-col rounded-lg shadow-lg">
        <div className="p-4 bg-primary flex justify-center items-center rounded-t-lg">
          <h2 className="text-center text-xl md:text-2xl font-bold text-white">
            Add {entityType}
          </h2>
        </div>
        <div className="flex-grow p-4">
          <div className="relative flex items-center mb-4">
            <input
              type="text"
              className="w-full bg-white border border-gray-300 rounded-md pl-10 pr-3 py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search approvers"
            />
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-y-auto h-80">
            <div>
              <h1 className="text-lg font-medium">Noted By</h1>
              {filteredApprovers.map((approver, index) => {
                const isNoted = notedBy.some((a) => a.id === approver.id);
                const isApproved = approvedBy.some((a) => a.id === approver.id);
                const isDisabled = isNoted || isApproved;
                const highlightClass =
                  isNoted && isApproved ? "bg-yellow-100" : "";

                return (
                  <div key={approver.id} className="flex items-center mb-2">
                    {isNoted && (
                      <span
                        className="mr-2 rounded-full text-center px-2 py-1 text-white font-bold text-xs flex items-center justify-center"
                        style={{
                          background: "#007bff",
                          height: "20px",
                          width: "20px",
                        }} // Set fixed height and width
                      >
                        {notedBy.indexOf(approver) + 1}
                      </span>
                    )}
                    <input
                      type="checkbox"
                      className={`h-5 w-5 mr-2 ${
                        isDisabled ? "cursor-not-allowed" : ""
                      }`}
                      id={`noted_by_${approver.id}`}
                      checked={isNoted}
                      onChange={() => {
                        if (!isApproved) {
                          toggleNotedBy(approver);
                        }
                      }}
                      disabled={isApproved}
                    />
                    <label
                      htmlFor={`noted_by_${approver.id}`}
                      className={`${highlightClass} ${
                        isApproved ? "text-gray-400" : ""
                      }`}
                    >
                      {approver.firstName} {approver.lastName}
                    </label>
                  </div>
                );
              })}
            </div>
            <div>
              <h1 className="text-lg font-medium">Approved By</h1>
              {filteredApprovers.map((approver, index) => {
                const isNoted = notedBy.some((a) => a.id === approver.id);
                const isApproved = approvedBy.some((a) => a.id === approver.id);
                const isDisabled = isNoted || isApproved;
                const highlightClass =
                  isNoted && isApproved ? "bg-yellow-100" : "";

                return (
                  <div key={approver.id} className="flex items-center mb-2">
                    {isApproved && (
                      <span
                        className="mr-2 rounded-full text-center px-2 py-1 text-white font-bold text-xs flex items-center justify-center"
                        style={{
                          background: "#007bff",
                          height: "20px",
                          width: "20px",
                        }} // Set fixed height and width
                      >
                        {approvedBy.indexOf(approver) + 1}
                      </span>
                    )}
                    <input
                      type="checkbox"
                      className={`h-5 w-5 mr-2 ${
                        isDisabled ? "cursor-not-allowed" : ""
                      }`}
                      id={`approved_by_${approver.id}`}
                      checked={isApproved}
                      onChange={() => {
                        if (!isNoted) {
                          toggleApprovedBy(approver);
                        }
                      }}
                      disabled={isNoted}
                    />
                    <label
                      htmlFor={`approved_by_${approver.id}`}
                      className={`${highlightClass} ${
                        isNoted ? "text-gray-400" : ""
                      }`}
                    >
                      {approver.firstName} {approver.lastName}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
          {errorMessage && (
            <div className="mt-4 text-red-500">{errorMessage}</div>
          )}
        </div>
        <div className="p-4 flex-col md:flex-row gap-2 bg-gray-100 flex justify-end rounded-b-lg">
          <button
            type="button"
            onClick={handleResetSelection}
            className="bg-gray-300 px-2 hover:bg-gray-400 text-gray-800 font-medium py-2  rounded "
          >
            Reset
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-gray-500 px-2  hover:bg-gray-400 text-white font-medium py-2  rounded"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAddCustomRequest}
            className="bg-primary px-2 hover:bg-blue-400 hover:bg-primary-dark text-white font-medium py-2  rounded "
          >
            Save
          </button>
        </div>
      </div>
      {loading && (
        <div className="absolute flex items-center justify-center w-full h-full bg-black bg-opacity-50">
          <ClipLoader color="white" size={40} />
        </div>
      )}
    </div>
  );
};

export default AddCustomModal;
