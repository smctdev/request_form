import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import {
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import AddBranchModal from "./AddBranchModal";
import EditUserModal from "./EditUserModal";
import SuccessModal from "./SuccessModal";
import CompleteModal from "./CompleteModal";
import DeleteSuccessModal from "./DeleteSucessModal";
import DeleteModal from "./DeleteModal";
import { set } from "react-hook-form";
import ViewBranchModal from "./ViewBranchModal";
import axios from "axios";
import SquareLoader from "react-spinners/SquareLoader";

export type Branch = {
  id: number;
  branch: string;
  branch_code: string;
  user_id: number;
};

type Props = {};

type Record = {
  id: number;
  branch: string;
  branch_code: string;
  user_id: number;
};

interface ViewBranchModalProps {
  modalIsOpen: boolean;
  closeModal: () => void;
  user: Record | null;
}

const pStyle = "font-medium";
const inputStyle = "border border-black rounded-md p-1";
const SetupBranch = (props: Props) => {
  const [darkMode, setDarkMode] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeletedSuccessModal, setShowDeletedSuccessModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteSuccessModal, setDeleteSuccessModal] = useState(false);
  const [viewModalIsOpen, setViewModalIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Record | null>(null);
  const [branchList, setBranchList] = useState<Record[]>([]);
  const [isLoading, setisLoading] = useState(false);
  const userId = localStorage.getItem("id");
  const [filterTerm , setFilterTerm] = useState("")

  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        if (!userId) {
          console.error("User ID is missing");
          return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token is missing");
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const response = await axios.get(`http://122.53.61.91:6002/api/view-branch`, {
          headers,
        });

       

        // Assuming response.data.data is the array of branches
        setBranchList(response.data.data);
      } catch (error) {
        console.error("Error fetching branch data:", error);
      }
    };

    fetchBranchData();
  }, [userId]);

  



  const viewModalShow = (row: Record) => {
    setSelectedUser(row);
    setViewModalIsOpen(true);

  };

  const viewModalClose = () => {
    setSelectedUser(null);
    setViewModalIsOpen(false);
  };
  const filteredBranch = branchList.filter(branch =>
    Object.values(branch).some(value =>
      String(value).toLowerCase().includes(filterTerm.toLowerCase())
    )
  );
  const deleteUser = async () => {
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

        // Send PUT request to update user's role
        const response = await axios.delete(
            `http://122.53.61.91:6002/api/delete-branch/${selectedUser?.id}`,
          
            { headers }
        );

        setisLoading(false);
        openDeleteSuccessModal();
        refreshData();
   
        // Optionally handle success message or UI updates after successful update
    } catch (error) {
        setisLoading(false);
        console.error("Error updating role:", error);
        // Handle error state or show error message to the user
        // Example: show error message in a toast or modal
        // showErrorToast("Failed to update role. Please try again later.");
    }
};

  const deleteModalShow = (row: Record) => {
    setSelectedUser(row);
    setDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setDeleteModal(false);
  };

  const editModalShow = (row: Record) => {
    setSelectedUser(row);
    setEditModal(true);
  };

  const editModalClose = () => {
    setEditModal(false);
  };

  const openModal = () => {
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };
  const openCompleteModal = () => {
    setShowCompleteModal(true);
    setModalIsOpen(false);
  };

  const closeCompleteModal = () => {
    setShowCompleteModal(false);
  };
  const openSuccessModal = () => {
    setShowSuccessModal(true);
    setEditModal(false);
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
  };
  const openDeleteSuccessModal = () => {
    setShowDeletedSuccessModal(true);
    setDeleteModal(false);
  };

  const closeDeleteSuccessModal = () => {
    setShowDeletedSuccessModal(false);
  };

  const columns = [
    {
      name: "ID",
      selector: (row: Record) => row.id,
      width: "60px",
    },

    {
      name: "Branch",
      selector: (row: Record) => row.branch,
    },
    {
      name: "Branch Code",
      selector: (row: Record) => row.branch_code,
    },
    {
      name: "Action",
      cell: (row: Record) => (
        <div className="flex space-x-2">
          <PencilSquareIcon
            className="text-primary size-8 cursor-pointer"
            onClick={() => editModalShow(row)}
          />
          <TrashIcon
            className="text-[#A30D11] size-8 cursor-pointer"
            onClick={() => deleteModalShow(row)}
          />
        </div>
      ),
    },
  ];
  const refreshData = async () => {
    try {
      if (!userId) {
        console.error("User ID is missing");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token is missing");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const response = await axios.get(`http://122.53.61.91:6002/api/view-branch`, {
        headers,
      });
      // Assuming response.data.data is the array of branches
      setBranchList(response.data.data);
    } catch (error) {
      console.error("Error fetching branch data:", error);
    }
  };

  return (
    <div className="bg-graybg dark:bg-blackbg h-full w-full pt-4 px-4 sm:px-10 md:px-10 lg:px-30 xl:px-30">
      <div className=" h-auto drop-shadow-lg rounded-lg md:mr-4 w-full ">
        <div className="bg-white rounded-lg w-full flex flex-col overflow-x-auto">
          <h1 className="pl-4 sm:pl-[30px] text-[24px] text-left py-4 text-primary font-bold mr-2 underline decoration-2 underline-offset-8">
            Branch
          </h1>
          <div className="flex items-end justify-end mx-2 bg-white">
          
            <div>
              <button
                className="bg-primary text-white rounded-[12px] p-2"
                onClick={openModal}
              >
                + Add Branch
              </button>
            </div>
          </div>
          <div className="sm:mx-0 md:mx-4 my-2 relative w-2/12">
            <div className="relative flex-grow">
              <input
                type="text"
                className="w-full border border-black rounded-md pl-10 pr-3 py-2 bg-white"
                value={filterTerm}
                onChange={(e) => setFilterTerm(e.target.value)}
                placeholder="Search branch"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-black absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          <DataTable
            columns={columns}
            data={filteredBranch}
            pagination
            striped
            customStyles={{
              headRow: {
                style: {
                  fontSize: "18px",
                  fontWeight: "bold",
                  color: "black",
                  backgroundColor: "#FFFF",
                },
              },
              rows: {
                style: {
                  color: "black",
                  backgroundColor: "#E7F1F9",
                },
                stripedStyle: {
                  color: "black",
                  backgroundColor: "#FFFFFF",
                },
              },
            }}
          />
        </div>
      </div>
      <AddBranchModal
        refreshData={refreshData}
        modalIsOpen={modalIsOpen}
        closeModal={closeModal}
        openCompleteModal={openCompleteModal}
        entityType="Branch"
      />
      <DeleteModal
        refreshData={refreshData}
        onDelete={deleteUser}
        deleteModal={deleteModal}
        closeDeleteModal={closeDeleteModal}
        openDeleteSuccessModal={openDeleteSuccessModal}
        entityType="Branch"
      />
      <DeleteSuccessModal
        showDeleteSuccessModal={showDeletedSuccessModal}
        closeDeleteSuccessModal={closeDeleteSuccessModal}
        openDeleteSuccessModal={openDeleteSuccessModal}
        entityType="Branch"
      />
      <CompleteModal
        showCompleteModal={showCompleteModal}
        closeCompleteModal={closeCompleteModal}
        openCompleteModal={openCompleteModal}
        entityType="Branch"
      />
      <EditUserModal
      refreshData={refreshData}
        editModal={editModal}
        editModalClose={editModalClose}
        openSuccessModal={openSuccessModal}
        entityType="Branch"
        selectedUser={selectedUser}
      />
      <ViewBranchModal
        modalIsOpen={viewModalIsOpen}
        closeModal={viewModalClose}
        user={selectedUser}
      />
    </div>
  );
};

export default SetupBranch;
