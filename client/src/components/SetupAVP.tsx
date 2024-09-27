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
import AddUserModal from "./AddUserModal";
import EditUserModal from "./EditUserModal";
import SuccessModal from "./SuccessModal";
import CompleteModal from "./CompleteModal";
import DeleteSuccessModal from "./DeleteSucessModal";
import DeleteModal from "./DeleteModal";
import { set } from "react-hook-form";

import AddApproverModal from "./AddApproverModal";
import axios from "axios";
import AddAreaManagerModal from "./AddAreaManagerModal";
import EditAreaManager from "./EditAreaManager";
import { ClipLoader } from "react-spinners";
import AddCustomModal from "./EditCustomModal";
import AddAVPModal from "./AddAVPModal";
import EditAVPStaff from "./EditAVPStaff";
type Props = {};

interface UserObject {
  firstName: string;
  lastName: string;
}

interface StaffObject {
  firstName: string;
  lastName: string;
}

interface Record {
  id: number;
  user: UserObject;
  staff: StaffObject;
  branches: string[];
}

interface AVP {
  staff: {
    firstName: string;
    lastName: string;
  };
  branches: string[];
}
const tableCustomStyles = {
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
      color: "STRIPEDCOLOR",
      backgroundColor: "STRIPEDCOLOR",
    },
    stripedStyle: {
      color: "NORMALCOLOR",
      backgroundColor: "#E7F1F9",
    },
  },
};

const deleteUser = async () => {};
interface AreaManager {
  id: number;
  user_id: number;
  branch_id: number[];
  branches: {
    message: string;
    data: {
      id: number;
      branch_code: string;
      branch: string;
      created_at: string;
      updated_at: string;
    }[];
  }[];
  user: UserObject;
}

interface UserObject {
  message: string;
  data: User;
  status: boolean;
}

