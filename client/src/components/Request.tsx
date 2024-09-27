import React, { useState, useEffect } from "react";
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
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import ViewDiscountModal from "./Modals/ViewDiscountModal";
type Props = {};

type Record = {
  total_labor:number;
  total_discount:number;
  total_spotcash:number;
  pending_approver: {
    approver_name: string;
  };
  id: number;
  noted_by: {
    id: number;
  firstName: string;
  lastName: string;
  firstname:string;
  lastname:string;
  comment: string;
  position: string;
  signature: string;
  status: string;
  }[];
  approved_by: {
    id: number;
  firstName: string;
  lastName: string;
  comment: string;
  firstname:string;
  lastname:string;
  position: string;
  signature: string;
  status: string;
  }[];
  user_id: number;
  request_code: string;
  
  form_type: string;
  form_data: MyFormData[];
  date: Date;
  created_at: Date;
  branch: string;
  status: string;
  purpose: string;
  totalBoatFare: string;
  destination: string;
  grand_total: string;
  grandTotal: string;
  approvers_id: number;
  attachment: string;
};

type MyFormData = {
  total_labor:number;
  total_discount:number;
  total_spotcash:number;
  approvers_id: number;
  employeeID:string;
  purpose: string;
  items: MyItem[];
  noted_by: {
    id: number;
  firstName: string;
  firstname:string;
  lastname:string;
  lastName: string;
  comment: string;
  position: string;
  signature: string;
  status: string;
  }[];
  approved_by: {
    id: number;
  firstName: string;
  lastName: string;
  comment: string;
  position: string;
  signature: string;
  status: string;
  }[];

  approvers: {
    noted_by: {
      id: number;
    firstName: string;
    lastName: string;
    comment: string;
    position: string;
    signature: string;
    status: string;
    }[];
    approved_by: {
      id: number;
    firstName: string;
    lastName: string;
    comment: string;
    position: string;
    signature: string;
    status: string;
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
  attachment: string;
  branch_id: number;
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
  from: string;
  to: string;
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
      color: "STRIPEDCOLOR",
      backgroundColor: "STRIPEDCOLOR",
    },
    stripedStyle: {
      color: "NORMALCOLOR",
      backgroundColor: "#E7F1F9",
    },
  },
};

const Request = (props: Props) => {
  const [selected, setSelected] = useState(0);
  const [requests, setRequests] = useState<Record[]>([]);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);
  const [sortOrder, setSortOrder] = useState("desc");
  const userId = localStorage.getItem("id");
  const [branchList, setBranchList] = useState<any[]>([]);
  const [branchMap, setBranchMap] = useState<Map<number, string>>(new Map());

  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        const response = await axios.get(
          `http://122.53.61.91:6002/api/view-branch`
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
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      axios
        .get(`http://122.53.61.91:6002/api/view-request`, {
          headers,
        })
        .then((response) => {
          setRequests(response.data.data); // Assuming response.data.data contains your array of data
        })
        .catch((error) => {
          console.error("Error fetching requests data:", error);
        });
    }
  }, [userId]);

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
          (item: Record) => item.status.trim() === "Disapproved"
        );
      default:
        return requests;
    }
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
        .get(`http://122.53.61.91:6002/api/view-request`, {
          headers,
        })
        .then((response) => {
          setRequests(response.data.data); // Assuming response.data.data contains your array of data
        })
        .catch((error) => {});
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
      name: "Request Type",
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
      selector: (row: Record) => {
        const branchId = parseInt(row.form_data[0].branch, 10);
        return branchMap.get(branchId) || "Unknown";
      },
      sortable: true,
    },
    {
      name: "Status",
      selector: (row: Record) => row.status,
      sortable: true,
      width: "320px",
      cell: (row: Record) => (
        <div className="relative flex items-center group w-full">
          {/* Status Badge */}
          <div
            className={`${
              row.status.trim() === "Pending"
                ? "bg-yellow"
                : row.status.trim() === "Approved"
                ? "bg-green"
                : row.status.trim() === "Disapproved"
                ? "bg-pink"
                : row.status.trim() === "Ongoing"
                ? "bg-blue-500"
                : "bg-red-600"
            } rounded-lg py-1 px-3 text-center text-white flex items-center`}
          >
            {row.status.trim()}
          </div>

          {/* Tooltip Icon */}
          {(row.status === "Pending" || row.status === "Ongoing") && (
            <div className=" absolute top-1/2 justify-center items-center flex right-44 transform -translate-x-full -translate-y-1/2  group-hover:opacity-100 transition-opacity duration-300 z-10">
              <QuestionMarkCircleIcon className="w-6 h-6 text-gray-500 absolute" />
            </div>
          )}

          {/* Tooltip */}
          {(row.status === "Pending" || row.status === "Ongoing") && (
            <div className="h-auto mb-4 absolute drop-shadow-sm w-auto   mt-2 hidden group-hover:block  bg-gray-600  ml-10  text-black p-1 rounded-md shadow-lg  z-40">
              <p className="text-[11px] text-white">
                Pending: {row.pending_approver.approver_name}
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

  const items = [
    "All Requests",
    "Pending Requests",
    "Approved Requests",
    "Unsuccessful Requests",
  ];

  const closeModal = () => {
    setModalIsOpen(false);
  };
console.log(requests)
  return (
    <div className="bg-graybg dark:bg-blackbg w-full h-lvh pt-4 px-10 md:px-10 lg:px-30">
      <Link to="/request/sr">
        <button className="bg-primary text-white rounded-[12px] mb-2 w-[120px] sm:w-[151px] h-[34px] z-10">
          Send Request
        </button>
      </Link>

      <div className="w-full  h-auto  drop-shadow-lg rounded-lg  md:mr-4 relative ">
        <div className="bg-white   rounded-lg  w-full flex flex-col items-center overflow-x-auto">
          <div className="w-full border-b-2  md:px-30">
            <ul className=" px-2 md:px-30 flex justify-start items-center space-x-4 md:space-x-6 py-4 font-medium overflow-x-auto">
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
          <ViewStockModal
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
          {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Discount Requisition Form" && (
          <ViewDiscountModal
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Purchase Order Requisition Slip" && (
          <ViewPurchaseModal
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Cash Disbursement Requisition Slip" && (
          <ViewCashDisbursementModal
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Application For Cash Advance" && (
          <ViewCashAdvanceModal
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Liquidation of Actual Expense" && (
          <ViewLiquidationModal
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
      {modalIsOpen &&
        selectedRecord &&
        selectedRecord.form_type === "Refund Request" && (
          <ViewRequestModal
            closeModal={closeModal}
            record={{ ...selectedRecord, date: selectedRecord.date.toString() }}
            refreshData={refreshData}
          />
        )}
    </div>
  );
};

export default Request;
