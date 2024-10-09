import React, { useState, useEffect, useMemo } from "react";
import DataTable from "react-data-table-component";
import axios from "axios";
import { Link } from "react-router-dom";
import ViewStockModal from "./Modals/ViewStockModal";
import ViewPurchaseModal from "./Modals/ViewPurchaseModal";
import ViewCashDisbursementModal from "./Modals/ViewCashDisbursementModal";
import ViewCashAdvanceModal from "./Modals/ViewCashAdvanceModal";
import ViewLiquidationModal from "./Modals/ViewLiquidationModal";
import ViewRequestModal from "./Modals/ViewRequestModal";
import { PencilSquareIcon } from "@heroicons/react/24/outline";
import ApproversStock from "./ApproverStock";
import ApproverPurchase from "./ApproverPurchase";
import ApproverCashAdvance from "./ApproverCashAdvance";
import ApproverCashDisbursement from "./ApproverCashDisbursement";
import ApproverLiquidation from "./ApproverLiquidation";
import ApproverRefund from "./ApproverRefund";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { request } from "http";
import { record } from "zod";
import ApproverDiscount from "./ApproverDiscount";
import { ClipLoader } from "react-spinners";
import Echo from "../utils/Echo";
import Swal from "sweetalert2";
type Props = {};

type Record = {
  approved_attachment: string;
  employeeID: string;
  pending_approver: string;
  requested_by: string;
  id: number;
  created_at: Date;
  user_id: number;
  request_id: string;
  request_code: string;
  form_type: string;
  form_data: MyFormData[];
  date: Date;
  branch: string;
  status: string;
  purpose: string;
  totalBoatFare: string;
  destination: string;
  grand_total: string;
  grandTotal: string;
  approvers_id: number;
  attachment: string;
  noted_by: Approver[];
  approved_by: Approver[];
  avp_staff: Approver[];
  requested_signature: string;
  requested_position: string;
};
interface Approver {
  id: number;
  firstname: string;
  lastname: string;
  firstName: string;
  lastName: string;
  name: string;
  comment: string;
  position: string;
  signature: string;
  status: string;
  branch: string;
}
type MyFormData = {
  total_labor: number;
  total_discount: number;
  total_spotcash: number;
  employeeID: string;
  requested_by: string;
  approvers_id: number;
  purpose: string;
  items: MyItem[];
  approvers: {
    noted_by: {
      firstName: string;
      lastName: string;
      firstname: string;
      lastname: string;
      position: string;
      signature: string;
      status: string;
      branch: string;
    }[];
    approved_by: {
      firstName: string;
      lastName: string;
      position: string;
      signature: string;
      status: string;
      branch: string;
    }[];
  };
  date: string;
  branch: string;
  grand_total: string;
  supplier: string;
  address: string;
  totalBoatFare: string;
  totalContingency: string;
  totalFare: string;
  totalHotel: string;
  totalperDiem: string;
  totalExpense: string;
  cashAdvance: string;
  short: string;
  name: string;
  signature: string;
};

type MyItem = {
  brand: string;
  model: string;
  unit: string;
  partno: string;
  labor: string;
  spotcash: string;
  discountedPrice: string;
  quantity: string;
  description: string;
  unitCost: string;
  totalAmount: string;
  remarks: string;
  date: string;
  cashDate: string;
  branch: string;
  status: string;
  day: string;
  itinerary: string;
  activity: string;
  hotel: string;
  rate: string;
  amount: string;
  perDiem: string;
  liquidationDate: string;
  particulars: string;
  particularsAmount: string;
  destination: string;
  transportation: string;
  transportationAmount: string;
  hotelAmount: string;
  hotelAddress: string;
  grandTotal: string;
};

const tableCustomStyles = {
  headRow: {
    style: {
      color: "black",
      backgroundColor: "#FFFF",
    },
  },
  rows: {
    style: {
      color: "black", // Adjust as per your design
      backgroundColor: "#E7F1F9", // Adjust as per your design
    },
    stripedStyle: {
      color: "black", // Adjust as per your design
      backgroundColor: "#E7F1F9", // Adjust as per your design
    },
  },
};