interface User {
  id: number;
  firstName: string;
  lastName: string;
  contact: string;
  branch_code: string;
  userName: string;
  email: string;
  email_verified_at: string | null;
  role: string;
  signature: string;
  created_at: string;
  updated_at: string;
  position: string;
  branch: string;
  employee_id: string;
}
const SetupAVP = (props: Props) => {
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
  const [avpStaffList, setAVPStaffList] = useState<Record[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterTerm, setFilterTerm] = useState("");
  const [isLoading, setisLoading] = useState(false);
  const userId = localStorage.getItem("id");
  const [staffAVP, setStaffAVP] = useState<Record[]>([]);
  const [areaManager, setAreaManager] = useState<{
    branches: any[];
    user: any;
    id: number;
    user_id: number;
    branch_id: number[];
  } | null>(null);

  const [fetchCompleted, setFetchCompleted] = useState(false);

  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem("id");
        const response = await axios.get(
          `http://122.53.61.91:6002/api/getStaff`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setAVPStaffList(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching approvers:", error);
        setLoading(false);
      }
    };

    fetchApprovers();
  }, [modalIsOpen]);

  useEffect(() => {
    const fetchAVPStaff = async () => {
      try {
        setLoading(true);
        const userId = localStorage.getItem("id");
        const response = await axios.get(
          `http://122.53.61.91:6002/api/get-avpstaff-branch`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setStaffAVP(response.data.data);
     
        setLoading(false);
      } catch (error) {
        console.error("Error fetching approvers:", error);
        setLoading(false);
      }
    };

    fetchAVPStaff();
  }, [modalIsOpen]);

  const refreshData = async () => {
    
      try {
        setLoading(true);
        const userId = localStorage.getItem("id");
        const response = await axios.get(
          `http://122.53.61.91:6002/api/get-avpstaff-branch`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
  
        setStaffAVP(response.data.data);
      } catch (error) {
        console.error("Error fetching approvers:", error);
      } finally {
        setLoading(false); // Ensure loading is set to false regardless of success or failure
      }
    };
  


  const viewModalShow = (row: Record) => {
    setSelectedUser(row);
    setViewModalIsOpen(true);
  };

  const viewModalClose = () => {
    setSelectedUser(null);
    setViewModalIsOpen(false);
  };

  const deleteModalShow = (row: Record) => {
    setSelectedUser(row);
    setDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setDeleteModal(false);
  };

  const editModalShow = (row: Record) => {
    setEditModal(true);
    setSelectedUser(row);
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
  /* const getAssignedBranches = (row: Record) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2  space-y-2  sm:gap-2 sm:space-y-0 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 ">
        {row.branches.map((branchInfo, index) => (
          <div
            className="bg-primary p-2 rounded-[12px] w-20 text-center "
            key={index}
          >
            <ul className=" text-white">{branchInfo.data[0].branch_code}</ul>
          </div>
        ))}
      </div>
    );
  }; */

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
        `http://122.53.61.91:6002/api/delete-avpstaff-branch/${selectedUser?.id}`,

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
  const columns = [
    {
      name: "ID",
      selector: (row: Record) => row.id, 
      width: "60px",
    },
    {
      name: "AVP",
      selector: (row: Record) => `${row.user.firstName} ${row.user.lastName}`, // Displays the user's full name (string)
    },
    {
      name: "AVP Staff",
      selector: (row: Record) => `${row.staff.firstName} ${row.staff.lastName}`, // Displays the staff's full name (string)
    },
    {
      name: "AVP Staff",

      cell: (row: Record) => (
        <ul className="flex flex-col md:flex-row md:flex-wrap">
          {row.branches.map((branch, index) => (
            <li
              className="my-2 p-2 mx-2 bg-pink rounded-lg text-white 
                         transition-all duration-300 ease-in-out 
                         hover:bg-pink-700"
              key={index}
            >
              {branch}
            </li>
          ))}
        </ul>
      )
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

  const pStyle = "font-medium";
  const inputStyle = "border border-black rounded-md p-1";
  return (
    <div className="bg-graybg dark:bg-blackbg h-full w-full pt-4 px-4 sm:px-10 md:px-10 lg:px-30 xl:px-30">
      <div className=" h-auto drop-shadow-lg rounded-lg md:mr-4 w-full ">
        <div className="bg-white rounded-lg w-full flex flex-col overflow-x-auto">
          <h1 className="pl-4 sm:pl-[30px] text-[24px] text-left py-4 text-primary font-bold mr-2 underline decoration-2 underline-offset-8">
            AVP Staff
          </h1>
          <div className="flex items-end justify-end  mx-2 bg-white">
            <div>
              <button
                className="bg-primary text-white rounded-[12px] p-2"
                onClick={openModal}
              >
                + Create New
              </button>
            </div>
          </div>
          <div className="sm:mx-0 md:mx-4 my-2 relative w-2/12">
            <div className="relative flex-grow">
              <input
                type="text"
                className="w-full border bg-white border-black rounded-md pl-10 pr-3 py-2"
                value={filterTerm}
                onChange={(e) => setFilterTerm(e.target.value)}
                placeholder="Search Area Manager"
              />
              <MagnifyingGlassIcon className="h-5 w-5 text-black absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center">
              <ClipLoader color="#36d7b7" />
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={staffAVP}
              pagination
              striped
              progressPending={isLoading}
              progressComponent={<p>Loading...</p>}
              noDataComponent={
                fetchCompleted && staffAVP.length === 0 ? (
                  <p>No data available.</p>
                ) : (
                  <ClipLoader color="#36d7b7" />
                )
              }
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
          )}
        </div>
      </div>
      <AddAVPModal
        refreshData={refreshData}
        modalIsOpen={modalIsOpen}
        closeModal={closeModal}
        openCompleteModal={openCompleteModal}
        entityType="AVP Staff"
      />
      <DeleteModal
        refreshData={refreshData}
        onDelete={deleteUser}
        deleteModal={deleteModal}
        closeDeleteModal={closeDeleteModal}
        openDeleteSuccessModal={openDeleteSuccessModal}
        entityType="AVP Staff"
      />
      <DeleteSuccessModal
        showDeleteSuccessModal={showDeletedSuccessModal}
        closeDeleteSuccessModal={closeDeleteSuccessModal}
        openDeleteSuccessModal={openDeleteSuccessModal}
        entityType="AVP Staff"
      />
      <CompleteModal
        showCompleteModal={showCompleteModal}
        closeCompleteModal={closeCompleteModal}
        openCompleteModal={openCompleteModal}
        entityType="AVP Staff"
      />
      <EditAVPStaff
        closeSuccessModal={closeSuccessModal}
        refreshData={refreshData}
        editModal={editModal}
        editModalClose={editModalClose}
        openSuccessModal={openSuccessModal}
        entityType="AVP Staff"
        selectedUser={selectedUser || null}
        openCompleteModal={null}
        closeModal={null}
        modalIsOpen={false}
        areaManagerId={0}
      />
      <SuccessModal
        showSuccessModal={showSuccessModal}
        closeSuccessModal={closeSuccessModal}
        openSuccessModal={openSuccessModal}
        entityType="AVP Staff"
      />
    </div>
  );
};

export default SetupAVP;
