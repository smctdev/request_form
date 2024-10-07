import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import ClipLoader from "react-spinners/ClipLoader";
import { PencilIcon } from "@heroicons/react/24/solid";
import EditStockModalSuccess from "./EditStockModalSuccess";
import BeatLoader from "react-spinners/BeatLoader";
import Avatar from "../assets/avatar.png";
import PrintCash from "../PrintCash";
import AddCustomModal from "../EditCustomModal";
type Props = {
  closeModal: () => void;
  record: Record;
  refreshData: () => void;
};
interface Approver {
  id: number;
  firstName: string;
  lastName: string;
  comment: string;
  position: string;
  signature: string;
  status: string;
}
type Record = {
  id: number;
  created_at: Date;
  status: string;
  approvers_id: number;
  form_data: FormData[];
  supplier?: string;
  address?: string;
  branch: string;
  date: string;
  user_id: number;
  attachment: string;
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

type FormData = {
  approvers_id: number;
  attachment: string;
  purpose: string;
  items: Item[];
  branch: string;
  date: string;
  grand_total: string;
  supplier: string;
  address: string;
  totalBoatFare: string;
  totalContingency: string;
  totalFare: string;
  totalHotel: string;
  totalperDiem: string;
  totalExpense: string;
  short: string;
};

// Define the Item type
type Item = {
  cashDate: string;

  quantity: string;
  description: string;
  unitCost: string;
  totalAmount: string;
  remarks: string;
  day: string;
  from: string;
  to: string;
  activity: string;
  hotel: string;
  rate: string;
  amount: string;
  perDiem: string;
};
const headerStyle = "border border-black bg-[#8EC7F7] w-2/12 text-sm p-2";
const inputStyle = "border border-black text-[12px] font-bold";
const tableStyle = "border border-black px-1";
const tableStyle2 = "bg-white p-2";
const tableCellStyle = `${inputStyle} py-2 px-1 w-10 wrap-text  break-words`;
const ViewCashAdvanceModal: React.FC<Props> = ({
  closeModal,
  record,
  refreshData,
}) => {
  const [editableRecord, setEditableRecord] = useState(record);
  const [newData, setNewData] = useState<Item[]>([]);
  const [newTotalBoatFare, setNewTotalBoatFare] = useState("");
  const [newTotalHotel, setNewTotalHotel] = useState("");
  const [newTotalFare, setNewTotalFare] = useState("");
  const [newTotalContingency, setNewTotalContingency] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedDate, setEditedDate] = useState("");
  const [editedApprovers, setEditedApprovers] = useState<number>(
    record.approvers_id
  );
  const [loading, setLoading] = useState(false);
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [fetchingApprovers, setFetchingApprovers] = useState(false);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [notedBy, setNotedBy] = useState<Approver[]>([]);
  const [approvedBy, setApprovedBy] = useState<Approver[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [customApprovers, setCustomApprovers] = useState<any>(null);
  const [isFetchingApprovers, setisFetchingApprovers] = useState(false);
  const [isFetchingUser, setisFetchingUser] = useState(false);
  const [user, setUser] = useState<any>({});
  const [attachmentUrl, setAttachmentUrl] = useState<string[]>([]);
  const [printWindow, setPrintWindow] = useState<Window | null>(null);
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [originalAttachments, setOriginalAttachments] = useState<string[]>([]);
  const [removedAttachments, setRemovedAttachments] = useState<
    Array<string | number>
  >([]);
  const [branchList, setBranchList] = useState<any[]>([]);
  const [branchMap, setBranchMap] = useState<Map<number, string>>(new Map());
  const hasDisapprovedInNotedBy = notedBy.some(
    (user) => user.status === "Disapproved"
  );
  const hasDisapprovedInApprovedBy = approvedBy.some(
    (user) => user.status === "Disapproved"
  );

  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        const response = await axios.get(
           `${process.env.REACT_APP_API_BASE_URL}/view-branch`
        );
        const branches = response.data.data;

        // Create a mapping of id to branch_name
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
  // Get branch ID from record
  const branchId = parseInt(record.form_data[0].branch, 10);
  // Get branch name or default to "Unknown"
  const branchName = branchMap.get(branchId) || "Unknown";

  useEffect(() => {
    const currentUserId = localStorage.getItem("id");
    const attachments = JSON.parse(record.attachment);
    const userId = currentUserId ? parseInt(currentUserId) : 0;
    setNotedBy(editableRecord.noted_by);
    setApprovedBy(editableRecord.approved_by);
    setNewData(record.form_data[0].items.map((item) => ({ ...item })));
    setEditableRecord(record);
    setNewTotalBoatFare(record.form_data[0].totalBoatFare);
    setNewTotalHotel(record.form_data[0].totalHotel);
    setNewTotalFare(record.form_data[0].totalFare);
    setNewTotalContingency(record.form_data[0].totalContingency);
    setEditedApprovers(record.approvers_id);
    if (currentUserId) {
      fetchUser(record.user_id);
    }
    try {
      if (typeof record.attachment === "string") {
        // Parse the JSON string if it contains the file path
        const parsedAttachment: string[] = JSON.parse(record.attachment);

        if (parsedAttachment.length > 0) {
          // Construct file URLs
          const fileUrls = parsedAttachment.map(
            (filePath) =>
               `${process.env.REACT_APP_API_BASE_URL}/${filePath.replace(/\\/g, "/")}`
          );
          setAttachmentUrl(fileUrls);
        }
      }
    } catch (error) {
      console.error("Error parsing attachment:", error);
    }
  }, [record]);
  const fetchUser = async (id: number) => {
    setisFetchingUser(true);
    setisFetchingApprovers(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token is missing");
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/view-user/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUser(response.data);
    } catch (error) {
      console.error("Failed to fetch approvers:", error);
    } finally {
      setisFetchingUser(false);
      setisFetchingApprovers(false);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setAttachmentUrl(attachmentUrl);
    setNewAttachments([]); // Clear new attachments
    setRemovedAttachments([]); // Reset removed attachments
    // Reset newData to original values
    setNewData(record.form_data[0].items.map((item) => ({ ...item })));
    setEditedApprovers(record.approvers_id);
    setEditableRecord((prevState) => ({
      ...prevState,
      form_data: [
        {
          ...prevState.form_data[0],
          grand_total: record.form_data[0].grand_total, // Reset grand_total
        },
      ],
    }));
  };

  const calculateGrandTotal = () => {
    let total = 0;
    total += parseFloat(newTotalBoatFare);
    // total += parseFloat(newTotalHotel);
    total += newData.reduce(
      (totalHotelRate, item) => totalHotelRate + Number(item.rate),
      0
    );
    total += parseFloat(newTotalFare);
    total += parseFloat(newTotalContingency);
    total += newData.reduce(
      (totalPerDiem, item) => totalPerDiem + Number(item.perDiem),
      0
    );
    return total.toString();
  };
  const handleEdit = () => {
    setEditedDate(editableRecord.form_data[0].date);
    setNewTotalBoatFare(editableRecord.form_data[0].totalBoatFare);
    setNewTotalHotel(editableRecord.form_data[0].totalHotel);
    setNewTotalFare(editableRecord.form_data[0].totalFare);
    setNewTotalContingency(editableRecord.form_data[0].totalContingency);
    setIsEditing(true);
  };
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setNewAttachments(Array.from(event.target.files));
    }
  };

  const handleRemoveAttachment = (index: number) => {
    // Get the path of the attachment to be removed
    const attachmentPath = attachmentUrl[index].split(
      "storage/attachments/"
    )[1];

    // Add the path to the removedAttachments state
    setRemovedAttachments((prevRemoved) => [...prevRemoved, attachmentPath]);

    // Remove the attachment from the current list
    setAttachmentUrl((prevUrls) => prevUrls.filter((_, i) => i !== index));
  };

  const getDayFromDate = (dateString: string): string => {
    const date = new Date(dateString);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
    return days[date.getDay()];
  };

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };
  const formatDate2 = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };
  if (!record) return null;

  const handleSaveChanges = async () => {
    // Simple validation
    if (
      !newData.every(
        (item) =>
          item.from &&
          item.from.trim() !== "" &&
          item.to &&
          item.to.trim() !== "" &&
          item.cashDate &&
          item.cashDate.trim() !== ""
      )
    ) {
      setErrorMessage("From, to and date cannot be empty.");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("Token is missing");
        return;
      }

      const formData = new FormData();
      formData.append("updated_at", new Date().toISOString());
      const notedByIds = Array.isArray(notedBy)
        ? notedBy.map((person) => person.id)
        : [];
      const approvedByIds = Array.isArray(approvedBy)
        ? approvedBy.map((person) => person.id)
        : [];
      formData.append("noted_by", JSON.stringify(notedByIds));
      formData.append("approved_by", JSON.stringify(approvedByIds));

      formData.append(
        "form_data",
        JSON.stringify([
          {
            branch: editableRecord.form_data[0].branch,
            date: editedDate !== "" ? editedDate : editableRecord.created_at,
            status: editableRecord.status,
            grand_total: calculateGrandTotal(),
            items: newData,
            totalBoatFare: newTotalBoatFare,
            totalHotel: newTotalHotel,
            totalFare: newTotalFare,
            totalContingency: newTotalContingency,
          },
        ])
      );

      // Append existing attachments
      attachmentUrl.forEach((url, index) => {
        const path = url.split("storage/attachments/")[1];
        formData.append(`attachment_url_${index}`, path);
      });

      // Append new attachments
      newAttachments.forEach((file, index) => {
        formData.append("new_attachments[]", file);
      });

      // Append removed attachments
      removedAttachments.forEach((path, index) => {
        formData.append("removed_attachments[]", String(path));
      });

      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/update-request/${record.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setLoading(false);
      setIsEditing(false);
      setSavedSuccessfully(true);
      refreshData();
    } catch (error: any) {
      setLoading(false);
      console.error("Validation error:", error.response?.data?.errors);
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to update Cash advance."
      );
    }
  };

  const handleItemChange = (
    index: number,
    field: keyof Item,
    value: string
  ) => {
    const newDataCopy = [...newData];
    newDataCopy[index] = { ...newDataCopy[index], [field]: value };
    setErrorMessage("");

    // Calculate and update the 'Day' field if the 'Cash Date' changes
    if (field === "cashDate") {
      const date = new Date(value);
      const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const day = days[date.getDay()];
      newDataCopy[index].day = day;
    }

    // Calculate totalAmount if either quantity or unitCost changes
    if (field === "quantity" || field === "unitCost") {
      const quantity = parseFloat(newDataCopy[index].quantity);
      const unitCost = parseFloat(newDataCopy[index].unitCost);
      newDataCopy[index].totalAmount = (quantity * unitCost).toString();
    }

    // Calculate grandTotal
    let total = 0;
    for (const item of newDataCopy) {
      total += parseFloat(item.totalAmount);
    }
    const grandTotal = total.toString();

    setNewData(newDataCopy);
    setEditableRecord((prevState) => ({
      ...prevState,
      form_data: [
        {
          ...prevState.form_data[0],
          grand_total: grandTotal,
          date: editedDate !== "" ? editedDate : prevState.form_data[0].date,
        },
      ],
      approvers_id: editedApprovers,
    }));
  };

  const fetchCustomApprovers = async (id: number) => {
    setisFetchingApprovers(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token is missing");
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/request-forms/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { notedby, approvedby } = response.data;
      setNotedBy(notedby);
      setApprovedBy(approvedby);
    } catch (error) {
      console.error("Failed to fetch approvers:", error);
    } finally {
      setisFetchingApprovers(false);
    }
  };
  const openAddCustomModal = () => {
    setIsModalOpen(true);
  };
  const closeAddCustomModal = () => {
    setIsModalOpen(false);
  };
  const closeModals = () => {
    setIsModalOpen(false);
  };
  const handleOpenAddCustomModal = () => {
    setShowAddCustomModal(true);
  };

  const handleCloseAddCustomModal = () => {
    setShowAddCustomModal(false);
  };

  const handleAddCustomData = (notedBy: Approver[], approvedBy: Approver[]) => {
    setNotedBy(notedBy);
    setApprovedBy(approvedBy);
  };
  const fetchApprovers = async (userId: number) => {
    setFetchingApprovers(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token is missing");
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/custom-approvers/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const approversData = Array.isArray(response.data.data)
        ? response.data.data
        : [];
      setApprovers(approversData);
    } catch (error) {
      console.error("Failed to fetch approvers:", error);
    } finally {
      setFetchingApprovers(false);
    }
  };
  const handlePrint = () => {
    // Construct the data object to be passed
    const data = {
      id: record,
      approvedBy: approvedBy,
      notedBy: notedBy,
      user: user,
    };

    localStorage.setItem("printData", JSON.stringify(data));
    // Open a new window with PrintRefund component
    const newWindow = window.open(`/print-cash`, "_blank");

    // Optional: Focus the new window
    if (newWindow) {
      newWindow.focus();
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="p-4 relative w-full mx-10 md:mx-0 z-10 md:w-1/2 lg:w-2/3 space-y-auto h-4/5 overflow-scroll bg-white border-black shadow-lg">
        <div className=" top-2 flex justify-end cursor-pointer sticky">
          <XMarkIcon
            className="h-8 w-8 text-black  bg-white rounded-full p-1  "
            onClick={closeModal}
          />
        </div>
        <div className="justify-start items-start flex flex-col space-y-4 w-full">
          {!fetchingApprovers && !isFetchingApprovers && (
            <>
              <button
                className="bg-blue-600 p-1 px-2 rounded-md text-white"
                onClick={handlePrint}
              >
                Print
              </button>
              {printWindow && (
                <PrintCash
                  data={{
                    id: record,
                    approvedBy: approvedBy,
                    notedBy: notedBy,
                    user: user,
                  }}
                />
              )}
            </>
          )}
          <div className="flex justify-between w-full items-center">
            <div>
              <h1 className="font-semibold text-[18px]">
                Application for Cash Advance
              </h1>
            </div>
            <div className="w-auto flex ">
              <p>Date: </p>
              <p className="font-bold pl-1">
                {formatDate(editableRecord.created_at)}
              </p>
            </div>
          </div>

          <p className="font-medium text-[14px]">Request ID:#{record.id}</p>
          <div className="flex w-full md:w-1/2 items-center">
            <p>Status:</p>
            <p
              className={`${
                record.status.trim() === "Pending"
                  ? "bg-yellow"
                  : record.status.trim() === "Approved"
                  ? "bg-green"
                  : record.status.trim() === "Disapproved"
                  ? "bg-pink"
                  : "bg-primary"
              } rounded-lg  py-1 w-1/3
             font-medium text-[14px] text-center ml-2 text-white`}
            >
              {" "}
              {record.status}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-2 md:grid-cols-2 w-full">
            <div className="w-1/2  flex ">
              <h1 className="flex items-center">Branch: </h1>
              <p className=" bg-white rounded-md  w-full pl-1 font-bold">
                {branchName}
              </p>
            </div>
          </div>
          <div className="flex">
            <div className="mr-5">
          <div className="w-full overflow-x-auto">
            <div className="w-full border-collapse">
              <table className="border-collapse w-full border-black border lg:overflow-auto xl:table-fixed">
                <thead>
                <tr>
                        <th className="border border-black bg-[#8EC7F7]"></th>
                        <th className="border border-black bg-[#8EC7F7]"></th>
                        <th colSpan={2} className="text-center text-sm bg-[#8EC7F7]">Itinerary</th>
                        <th className="border border-black bg-[#8EC7F7]"></th>
                        <th colSpan={2} className="text-center text-sm bg-[#8EC7F7]">Hotel</th>
                        <th className="border border-black bg-[#8EC7F7]"></th>
                        <th className="border border-black bg-[#8EC7F7]"></th>
                      </tr>
                  <tr>
                    <th className={`${headerStyle}`}>Date</th>
                    <th className={`${headerStyle}`}>Day</th>
                    <th className={`${headerStyle}`}>From</th>
                    <th className={`${headerStyle}`}>To</th>
                    <th className={`${headerStyle}`}>Activity</th>
                    <th className={`${headerStyle}`}>Name</th>
                    <th className={`${headerStyle}`}>Rate</th>
                    <th className={`${headerStyle}`}>Per Diem</th>
                    <th className={`${headerStyle}`}>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {isEditing
                    ? newData.map((item, index) => (
                        <tr key={index}>
                          <td className="tableCellStyle break-words">
                            <input
                              type="date"
                              value={item.cashDate}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "cashDate",
                                  e.target.value
                                )
                              }
                              className="w-full bg-white"
                            />
                          </td>
                          <td className="tableCellStyle break-words border-2 border-black">
                            <input
                              type="text"
                              value={item.day}
                              onChange={(e) =>
                                handleItemChange(index, "day", e.target.value)
                              }
                              className="w-full bg-white"
                            />
                          </td>
                          <td className="tableCellStyle break-words border-2 border-black">
                            <input
                              type="text"
                              value={item.from}
                              onChange={(e) =>
                                handleItemChange(index, "from", e.target.value)
                              }
                              className="w-full bg-white"
                            />
                          </td>
                          <td className="tableCellStyle break-words border-2 border-black">
                            <input
                              type="text"
                              value={item.to}
                              onChange={(e) =>
                                handleItemChange(index, "to", e.target.value)
                              }
                              className="w-full bg-white"
                            />
                          </td>
                          <td className="tableCellStyle break-words border-2 border-black">
                            <input
                              type="text"
                              value={item.activity}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "activity",
                                  e.target.value
                                )
                              }
                              className="w-full bg-white"
                            />
                          </td>
                          <td className="tableCellStyle break-words border-2 border-black">
                            <input
                              type="text"
                              value={item.hotel}
                              onChange={(e) =>
                                handleItemChange(index, "hotel", e.target.value)
                              }
                              className="w-full bg-white"
                            />
                          </td>
                          <td className="tableCellStyle break-words border-2 border-black">
                            <input
                              type="text"
                              value={item.rate}
                              onChange={(e) =>
                                handleItemChange(index, "rate", e.target.value)
                              }
                              className="w-full bg-white"
                            />
                          </td>
                          <td className="tableCellStyle break-words border-2 border-black">
                            <input
                              type="text"
                              value={item.perDiem}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "perDiem",
                                  e.target.value
                                )
                              }
                              className="w-full bg-white"
                            />
                          </td>
                          <td className="tableCellStyle break-words border-2 border-black">
                            <input
                              type="text"
                              value={item.remarks}
                              onChange={(e) =>
                                handleItemChange(
                                  index,
                                  "remarks",
                                  e.target.value
                                )
                              }
                              className="w-full bg-white"
                            />
                          </td>
                        </tr>
                      ))
                    : editableRecord.form_data[0].items.map((item, index) => (
                        <tr key={index}>
                          <td className={tableCellStyle}>
                            {formatDate2(item.cashDate)}
                          </td>
                          <td className={tableCellStyle}>{item.day}</td>
                          <td className={tableCellStyle}>{item.from}</td>
                          <td className={tableCellStyle}>{item.to}</td>
                          <td className={tableCellStyle}>{item.activity}</td>
                          <td className={tableCellStyle}>{item.hotel}</td>
                          <td className={tableCellStyle}>{item.rate}</td>
                          <td className={tableCellStyle}>{item.perDiem}</td>
                          <td className={tableCellStyle}>{item.remarks}</td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
          {errorMessage && <p className="text-red-500">{errorMessage}</p>}
          </div>
          <div>
          <div className="inline-block w-full">
            <table className="border border-black h-fit">
              <thead>
                <tr>
                  <th colSpan={2} className="bg-[#8EC7F7]">
                    <p className="font-semibold text-[12px]">
                      SUMMARY OF EXPENSES TO BE INCURRED (for C/A)
                    </p>
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className={`${tableStyle}`}>
                    <p className="font-semibold text-sm">BOAT FARE</p>
                  </td>
                  <td className={`${inputStyle}`}>
                    {isEditing ? (
                      <input
                        type="number"
                        value={newTotalBoatFare}
                        onChange={(e) => setNewTotalBoatFare(e.target.value)}
                        className="w-full bg-white"
                        readOnly={!isEditing}
                      />
                    ) : (
                      parseFloat(
                        editableRecord.form_data[0].totalBoatFare
                      ).toFixed(2)
                    )}
                  </td>
                </tr>
                <tr>
                  <td className={`${tableStyle}`}>
                    <p className="font-semibold text-sm">HOTEL</p>
                  </td>
                  <td className={`${inputStyle}`}>
                    {/* {isEditing ? (
                      <input
                        type="number"
                        value={newTotalHotel}
                        onChange={(e) => setNewTotalHotel(e.target.value)}
                        className="w-full bg-white"
                        readOnly={!isEditing}
                      />
                    ) : (
                      parseFloat(
                        editableRecord.form_data[0].totalHotel
                      ).toFixed(2)
                    )} */}
                    {newData.reduce(
                      (totalHotelRate, item) =>
                        totalHotelRate + Number(item.rate),
                      0
                    )}
                  </td>
                </tr>
                <tr>
                  <td className={`${tableStyle} `}>
                    <p className="font-semibold text-sm">PER DIEM</p>
                  </td>
                  <td className={`${inputStyle} p-2`}>
                    {/* Display calculated total per diem */}
                    {newData.reduce(
                      (totalPerDiem, item) =>
                        totalPerDiem + Number(item.perDiem),
                      0
                    )}
                  </td>
                </tr>
                <tr>
                  <td className={`${tableStyle}`}>
                    <p className="font-semibold text-sm">FARE</p>
                  </td>
                  <td className={`${inputStyle}`}>
                    {isEditing ? (
                      <input
                        type="number"
                        value={newTotalFare}
                        onChange={(e) => setNewTotalFare(e.target.value)}
                        className="w-full bg-white"
                        readOnly={!isEditing}
                      />
                    ) : (
                      parseFloat(editableRecord.form_data[0].totalFare).toFixed(
                        2
                      )
                    )}
                  </td>
                </tr>
                <tr>
                  <td className={`${tableStyle}`}>
                    <p className="font-semibold text-sm">CONTINGENCY</p>
                  </td>
                  <td className={`${inputStyle}`}>
                    {isEditing ? (
                      <input
                        type="number"
                        value={newTotalContingency}
                        onChange={(e) => setNewTotalContingency(e.target.value)}
                        className="w-full bg-white"
                        readOnly={!isEditing}
                      />
                    ) : (
                      parseFloat(
                        editableRecord.form_data[0].totalContingency
                      ).toFixed(2)
                    )}
                  </td>
                </tr>
                <tr>
                  <td className={`${tableStyle} py-1`}></td>
                  <td className={`${tableStyle}`}></td>
                </tr>
                <tr>
                  <td className={`${tableStyle} font-bold text-sm`}>TOTAL</td>
                  <td className={`${tableStyle} whitespace-nowrap text-center font-bold`}>
                    ₱{" "}
                    {isEditing
                      ? calculateGrandTotal()
                      : editableRecord.form_data[0].grand_total}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          </div>
          </div>
          {isEditing && (
            <div className="my-2">
              <button
                onClick={openAddCustomModal}
                className="bg-primary  text-white p-2 rounded"
              >
                Edit Approver
              </button>
            </div>
          )}
          <div className="w-full flex-col justify-center items-center">
            {isFetchingApprovers ? (
              <div className="flex items-center justify-center w-full h-40">
                <h1>Fetching..</h1>
              </div>
            ) : (
              <div className="flex flex-wrap">
                <div className="mb-4 ml-5">
                  <h3 className="font-bold mb-3">Requested By:</h3>
                  <ul className="flex flex-wrap gap-6">
                    <li className="flex flex-col items-center justify-center text-center relative w-auto">
                      <div className="relative flex flex-col items-center justify-center">
                        {/* Signature */}
                        {user.data?.signature && (
                          <div className="absolute -top-4">
                            <img
                              src={user.data?.signature}
                              alt="avatar"
                              width={120}
                              className="relative z-20 pointer-events-none"
                              draggable="false"
                              onContextMenu={(e) => e.preventDefault()}
                              style={{ filter: "blur(1px)" }} // Optional: Apply a blur
                            />
                          </div>
                        )}
                        {/* Name */}
                        <p className="relative inline-block uppercase font-medium text-center mt-4 z-10">
                          <span className="relative z-10">
                            {user.data?.firstName} {user.data?.lastName}
                          </span>
                          <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-black"></span>
                        </p>
                        {/* Position */}
                        <p className="font-bold text-[12px] text-center mt-1">
                          {user.data?.position}
                        </p>
                        {/* Status, if needed */}
                        {user.data?.status && (
                          <p
                            className={`font-bold text-[12px] text-center mt-1 ${
                              user.data?.status === "Approved"
                                ? "text-green"
                                : user.data?.status === "Pending"
                                ? "text-yellow"
                                : user.data?.status === "Rejected"
                                ? "text-red"
                                : ""
                            }`}
                          >
                            {user.data?.status}
                          </p>
                        )}
                      </div>
                    </li>
                  </ul>
                </div>

                <div className="mb-4 ml-5">
                  <h3 className="font-bold mb-3">Noted By:</h3>
                  <ul className="flex flex-wrap gap-6">
                    {notedBy.map((user, index) => (
                      <li
                        className="flex flex-col items-center justify-center text-center relative"
                        key={index}
                      >
                        <div className="relative flex flex-col items-center justify-center text-center">
                          {/* Signature */}
                          {(user.status === "Approved" ||
                            (typeof user.status === "string" &&
                              user.status.split(" ")[0] === "Rejected")) && (
                            <div className="absolute -top-4">
                              <img
                                src={user.signature}
                                alt="avatar"
                                width={120}
                                className="relative z-20 pointer-events-none"
                                draggable="false"
                                onContextMenu={(e) => e.preventDefault()}
                                style={{ filter: "blur(1px)" }} // Optional: Apply a blur
                              />
                            </div>
                          )}
                          {/* Name */}
                          <p className="relative inline-block uppercase font-medium text-center mt-4 z-10">
                            <span className="relative z-10">
                              {user.firstName} {user.lastName}
                            </span>
                            <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-black"></span>
                          </p>
                          {/* Position */}
                          <p className="font-bold text-[12px] text-center mt-1">
                            {user.position}
                          </p>
                          {/* Status */}
                          {hasDisapprovedInApprovedBy ||
                          hasDisapprovedInNotedBy ? (
                            user.status === "Disapproved" ? (
                              <p className="font-bold text-[12px] text-center text-red-500 mt-1">
                                {user.status}
                              </p>
                            ) : null
                          ) : (
                            <p
                              className={`font-bold text-[12px] text-center mt-1 ${
                                user.status === "Approved"
                                  ? "text-green"
                                  : user.status === "Pending"
                                  ? "text-yellow"
                                  : ""
                              }`}
                            >
                              {user.status}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mb-4 ml-5">
                  <h3 className="font-bold mb-3">Approved By:</h3>
                  <ul className="flex flex-wrap gap-6">
                    {approvedBy.map((user, index) => (
                      <li
                        className="flex flex-col items-center justify-center text-center relative"
                        key={index}
                      >
                        <div className="relative flex flex-col items-center justify-center text-center">
                          {/* Signature */}
                          {(user.status === "Approved" ||
                            (typeof user.status === "string" &&
                              user.status.split(" ")[0] === "Rejected")) && (
                            <div className="absolute -top-4">
                              <img
                                src={user.signature}
                                alt="avatar"
                                width={120}
                                className="relative z-20 pointer-events-none"
                                draggable="false"
                                onContextMenu={(e) => e.preventDefault()}
                                style={{ filter: "blur(1px)" }} // Optional: Apply a blur
                              />
                            </div>
                          )}
                          {/* Name */}
                          <p className="relative inline-block uppercase font-medium text-center mt-4 z-10">
                            <span className="relative z-10">
                              {user.firstName} {user.lastName}
                            </span>
                            <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-black"></span>
                          </p>
                          {/* Position */}
                          <p className="font-bold text-[12px] text-center mt-1">
                            {user.position}
                          </p>
                          {/* Status */}
                          {hasDisapprovedInApprovedBy ||
                          hasDisapprovedInNotedBy ? (
                            user.status === "Disapproved" ? (
                              <p className="font-bold text-[12px] text-center text-red-500 mt-1">
                                {user.status}
                              </p>
                            ) : null
                          ) : (
                            <p
                              className={`font-bold text-[12px] text-center mt-1 ${
                                user.status === "Approved"
                                  ? "text-green"
                                  : user.status === "Pending"
                                  ? "text-yellow"
                                  : ""
                              }`}
                            >
                              {user.status}
                            </p>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
          <div className="w-full">
            <h1 className="font-bold">Attachments:</h1>
            <div>
              {attachmentUrl
                .filter((_, index) => !removedAttachments.includes(index))
                .map((url, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500"
                    >
                      {url.split("/").pop()}
                    </a>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(index)}
                        className="text-red-500"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}

              {/* Check if there are no attachments */}
              {attachmentUrl.filter(
                (_, index) => !removedAttachments.includes(index)
              ).length === 0 && (
                <p className="text-gray-500">No attachments available.</p>
              )}
            </div>

            {isEditing && (
              <div>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="mt-2"
                />
              </div>
            )}
          </div>

          <div className="w-full">
            <h2 className="text-lg font-bold mb-2">Comments</h2>

            {/* Check if there are no comments in both notedBy and approvedBy */}
            {notedBy.filter((user) => user.comment).length === 0 &&
            approvedBy.filter((user) => user.comment).length === 0 ? (
              <p className="text-gray-500">No comments yet.</p>
            ) : (
              <>
                {/* Render Noted By comments */}
                <ul className="flex flex-col w-full mb-4 space-y-4">
                  {notedBy
                    .filter((user) => user.comment)
                    .map((user, index) => (
                      <div className="flex" key={index}>
                        <div>
                          <img
                            alt="avatar"
                            className="cursor-pointer hidden sm:block"
                            src={Avatar}
                            height={35}
                            width={45}
                          />
                        </div>
                        <div className="flex flex-row w-full">
                          <li className="flex flex-col justify-between pl-2">
                            <h3 className="font-bold text-lg">
                              {user.firstName} {user.lastName}
                            </h3>
                            <p>{user.comment}</p>
                          </li>
                        </div>
                      </div>
                    ))}
                </ul>

                {/* Render Approved By comments */}
                <ul className="flex flex-col w-full mb-4 space-y-4">
                  {approvedBy
                    .filter((user) => user.comment)
                    .map((user, index) => (
                      <div className="flex" key={index}>
                        <div>
                          <img
                            alt="avatar"
                            className="cursor-pointer hidden sm:block"
                            src={Avatar}
                            height={35}
                            width={45}
                          />
                        </div>
                        <div className="flex flex-row w-full">
                          <li className="flex flex-col justify-between pl-2">
                            <h3 className="font-bold text-lg">
                              {user.firstName} {user.lastName}
                            </h3>
                            <p>{user.comment}</p>
                          </li>
                        </div>
                      </div>
                    ))}
                </ul>
              </>
            )}
          </div>

          <div className="md:absolute  right-20 top-2 items-center">
            {isEditing ? (
              <div>
                <button
                  className="bg-primary text-white items-center h-10 rounded-xl p-2"
                  onClick={handleSaveChanges}
                >
                  {loading ? (
                    <BeatLoader color="white" size={10} />
                  ) : (
                    "Save Changes"
                  )}
                </button>
                <button
                  className="bg-red-600 rounded-xl text-white ml-2 p-2"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            ) : (
              !fetchingApprovers &&
              !isFetchingApprovers &&
              editableRecord.status === "Pending" && (
                <button
                  className="bg-blue-500 ml-2 rounded-xl p-2 flex text-white"
                  onClick={handleEdit}
                >
                  <PencilIcon className="h-6 w-6 mr-2" />
                  Edit
                </button>
              )
            )}
          </div>
        </div>
      </div>
      {savedSuccessfully && (
        <EditStockModalSuccess
          closeSuccessModal={closeModal}
          refreshData={refreshData}
        />
      )}
      <AddCustomModal
        modalIsOpen={isModalOpen}
        closeModal={closeModals}
        openCompleteModal={() => {}}
        entityType="Approver"
        initialNotedBy={notedBy}
        initialApprovedBy={approvedBy}
        refreshData={() => {}}
        handleAddCustomData={handleAddCustomData}
      />
    </div>
  );
};

export default ViewCashAdvanceModal;
