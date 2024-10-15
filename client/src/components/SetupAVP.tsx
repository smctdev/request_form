import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import {
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import SuccessModal from "./SuccessModal";
import CompleteModal from "./CompleteModal";
import DeleteSuccessModal from "./DeleteSucessModal";
import DeleteModal from "./DeleteModal";
import axios from "axios";
import { ClipLoader } from "react-spinners";
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
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeletedSuccessModal, setShowDeletedSuccessModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [viewModalIsOpen, setViewModalIsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<Record | null>(null);
  const [avpStaffList, setAVPStaffList] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTerm, setFilterTerm] = useState("");
  const [isLoading, setisLoading] = useState(false);
  const userId = localStorage.getItem("id");
  const [staffAVP, setStaffAVP] = useState<Record[]>([]);

  useEffect(() => {
    const fetchApprovers = async () => {
      try {
        const userId = localStorage.getItem("id");
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/getStaff`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        setAVPStaffList(response.data.data);
      } catch (error) {
        console.error("Error fetching approvers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApprovers();
  }, [modalIsOpen]);

  useEffect(() => {
    const fetchAVPStaff = async () => {
      try {
        const userId = localStorage.getItem("id");
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/get-avpstaff-branch`,
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
        setLoading(false);
      }
    };

    fetchAVPStaff();
  }, [modalIsOpen]);

  const refreshData = async () => {
    try {
      const userId = localStorage.getItem("id");
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/get-avpstaff-branch`,
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

  const filteredAVP = staffAVP.filter(
    (avpstaff) =>
      avpstaff.user.firstName
        .toLowerCase()
        .includes(filterTerm.toLowerCase()) ||
      avpstaff.user.lastName.toLowerCase().includes(filterTerm.toLowerCase()) ||
      avpstaff.staff.firstName
        .toLowerCase()
        .includes(filterTerm.toLowerCase()) ||
      avpstaff.staff.lastName
        .toLowerCase()
        .includes(filterTerm.toLowerCase()) ||
      avpstaff.branches.some((branch) =>
        branch.toLowerCase().includes(filterTerm.toLowerCase())
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
        `${process.env.REACT_APP_API_BASE_URL}/delete-avpstaff-branch/${selectedUser?.id}`,

        { headers }
      );

      setisLoading(false);
      openDeleteSuccessModal();
      refreshData();

      // Optionally handle success message or UI updates after successful update
    } catch (error) {
      setisLoading(false);
      console.error("Error updating role:", error);
    }
  };
  const columns = [
    {
      name: "ID",
      selector: (row: Record) => row.id,
      width: "80px",
      sortable: true,
    },
    {
      name: "AVP",
      sortable: true,
      selector: (row: Record) => `${row.user.firstName} ${row.user.lastName}`, // Displays the user's full name (string)
    },
    {
      name: "AVP Staff",
      sortable: true,
      selector: (row: Record) => `${row.staff.firstName} ${row.staff.lastName}`, // Displays the staff's full name (string)
    },
    {
      name: "Assigned Branches",
      sortable: true,

      cell: (row: Record) => (
        <ul className="flex flex-col md:flex-row md:flex-wrap">
          {row.branches.map((branch, index) => (
            <li
              className="p-2 mx-2 my-2 text-white transition-all duration-300 ease-in-out rounded-lg bg-pink hover:bg-pink-700"
              key={index}
            >
              {branch}
            </li>
          ))}
        </ul>
      ),
    },
    {
      name: "Action",
      sortable: true,
      cell: (row: Record) => (
        <div className="flex space-x-2">
          <PencilSquareIcon
            className="cursor-pointer text-primary size-8"
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

  return (
    <div className="w-full h-full px-4 pt-4 bg-graybg dark:bg-blackbg sm:px-10 md:px-10 lg:px-30 xl:px-30">
      <div className="w-full h-auto rounded-lg drop-shadow-lg md:mr-4">
        <div className="flex flex-col w-full overflow-x-auto bg-white rounded-lg">
          <h1 className="pl-4 sm:pl-[30px] text-[24px] text-left py-4 text-primary font-bold mr-2 underline decoration-2 underline-offset-8">
            AVP Staff
          </h1>
          <div className="flex items-end justify-end mx-2 bg-white">
            <div>
              <button
                className="bg-primary text-white rounded-[12px] p-2"
                onClick={openModal}
              >
                + Create New
              </button>
            </div>
          </div>
          <div className="relative w-2/12 my-2 sm:mx-0 md:mx-4">
            <div className="relative flex-grow">
              <input
                type="text"
                className="w-full py-2 pl-10 pr-3 bg-white border border-black rounded-md"
                value={filterTerm}
                onChange={(e) => setFilterTerm(e.target.value)}
                placeholder="Search Area Manager"
              />
              <MagnifyingGlassIcon className="absolute w-5 h-5 text-black transform -translate-y-1/2 pointer-events-none left-3 top-1/2" />
            </div>
          </div>
          {loading ? (
            <table className="table" style={{ background: "white" }}>
              <thead>
                <tr>
                  <th
                    className="w-[80px] py-6"
                    style={{ color: "black", fontWeight: "bold" }}
                  >
                    ID
                  </th>
                  <th style={{ color: "black", fontWeight: "bold" }}>AVP</th>
                  <th style={{ color: "black", fontWeight: "bold" }}>
                    AVP Staff
                  </th>
                  <th style={{ color: "black", fontWeight: "bold" }}>
                    Assigned Branches
                  </th>
                  <th style={{ color: "black", fontWeight: "bold" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index}>
                    <td className="w-full border border-gray-200" colSpan={5}>
                      <div className="flex justify-center">
                        <div className="flex flex-col w-full gap-4">
                          <div className="w-full h-12 skeleton bg-slate-300"></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <DataTable
              columns={columns}
              data={filteredAVP}
              pagination
              striped
              // progressPending={isLoading}
              // progressComponent={<p>Loading...</p>}
              noDataComponent={
                filteredAVP.length === 0 ? (
                  <p className="flex flex-col items-center justify-center h-64">
                    {filterTerm
                      ? "No " + `"${filterTerm}"` + " found"
                      : "No data available."}
                  </p>
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
