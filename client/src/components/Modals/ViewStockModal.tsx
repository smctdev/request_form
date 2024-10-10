import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { BeatLoader } from "react-spinners";
import axios from "axios";
import PencilIcon from "@heroicons/react/24/solid/PencilIcon";
import EditStockModalSuccess from "./EditStockModalSuccess";
import { read } from "fs";
import Avatar from "../assets/avatar.png";
import PrintStock from "../PrintStock";
import AddCustomModal from "../EditCustomModal";
import { error } from "console";
const get = localStorage.getItem("id");
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

  purpose: string;
  items: Item[];
  branch: string;
  date: string;
  grand_total: string;
  supplier: string;
  address: string;
};

type Item = {
  quantity: string;
  description: string;
  unitCost: string;
  totalAmount: string;
  remarks: string;
};
const tableStyle2 = "bg-white p-2";
const inputStyle = "border border-black text-[12px] font-bold p-2";
const tableCellStyle = `${inputStyle} w-20`;

const ViewStockModal: React.FC<Props> = ({
  closeModal,
  record,
  refreshData,
}) => {
  const [editableRecord, setEditableRecord] = useState(record);
  const [newData, setNewData] = useState<Item[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editedDate, setEditedDate] = useState("");
  const [editedApprovers, setEditedApprovers] = useState<number>(
    record.approvers_id
  );
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [fetchingApprovers, setFetchingApprovers] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [checkedPurpose, setCheckedPurpose] = useState<string | null>(null);
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const [customApprovers, setCustomApprovers] = useState<Approver[]>([]);
  const [notedBy, setNotedBy] = useState<Approver[]>([]);
  const [approvedBy, setApprovedBy] = useState<Approver[]>([]);
  const [isFetchingApprovers, setIsFetchingApprovers] = useState(false);
  const [user, setUser] = useState<any>({});
  const [isFetchingUser, setIsFetchingUser] = useState(false);
  const [printWindow, setPrintWindow] = useState<Window | null>(null);
  const [attachmentUrl, setAttachmentUrl] = useState<string[]>([]);
  const [newAttachments, setNewAttachments] = useState<File[]>([]);
  const [originalAttachments, setOriginalAttachments] = useState<string[]>([]);
  const [removedAttachments, setRemovedAttachments] = useState<
    (string | number)[]
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
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
    const attachments = JSON.parse(record.attachment);
    const currentUserId = localStorage.getItem("id");
    const userId = currentUserId ? parseInt(currentUserId) : 0;

    setNewData(record.form_data[0].items.map((item) => ({ ...item })));
    setEditableRecord(record);
    setNotedBy(editableRecord.noted_by);
    setApprovedBy(editableRecord.approved_by);
    setCheckedPurpose(record.form_data[0].purpose);
    setEditedApprovers(record.approvers_id);
    if (currentUserId) {
      fetchUser(record.user_id);

      /*  fetchCustomApprovers(record.id); */
    }
    try {
      // If record.attachment is a JSON string, parse it
      if (typeof record.attachment === "string") {
        const parsedAttachment = JSON.parse(record.attachment);
        // Handle the parsed attachment
        const fileUrls = parsedAttachment.map(
          (filePath: string) =>
            `${process.env.REACT_APP_API_BASE_URL}/${filePath.replace(/\\/g, "/")}`
        );
        setAttachmentUrl(fileUrls);
      } else {
        // Handle case where record.attachment is already an object
        console.warn("Attachment is not a JSON string:", record.attachment);
        // Optionally handle this case if needed
      }
    } catch (error) {
      console.error("Error parsing attachment:", error);
    }
  }, [record]);
  const fetchUser = async (id: number) => {
    setIsFetchingUser(true);
    setIsFetchingApprovers(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token is missing");
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/profile`,
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
      setIsFetchingUser(false);
      setIsFetchingApprovers(false);
    }
  };


  const handleEdit = () => {
    setEditedDate(editableRecord.form_data[0].date); // Initialize editedDate with the original date
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNotedBy(record.noted_by);
    setApprovedBy(record.approved_by);
    setAttachmentUrl(attachmentUrl);
    setNewAttachments([]); // Clear new attachments
    setRemovedAttachments([]); // Reset removed attachments
    setCheckedPurpose(record.form_data[0].purpose);
    setEditedApprovers(record.approvers_id);
    // Reset newData to original values
    setNewData(record.form_data[0].items.map((item) => ({ ...item })));
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

  const handleSaveChanges = async () => {
    if (
      !newData.every(
        (item) =>
          parseFloat(item.quantity) > 0 &&
          parseFloat(item.unitCost) > 0 &&
          item.description &&
          item.description.trim() !== ""
      )
    ) {
      setErrorMessage(
        "Quantity and unit cost must be greater than 0, and description cannot be empty."
      );
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
      formData.append("status", "Pending");
      formData.append("approved_by", JSON.stringify(approvedByIds));
      formData.append(
        "form_data",
        JSON.stringify([
          {
            branch: editableRecord.form_data[0].branch,
            date: editedDate !== "" ? editedDate : editableRecord.created_at,
            status: editableRecord.status,
            grand_total: editableRecord.form_data[0].grand_total,
            purpose: checkedPurpose || editableRecord.form_data[0].purpose,
            items: newData,
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
      setRemovedAttachments([]); // Clear removed attachments state
      refreshData();
    } catch (error: any) {
      setLoading(false);
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          "Failed to update stock requisition."
      );
    }
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

  const handlePurposeChange = (purpose: string) => {
    setCheckedPurpose(purpose);
  };

  const handleItemChange = (
    index: number,
    field: keyof Item,
    value: string
  ) => {
    // Update the field of the item at the specified index in newData
    const newDataCopy = [...newData];
    newDataCopy[index] = { ...newDataCopy[index], [field]: value };
    setErrorMessage("");
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

    // Update the state with the modified newDataCopy and grandTotal
    setNewData(newDataCopy);
    setEditableRecord((prevState) => ({
      ...prevState,
      form_data: [
        {
          ...prevState.form_data[0],
          grand_total: grandTotal,
          date: editedDate !== "" ? editedDate : prevState.form_data[0].date,
          purpose: checkedPurpose || prevState.form_data[0].purpose,
        },
      ],
      approvers_id: editedApprovers,
    }));
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
      purpose: checkedPurpose,
      requested_branch: record?.branch,
    };

    localStorage.setItem("printData", JSON.stringify(data));
    // Open a new window with PrintRefund component
    const newWindow = window.open(`/print-stock`, "_blank");

    // Optional: Focus the new window
    if (newWindow) {
      newWindow.focus();
    }
  };

  return (
    <div className="fixed top-0 left-0 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
      <div className="relative z-10 w-full p-4 mx-10 overflow-scroll bg-white border-black rounded-t-lg shadow-lg md:mx-0 md:w-1/2 space-y-auto h-3/4">
        <div className="sticky flex justify-end cursor-pointer top-2">
          <XMarkIcon
            className="w-8 h-8 p-1 text-black bg-white rounded-full "
            onClick={closeModal}
          />
        </div>
        <div className="flex flex-col items-start justify-start w-full space-y-4">
          {!fetchingApprovers && !isFetchingApprovers && (
            <>
              <button
                className="p-1 px-2 text-white bg-blue-600 rounded-md"
                onClick={handlePrint}
              >
                Print
              </button>
              {printWindow && (
                <PrintStock
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
          <div className="flex items-center justify-between w-full">
            <div>
              <h1 className="font-semibold text-[18px]">
                Stock Requisition Slip
                {record?.branch || 'n/a'}
              </h1>
            </div>
            <div className="flex w-auto ">
              <p>Date: </p>
              <p className="font-bold">
                {formatDate(editableRecord.created_at)}
              </p>
            </div>
          </div>
          <p className="font-medium text-[14px]">Request ID:#{record.id}</p>
          <div className="flex items-center w-full md:w-1/2">
            <p>Status:</p>
            <p
              className={`${
                record.status.trim() === "Pending"
                  ? "bg-yellow"
                  : record.status.trim() === "Approved"
                  ? "bg-green"
                  : record.status.trim() === "Disapproved"
                  ? "bg-pink"
                  : record.status.trim() === "Ongoing"
                  ? "bg-primary"
                  : ""
              } rounded-lg  py-1 w-1/3
             font-medium text-[14px] text-center ml-2 text-white`}
            >
              {" "}
              {record.status}
            </p>
          </div>

          <p className="font-medium text-[14px]">
            Purpose: {record.form_data[0].purpose}
          </p>
          {isEditing && (
            <div className="flex flex-col md:flex-row md:space-x-2">
              <label>
                Repo. Recon
                <input
                  type="checkbox"
                  checked={checkedPurpose === "Repo. Recon"}
                  onChange={() => handlePurposeChange("Repo. Recon")}
                  disabled={!isEditing}
                  className="size-4"
                />
              </label>
              <label>
                Repair & Maintenance
                <input
                  type="checkbox"
                  checked={checkedPurpose === "Repair & Maintenance"}
                  onChange={() => handlePurposeChange("Repair & Maintenance")}
                  disabled={!isEditing}
                  className="size-4"
                />
              </label>
              <label>
                Office/Service Used
                <input
                  type="checkbox"
                  checked={checkedPurpose === "Office/Service Used"}
                  onChange={() => handlePurposeChange("Office/Service Used")}
                  disabled={!isEditing}
                  className="size-4"
                />
              </label>
            </div>
          )}
          <div className="flex w-1/2 ">
            <h1 className="flex items-center">Branch: </h1>
            <p className="w-full pl-1 font-bold bg-white rounded-md ">
              {branchName}
            </p>
          </div>

          <div className="w-full mt-4 overflow-x-auto">
            <div className="w-full border-collapse">
              <div className="table-container">
                <table className="w-full border table-auto lg:table-fixed">
                  <thead className="border border-black h-14 bg-[#8EC7F7]">
                    <tr className="border text-[10px]">
                      <th className={`${inputStyle} w-1/12`}>QTY</th>
                      <th
                        className={`${inputStyle} w-1/3 break-words whitespace-normal`}
                      >
                        DESCRIPTION
                      </th>
                      <th className={`${inputStyle} w-1/12`}>UNIT COST</th>
                      <th className={`${inputStyle} w-1/12`}>TOTAL AMOUNT</th>
                      <th
                        className={`${inputStyle} w-1/4 break-words whitespace-normal`}
                      >
                        USAGE/REMARKS
                      </th>
                    </tr>
                  </thead>
                  <tbody className={`${tableCellStyle}`}>
                    {isEditing
                      ? newData.map((item, index) => (
                          <tr key={index}>
                            <td className={tableCellStyle}>
                              <input
                                type="number"
                                value={item.quantity}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "quantity",
                                    e.target.value
                                  )
                                }
                                className={`${tableStyle2} w-full`}
                              />
                            </td>
                            <td className={tableCellStyle}>
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "description",
                                    e.target.value
                                  )
                                }
                                className={`${tableStyle2} w-full break-words whitespace-normal`}
                              />
                            </td>
                            <td className={tableCellStyle}>
                              <input
                                type="number"
                                value={item.unitCost}
                                onChange={(e) =>
                                  handleItemChange(
                                    index,
                                    "unitCost",
                                    e.target.value
                                  )
                                }
                                className={`${tableStyle2} w-full`}
                              />
                            </td>
                            <td className={tableCellStyle}>
                              <input
                                type="text"
                                value={item.totalAmount}
                                readOnly
                                className={`${tableStyle2} w-full`}
                              />
                            </td>
                            <td className={tableCellStyle}>
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
                                className={`${tableStyle2} w-full break-words whitespace-normal`}
                              />
                            </td>
                          </tr>
                        ))
                      : editableRecord.form_data[0].items.map((item, index) => (
                          <tr key={index}>
                            <td className={tableCellStyle}>{item.quantity}</td>
                            <td
                              className={`${tableCellStyle} break-words whitespace-normal`}
                            >
                              {item.description}
                            </td>
                            <td className={tableCellStyle}>{item.unitCost}</td>
                            <td className={tableCellStyle}>
                              {item.totalAmount}
                            </td>
                            <td
                              className={`${tableCellStyle} break-words whitespace-normal`}
                            >
                              {item.remarks}
                            </td>
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
            </div>

            {errorMessage && <p className="text-red-600">{errorMessage}</p>}
          </div>
          <div className="w-full">
            <h1>Grand Total</h1>
            <input
              type="text"
              className="w-full p-1 mt-2 font-bold bg-white border border-black rounded-md "
              value={`₱ ${editableRecord.form_data[0].grand_total}`}
              readOnly
            />
          </div>
          {/*  <div className="w-full pr-12">
            <h1>Approvers</h1>
            {fetchingApprovers ? (
              <p>Loading approvers...</p>
            ) : (
              <select
                className="w-1/2 h-10 mt-2 border border-black rounded-lg"
                value={
                  isEditing ? editedApprovers : editableRecord.approvers_id
                }
                onChange={(e) => {
                  const selectedApproverId = parseInt(e.target.value);

                  setEditedApprovers(selectedApproverId);
                }}
                disabled={!isEditing}
              >
                <option value="" disabled>
                  Approver List
                </option>
                {approvers.map((approver) => (
                  <option key={approver.id} value={approver.id}>
                    {approver.name}
                  </option>
                ))}
              </select>
            )}
          </div> */}
          {isEditing && (
            <div className="my-2">
              <button
                onClick={openAddCustomModal}
                className="p-2 text-white rounded bg-primary"
              >
                Edit Approver
              </button>
            </div>
          )}
          <div className="flex-col items-center justify-center w-full">
            {isFetchingApprovers ? (
              <div className="flex items-center justify-center w-full h-40">
                <h1>Fetching..</h1>
              </div>
            ) : (
              <div className="flex flex-wrap">
                <div className="mb-4 ml-5">
                  <h3 className="mb-3 font-bold">Requested By:</h3>
                  <ul className="flex flex-wrap gap-6">
                    <li className="relative flex flex-col items-center justify-center w-auto text-center">
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
                        <p className="relative z-10 inline-block mt-4 font-medium text-center uppercase">
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
                  <h3 className="mb-3 font-bold">Noted By:</h3>
                  <ul className="flex flex-wrap gap-6">
                    {notedBy.map((user, index) => (
                      <li
                        className="relative flex flex-col items-center justify-center text-center"
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
                          <p className="relative z-10 inline-block mt-4 font-medium text-center uppercase">
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
                  <h3 className="mb-3 font-bold">Approved By:</h3>
                  <ul className="flex flex-wrap gap-6">
                    {approvedBy.map((user, index) => (
                      <li
                        className="relative flex flex-col items-center justify-center text-center"
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
                          <p className="relative z-10 inline-block mt-4 font-medium text-center uppercase">
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
            <h2 className="mb-2 text-lg font-bold">Comments:</h2>

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
                            className="hidden cursor-pointer sm:block"
                            src={Avatar}
                            height={35}
                            width={45}
                          />
                        </div>
                        <div className="flex flex-row w-full">
                          <li className="flex flex-col justify-between pl-2">
                            <h3 className="text-lg font-bold">
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
                            className="hidden cursor-pointer sm:block"
                            src={Avatar}
                            height={35}
                            width={45}
                          />
                        </div>
                        <div className="flex flex-row w-full">
                          <li className="flex flex-col justify-between pl-2">
                            <h3 className="text-lg font-bold">
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

          <div className="items-center md:absolute right-20 top-2">
            {isEditing ? (
              <div>
                <button
                  className="items-center h-10 p-2 text-white bg-primary rounded-xl"
                  onClick={handleSaveChanges}
                >
                  {loading ? (
                    <BeatLoader color="white" size={10} />
                  ) : (
                    "Save Changes"
                  )}
                </button>
                <button
                  className="p-2 ml-2 text-white bg-red-600 rounded-xl"
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            ) : (
              !fetchingApprovers &&
              !isFetchingApprovers &&
              (editableRecord.status === "Pending" || editableRecord.status === "Disapproved") && (
                <button
                  className="flex p-2 ml-2 text-white bg-blue-500 rounded-xl"
                  onClick={handleEdit}
                >
                  <PencilIcon className="w-6 h-6 mr-2" />
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

export default ViewStockModal;
