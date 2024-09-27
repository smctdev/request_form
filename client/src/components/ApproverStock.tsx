import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { BeatLoader } from "react-spinners";
import { request } from "http";
import PrintStock from "./PrintStock";
import Avatar from "./assets/avatar.png";
import SMCTLogo from "./assets/SMCT.png";
import DSMLogo from "./assets/DSM.jpg";
import DAPLogo from "./assets/DAP.jpg";
import HDILogo from "./assets/HDI.jpg";
import RequestSuccessModal from "./Modals/RequestSuccessModal";
import ApproveSuccessModal from "./ApproveSuccessModal";
type Props = {
  closeModal: () => void;
  record: Record;
  refreshData: () => void;
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
type Record = {
  request_code: string;
  created_at: Date;
  id: number;
  status: string;
  approvers_id: number;
  form_data: FormData[];
  branch: string;
  date: string;
  user_id: number;
  attachment: string;
  noted_by: Approver[];
  approved_by: Approver[];
  avp_staff: Approver[];
  approved_attachment: string;
};

type FormData = {
  approvers_id: number;
  approvers: {
    noted_by: {
      firstName: string;
      lastName: string;
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
  purpose: string;
  items: Item[];
  branch: string;
  date: string;
  grand_total: string;
};

type Item = {
  quantity: string;
  description: string;
  unitCost: string;
  totalAmount: string;
  remarks: string;
};

const inputStyle = "border border-black text-[12px] font-bold p-2";
const tableCellStyle = `${inputStyle} w-20`;

const ApproversStock: React.FC<Props> = ({
  closeModal,
  record,
  refreshData,
}) => {
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [fetchingApprovers, setFetchingApprovers] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [checkedPurpose, setCheckedPurpose] = useState("");
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(false);
  const [removedAttachments, setRemovedAttachments] = useState<
    (string | number)[]
  >([]);
  const [attachment, setAttachment] = useState<any>([]);
  const [isFetchingApprovers, setisFetchingApprovers] = useState(false);
  const [notedBy, setNotedBy] = useState<Approver[]>([]);
  const [approvedBy, setApprovedBy] = useState<Approver[]>([]);
  const [avpstaff, setAvpstaff] = useState<Approver[]>([]);
  const [user, setUser] = useState<any>({});
  const [isFetchingUser, setisFetchingUser] = useState(false);
  const [printWindow, setPrintWindow] = useState<Window | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [approveLoading, setApprovedLoading] = useState(false);
  const [editedApprovers, setEditedApprovers] = useState<number>(
    record.approvers_id
  );
  const [file, setFile] = useState<File[]>([]);
  const [commentMessage, setCommentMessage] = useState("");
  const [attachmentUrl, setAttachmentUrl] = useState<string[]>([]);
  const [modalStatus, setModalStatus] = useState<"approved" | "disapproved">(
    "approved"
  );
  const [position, setPosition] = useState("");
  const [branchList, setBranchList] = useState<any[]>([]);
  const [branchMap, setBranchMap] = useState<Map<number, string>>(new Map());
  const hasDisapprovedInNotedBy = notedBy.some(
    (user) => user.status === "Disapproved"
  );
  const hasDisapprovedInApprovedBy = approvedBy.some(
    (user) => user.status === "Disapproved"
  );

  let logo;
  if (user?.data?.branch === "Strong Motocentrum, Inc.") {
    logo = <img src={SMCTLogo} alt="SMCT Logo" />;
  } else if (user?.data?.branch === "Des Strong Motors, Inc.") {
    logo = <img src={DSMLogo} alt="DSM Logo" />;
  } else if (user?.data?.branch === "Des Appliance Plaza, Inc.") {
    logo = <img src={DAPLogo} alt="DAP Logo" />;
  } else if (user?.data?.branch === "Honda Des, Inc.") {
    logo = <img src={HDILogo} alt="HDI Logo" />;
  } else {
    logo = null; // Handle the case where branch does not match any of the above
  }
  useEffect(() => {
    const fetchUserInformation = async () => {
      try {
        const id = localStorage.getItem("id");
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("Token is missing");
          return;
        }

        const response = await axios.get(
          `http://122.53.61.91:6002/api/view-user/${id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.status) {
          setUser(response.data.data);

          setPosition(response.data.data.position);
        } else {
          throw new Error(
            response.data.message || "Failed to fetch user information"
          );
        }
      } finally {
        setLoading(false); // Update loading state when done fetching
      }
    };

    fetchUserInformation();
  }, []);
  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        const response = await axios.get(
          `http://122.53.61.91:6002/api/view-branch`
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

  useEffect(() => {
    // Log the entire record object to understand its structure
    console.log("Record data:", record);

    // Fetch user data based on user_id
    fetchUser(record.user_id);

    // Set other state values from record
    setNotedBy(record.noted_by);
    setAvpstaff(record.avp_staff);
    setApprovedBy(record.approved_by);
    setCheckedPurpose(record.form_data[0].purpose);

    try {
      // Handle record.attachment if it is a JSON string
      if (typeof record.attachment === "string") {
        const parsedAttachment = JSON.parse(record.attachment);
        const fileUrls = parsedAttachment.map(
          (filePath: string) =>
            `http://122.53.61.91:6002/storage/${filePath.replace(/\\/g, "/")}`
        );
        setAttachmentUrl(fileUrls);
        console.log("Parsed attachment URLs:", fileUrls); // Log parsed URLs
      } else {
        console.warn("Attachment is not a JSON string:", record.attachment);
      }

      // Check if approved_attachment is an array with a string element
      if (
        Array.isArray(record.approved_attachment) &&
        record.approved_attachment.length > 0
      ) {
        const approvedAttachmentString = record.approved_attachment[0]; // Access the first element
        const parsedApprovedAttachment = JSON.parse(approvedAttachmentString); // Parse the string to get the actual array
        console.log("Parsed approved attachment:", parsedApprovedAttachment); // Log parsed attachment

        if (
          Array.isArray(parsedApprovedAttachment) &&
          parsedApprovedAttachment.length > 0
        ) {
          // Access the first element of the array
          const formattedAttachment = parsedApprovedAttachment[0];
          setAttachment(formattedAttachment); // Set the state with the string
          console.log("Formatted approved attachment:", formattedAttachment); // Log the formatted attachment
        } else {
          console.warn(
            "Parsed approved attachment is not an array or is empty:",
            parsedApprovedAttachment
          );
        }
      } else {
        console.warn(
          "Approved attachment is not an array or is empty:",
          record.approved_attachment
        );
      }
    } catch (error) {
      console.error("Error parsing attachment:", error);
    }
  }, [record]); // Dependency on record

  console.log("est", attachment);
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
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Convert FileList to array and set it
      setFile(Array.from(e.target.files));
    }
  };

  const fetchUser = async (id: number) => {
    setisFetchingUser(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token is missing");
      }

      const response = await axios.get(
        `http://122.53.61.91:6002/api/view-user/${id}`,
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
    }
  };

  

  const formatDate2 = (dateString: Date) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };
  console.log(record);

  const handleApprove = async () => {
    const userId = localStorage.getItem("id") ?? "";
    const token = localStorage.getItem("token");

    if (!token) {
      setErrorMessage("Token is missing");
      return;
    }

    const requestData = new FormData();

    // Only append attachments if the file array is not empty
    if (file && file.length > 0) {
      file.forEach((file) => {
        requestData.append("attachment[]", file);
      });
    }

    requestData.append("user_id", parseInt(userId).toString());
    requestData.append("action", "approve");
    requestData.append("comment", comments);

    // Log the contents of requestData for debugging
    for (const [key, value] of requestData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      setApprovedLoading(true);

      const response = await axios.post(
        `http://122.53.61.91:6002/api/request-forms/${record.id}/process`,
        requestData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setApprovedLoading(false);
      setModalStatus("approved");
      setShowSuccessModal(true);
      refreshData();
    } catch (error: any) {
      setApprovedLoading(false);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update stock requisition.";
      console.error("Error approving request form:", errorMessage);
      setCommentMessage(errorMessage);
    }
  };

  const handleDisapprove = async () => {
    const userId = localStorage.getItem("id") ?? "";
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        setErrorMessage("Token is missing");
        return;
      }

  
      const requestData = new FormData();

      // Only append attachments if the file array is not empty
      if (file && file.length > 0) {
        file.forEach((file) => {
          requestData.append("attachment[]", file);
        });
      }
  
      requestData.append("user_id", parseInt(userId).toString());
      requestData.append("action", "disapprove");
      requestData.append("comment", comments);
  
      // Log the contents of requestData for debugging
      for (const [key, value] of requestData.entries()) {
        console.log(`${key}:`, value);
      }
      const response = await axios.post(
        `http://122.53.61.91:6002/api/request-forms/${record.id}/process`,
        requestData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLoading(false);
      setModalStatus("disapproved"); // Set modal status to 'disapproved'
      setShowSuccessModal(true);
      refreshData();
    } catch (error: any) {
      setLoading(false);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to update stock requisition.";
      console.error("Error disapproving request form:", errorMessage);
      setCommentMessage(errorMessage);
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
    const newWindow = window.open(`/print-stock`, "_blank");

    // Optional: Focus the new window
    if (newWindow) {
      newWindow.focus();
    }
  };

  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50">
      <div className="p-4 relative w-full mx-10 md:mx-0 z-10 md:w-1/2 space-y-auto h-3/4 overflow-scroll bg-white border-black rounded-t-lg shadow-lg">
        <div className=" top-2 flex justify-end cursor-pointer sticky">
          <XMarkIcon
            className="h-8 w-8 text-black  bg-white rounded-full p-1  "
            onClick={closeModal}
          />
        </div>
        {!fetchingApprovers && !isFetchingApprovers && (
          <>
            <button
              className="bg-blue-600 p-1 px-2 rounded-md text-white"
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
        <div className="flex flex-col justify-center items-center">
          <div className="justify-center w-1/2">{logo}</div>
          <h1 className="font-bold text-[18px] uppercase ">
            Stock Requisition Slip
          </h1>
          <div className="flex flex-col justify-center ">
            <p className="underline ">{user?.data?.branch}</p>
            <p className="text-center">Branch</p>
          </div>
        </div>
        <div className="justify-start items-start flex flex-col space-y-4 w-full">
          <div className="flex items-center justify-between w-full">
            <p className="font-medium text-[14px]">
              Request ID: #{record.request_code}
            </p>
            <div className="w-auto flex ">
              <p>Date: </p>
              <p className="font-bold pl-2">{formatDate2(record.created_at)}</p>
            </div>
          </div>
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
                  : "bg-pink"
              } rounded-lg  py-1 w-1/3 font-medium text-[14px] text-center ml-2 text-white`}
            >
              {" "}
              {record.status}
            </p>
          </div>

          <p className="font-medium text-[14px]">Purpose:</p>

          <div className="flex flex-col md:flex-row md:space-x-2">
            <label>
              Repo. Recon
              <input
                type="checkbox"
                checked={checkedPurpose === "Repo. Recon"}
                readOnly
                className="size-4"
              />
            </label>
            <label>
              Repair & Maintenance
              <input
                type="checkbox"
                checked={checkedPurpose === "Repair & Maintenance"}
                readOnly
                className="size-4"
              />
            </label>
            <label>
              Office/Service Used
              <input
                type="checkbox"
                checked={checkedPurpose === "Office/Service Used"}
                readOnly
                className="size-4"
              />
            </label>
          </div>

          <div className="mt-4 w-full overflow-x-auto">
            <div className="w-full border-collapse ">
              <div className="table-container">
                <table className="border w-full space-x-auto ">
                  <thead className="border border-black h-14  bg-[#8EC7F7]">
                    <tr className="border ">
                      <th className={`${inputStyle}`}>QTY</th>
                      <th className={`${inputStyle}`}>DESCRIPTION</th>
                      <th className={`${inputStyle}`}>UNIT COST</th>
                      <th className={`${inputStyle}`}>TOTAL AMOUNT</th>
                      <th className={`${inputStyle}`}>USAGE/REMARKS</th>
                    </tr>
                  </thead>
                  <tbody className={`${tableCellStyle}`}>
                    {record.form_data[0].items.map((item, index) => (
                      <tr key={index}>
                        <td className={tableCellStyle}>{item.quantity}</td>
                        <td className={tableCellStyle}>{item.description}</td>
                        <td className={tableCellStyle}>{item.unitCost}</td>
                        <td className={tableCellStyle}>{item.totalAmount}</td>
                        <td className={tableCellStyle}>{item.remarks}</td>
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
              className="border bg-white border-black rounded-md p-1 mt-2 w-full font-bold "
              value={`₱ ${record.form_data[0].grand_total}`}
              readOnly
            />
          </div>

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
                            />
                          </div>
                        )}
                        {/* Name and Position */}
                        <div className="relative flex flex-col items-center justify-center text-center mt-4">
                          {/* Name */}
                          <p className="relative inline-block uppercase font-medium text-center z-10">
                            <span className="relative z-10">
                              {user.data?.firstName} {user.data?.lastName}
                            </span>
                            <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-black"></span>
                          </p>
                          {/* Position */}
                          <p className="font-bold text-[12px] text-center mt-1">
                            {user.data?.position}
                          </p>
                          {/* Status */}
                          <div className="mt-1 min-h-[1.5rem] flex items-center justify-center">
                            {user.data?.status && (
                              <p
                                className={`font-bold text-[12px] text-center ${
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
                        </div>
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
                              />
                            </div>
                          )}
                          {/* Name and Position */}
                          <div className="relative flex flex-col items-center justify-center text-center mt-4">
                            {/* Name */}
                            <p className="relative inline-block uppercase font-medium text-center z-10">
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
                            <div className="mt-1 min-h-[1.5rem] flex items-center justify-center">
                              {hasDisapprovedInApprovedBy ||
                              hasDisapprovedInNotedBy ? (
                                user.status === "Disapproved" ? (
                                  <p className="font-bold text-[12px] text-center text-red-500">
                                    {user.status}
                                  </p>
                                ) : null
                              ) : (
                                <p
                                  className={`font-bold text-[12px] text-center ${
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
                          </div>
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
                              />
                            </div>
                          )}
                          {/* Name and Position */}
                          <div className="relative flex flex-col items-center justify-center text-center mt-4">
                            {/* Name */}
                            <p className="relative inline-block uppercase font-medium text-center z-10">
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
                            <div className="mt-1 min-h-[1.5rem] flex items-center justify-center">
                              {hasDisapprovedInApprovedBy ||
                              hasDisapprovedInNotedBy ? (
                                user.status === "Disapproved" ? (
                                  <p className="font-bold text-[12px] text-center text-red-500">
                                    {user.status}
                                  </p>
                                ) : null
                              ) : (
                                <p
                                  className={`font-bold text-[12px] text-center ${
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
                          </div>
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
              {attachmentUrl.length > 0 ? (
                attachmentUrl.map((url, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500"
                    >
                      {url.split("/").pop()}
                    </a>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No attachments</p>
              )}
            </div>
          </div>
          <div className="w-full">
            <h2 className="text-lg font-bold mb-2">Comments:</h2>

            {record.status === "Pending" && (
              <div>
                <textarea
                  className="border h-auto bg-white border-black rounded-md p-1 mt-2 w-full"
                  placeholder="Enter your comments here.."
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                />
              </div>
            )}
            {commentMessage && <p className="text-red-500">{commentMessage}</p>}

            {/* Comments Section */}
            <ul className="flex flex-col w-full mb-4 space-y-4">
              {notedBy.filter((user) => user.comment).length > 0 ||
              approvedBy.filter((user) => user.comment).length > 0 ||
              avpstaff.filter((user) => user.comment).length > 0 ? (
                <>
                  {notedBy
                    .filter((user) => user.comment)
                    .map((user, index) => (
                      <div className="flex">
                        <div>
                          <img
                            alt="logo"
                            className="cursor-pointer hidden sm:block"
                            src={Avatar}
                            height={35}
                            width={45}
                          />
                        </div>
                        <div className="flex flex-row w-full" key={index}>
                          <li className="flex flex-col justify-between pl-2">
                            <h3 className="font-bold text-lg">
                              {user.firstName} {user.lastName}
                            </h3>
                            <p>{user.comment}</p>
                          </li>
                        </div>
                      </div>
                    ))}

                  {approvedBy
                    .filter((user) => user.comment)
                    .map((user, index) => (
                      <div className="flex">
                        <div>
                          <img
                            alt="logo"
                            className="cursor-pointer hidden sm:block"
                            src={Avatar}
                            height={35}
                            width={45}
                          />
                        </div>
                        <div className="flex flex-row w-full" key={index}>
                          <li className="flex flex-col justify-between pl-2">
                            <h3 className="font-bold text-lg">
                              {user.firstName} {user.lastName}
                            </h3>
                            <p>{user.comment}</p>
                          </li>
                        </div>
                      </div>
                    ))}
                  {avpstaff
                    .filter((user) => user.comment)
                    .map((user, index) => (
                      <div className="flex">
                        <div>
                          <img
                            alt="logo"
                            className="cursor-pointer hidden sm:block"
                            src={Avatar}
                            height={35}
                            width={45}
                          />
                        </div>
                        <div className="flex flex-row w-full" key={index}>
                          <li className="flex flex-col justify-between pl-2">
                            <h3 className="font-bold text-lg">
                              {user.firstName} {user.lastName} - AVP STAFF
                            </h3>
                            <p>{user.comment}</p>
                          </li>
                        </div>
                      </div>
                    ))}
                </>
              ) : (
                <p className="text-gray-500">No comments yet</p>
              )}
            </ul>
          </div>
          <div className="w-full max-w-md ">
            <p className="font-semibold">Approved Attachment:</p>

            {record.approved_attachment.length === 0 &&
            position === "Vice President" && record.status === "Pending" ? (
              <input
                id="file"
                type="file"
                multiple
                onChange={handleFileChange}
                className="w-full mt-2"
              />
            ) : record.approved_attachment.length > 0 && attachment  ? (
              <div className="mt-2">
                <img
                  src={`http://122.53.61.91:6002/storage/${attachment}`}
                  alt="Approved Attachment"
                  className="max-w-full h-auto rounded"
                />
              </div>
            ) : (
              <p className="text-gray-500">No approved attachment available.</p>
            )}
          </div>

          {record.status === "Pending" && (
            <div className="w-full space-x-2 flex items-center justify-between">
              <button
                className="bg-primary text-white w-1/2 items-center h-10 rounded-xl p-2"
                onClick={handleApprove}
              >
                {approveLoading ? (
                  <BeatLoader color="white" size={10} />
                ) : (
                  "Approve"
                )}
              </button>
              <button
                className="bg-red-600 w-1/2 rounded-xl text-white p-2"
                onClick={handleDisapprove}
              >
                {loading ? (
                  <BeatLoader color="white" size={10} />
                ) : (
                  "Disapprove"
                )}
              </button>
            </div>
          )}
          {showSuccessModal && (
            <ApproveSuccessModal
              closeModal={() => setShowSuccessModal(false)}
              closeParentModal={closeModal}
              status={modalStatus}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ApproversStock;