const RequestApprover = (props: Props) => {
  const [selected, setSelected] = useState(0);
  const [requests, setRequests] = useState<Record[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [sortOrder, setSortOrder] = useState("desc");
  const userId = localStorage.getItem("id");
  const [branchList, setBranchList] = useState<any[]>([]);
  const [branchMap, setBranchMap] = useState<Map<number, string>>(new Map());
  const [loading, setLoading] = useState(true);
  const [notificationReceived, setnotificationReceived] = useState(false);

  useEffect(() => {
    const id = localStorage.getItem("id");
    if (!id) return;
    if (Echo) {
      const channel = Echo.private(`App.Models.User.${id}`).notification(
        (notification: any) => {
          setnotificationReceived(true);
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "info",
            title: notification.message,
            showConfirmButton: false,
            timer: 6000,
            timerProgressBar: true,
            showCloseButton: true,
          });
        }
      );

      return () => {
        channel.stopListening(
          "IlluminateNotificationsEventsBroadcastNotificationCreated"
        );
      };
    }
  }, []);

  useEffect(() => {
    if (notificationReceived) {
      setnotificationReceived(false);
    }
  }, [notificationReceived]);

  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/view-branch`
        );
        const branches = response.data.data;

        // Create a mapping of id to branch_code
        const branchMapping = new Map<number, string>(
          branches.map((branch: { id: number; branch_code: string }) => [
            branch.id,
            branch.branch_code,
          ])
        );

        setBranchList(branches);
        setBranchMap(branchMapping);
      } catch (error) {
        console.error("Error fetching branch data:", error);
      }
    };

    fetchBranchData();
  }, []);

  useEffect(() => {
    if (userId) {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token is missing");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const fetchRequests = async () => {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_API_BASE_URL}/request-forms/for-approval/${userId}`,
            { headers }
          );
          setRequests(response.data.request_forms);
          console.log(response.data.request_forms);
        } catch (error) {
          console.error("Error fetching requests data:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchRequests();
    }
  }, [userId, notificationReceived]);

  const NoDataComponent = () => (
    <div className="flex items-center justify-center h-64 text-gray-500">
      <p className="text-lg">No records found</p>
    </div>
  );
  const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center h-64">
      {/* <div className="w-16 h-16 border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div> */}
      <ClipLoader color="#007bff" loading={loading} size={50} />
      <p className="mt-2 text-center text-gray-700">Please wait</p>
    </div>
  );

  const handleView = (record: Record) => {
    setSelectedRecord(record);
    setModalIsOpen(true);
  };

  const handleClick = (index: number) => {
    setSelected(index);
  };

  const filteredData = () => {
    switch (selected) {
      case 0: // All Requests
        return requests;
      case 1: // Pending Requests
        return requests.filter(
          (item: Record) =>
            item.status.trim() === "Pending" || item.status.trim() === "Ongoing"
        );
      case 2: // Approved Requests
        return requests.filter(
          (item: Record) => item.status.trim() === "Approved"
        );
      case 3: // Unsuccessful Requests
        return requests.filter(
          (item: Record) =>
            item.status.startsWith("Rejected") || item.status === "Disapproved"
        );
      default:
        return requests;
    }
  };

  const columns = [
    {
      name: "Request ID",
      selector: (row: Record) => row.request_code,
      width: "160px",
      sortable: true,
    },
    {
      name: "Requested by",
      sortable: true,
      selector: (row: Record) => row.requested_by,
    },
    {
      name: "Request Type",
      sortable: true,
      selector: (row: Record) => row.form_type,
      width: "300px",
    },
    {
      name: "Date",
      selector: (row: Record) =>
        new Date(row.created_at).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      sortable: true,
    },
    {
      name: "Branch",
      sortable: true,
      selector: (row: Record) => {
        const branchId = parseInt(row.form_data[0].branch, 10);
        return branchMap.get(branchId) || "Unknown";
      },
    },
    {
      name: "Status",
      selector: (row: Record) => row.status,
      sortable: true,
      width: "200px",
      cell: (row: Record) => (
        <div className="relative flex items-center group">
          {/* Status Badge */}
          <div
            className={`${
              row.status.trim() === "Pending"
                ? "bg-yellow"
                : row.status.trim() === "Approved"
                ? "bg-green"
                : row.status.trim() === "Disapproved" ||
                  row.status.trim().startsWith("Rejected")
                ? "bg-pink"
                : row.status.trim() === "Ongoing"
                ? "bg-blue-500"
                : "bg-red-600"
            } rounded-lg py-1 px-3 text-start text-white flex`}
          >
            {row.status.trim()}
          </div>

          {/* Tooltip Icon */}
          {(row.status === "Pending") && (
            <div className="relative z-10 flex items-center justify-center ml-4 transition-opacity duration-300 transform -translate-x-full -translate-y-1/2  top-1/2 group-hover:opacity-100">
              <QuestionMarkCircleIcon className="absolute w-6 h-6 text-gray-500" />
            </div>
          )}
          {/* Tooltip */}
          {(row.status === "Pending") && (
            <div className="absolute z-40 hidden w-full h-auto p-1 mt-2 mb-4 ml-10 text-black bg-gray-600 rounded-md shadow-lg drop-shadow-sm group-hover:block">
              <p className="text-[11px] text-white">
                Pending: {row.pending_approver}
              </p>
            </div>
          )}
        </div>
      ),
    },
    {
      name: "Action",
      width: "150px",
      cell: (row: Record) => (
        <button
          className="bg-primary text-white  px-3 py-1 rounded-[16px]"
          onClick={() => handleView(row)}
        >
          View
        </button>
      ),
    },
  ];

  const closeModal = () => {
    setModalIsOpen(false);
  };

  const refreshData = () => {
    if (userId) {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token is missing");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      axios
        .get(
          `${process.env.REACT_APP_API_BASE_URL}/request-forms/for-approval/${userId}`,
          {
            headers,
          }
        )
        .then((response) => {
          setRequests(response.data.request_forms);
        })
        .catch((error) => {
          console.error("Error refreshing requests data:", error);
        });
    }
  };

  const items = [
    "All Requests",
    "Pending Requests",
    "Approved Requests",
    "Unsuccessful Requests",
  ];

  return (
    <div className="w-full px-10 pt-4 pb-10 bg-graybg dark:bg-blackbg h-lvh md:px-10 lg:px-30">
      <Link to="/request/sr">
        <button className="bg-primary text-white rounded-[12px] mb-2 w-[120px] sm:w-[151px] h-[34px] z-10">
          Send Request
        </button>
      </Link>
      <div className="relative w-full h-auto rounded-lg drop-shadow-lg md:mr-4">
        <div className="flex flex-col items-center w-full overflow-x-auto bg-white rounded-lg">
          <div className="w-full border-b-2 md:px-30">
            <ul className="flex items-center justify-start px-2 py-4 space-x-4 overflow-x-auto font-medium md:px-30 md:space-x-6">
              {items.map((item, index) => (
                <li
                  key={index}
                  onClick={() => handleClick(index)}
                  className={`cursor-pointer hover:text-primary px-2 ${
                    selected === index ? "underline text-primary" : ""
                  } underline-offset-8 decoration-primary decoration-2`}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="w-full overflow-x-auto">
            <DataTable
              columns={columns}
              defaultSortAsc={false}
              data={
                filteredData()
                  .map((item: Record) => ({
                    ...item,
                    date: new Date(item.date),
                  }))
                  .sort((a, b) => b.id - a.id) // Sorts by id in descending order
              }
              noDataComponent={<NoDataComponent />}
              progressPending={loading}
              progressComponent={<LoadingSpinner />}
              pagination
              striped
              customStyles={tableCustomStyles}
            />
          </div>
        </div>
      </div>
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Stock Requisition Slip" && (
          <ApproversStock
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Purchase Order Requisition Slip" && (
          <ApproverPurchase
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Discount Requisition Form" && (
          <ApproverDiscount
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Cash Disbursement Requisition Slip" && (
          <ApproverCashDisbursement
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Application For Cash Advance" && (
          <ApproverCashAdvance
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Liquidation of Actual Expense" && (
          <ApproverLiquidation
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Refund Request" && (
          <ApproverRefund
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
    </div>
  );
};

export default RequestApprover;
