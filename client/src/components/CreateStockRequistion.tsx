import React, { useState, useEffect } from "react";
import Select from "react-select/dist/declarations/src/Select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  CalendarIcon,
  MinusCircleIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/solid";
import path from "path";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller, set } from "react-hook-form";
import { custom, z, ZodError } from "zod";
import axios from "axios";
import RequestSuccessModal from "./Modals/RequestSuccessModal";
import ClipLoader from "react-spinners/ClipLoader";
import AddCustomModal from "./AddCustomModal";
import Swal from "sweetalert2";
type CustomApprover = {
  id: number;
  name: string;
  approvers: {
    noted_by: { name: string }[];
    approved_by: { name: string }[];
  };
};
interface Approver {
  id: number;
  firstName: string;
  lastName: string;
  position: string;
}
const schema = z.object({
  purpose: z.string(),
  approver_list_id: z.number(),
  approver: z.string(),
  attachment: z.array(z.instanceof(File)).optional(),
  items: z.array(
    z.object({
      quantity: z.string(),
      description: z.string(),
      unitCost: z.string(),
      totalAmount: z.string(),
      remarks: z.string().optional(),
    })
  ),
});

type FormData = z.infer<typeof schema>;

type Props = {};
const requestType = [
  { title: "Stock Requisition", path: "/request/sr" },
  { title: "Purchase Order Requisition Slip", path: "/request/pors" },
  { title: "Cash Disbursement Requisition Slip", path: "/request/cdrs" },
  { title: "Application For Cash Advance", path: "/request/afca" },
  { title: "Liquidation of Actual Expense", path: "/request/loae" },
  { title: "Request for Refund", path: "/request/rfr" },
  { title: "Discount Request", path: "/request/dr" },
];

const inputStyle =
  "w-full   border-2 border-black rounded-[12px] pl-[10px] bg-white  autofill-input";
const itemDiv = "flex flex-col ";
const buttonStyle = "h-[45px] w-[150px] rounded-[12px] text-white";
const CreateStockRequistion = (props: Props) => {
  const [startDate, setStartDate] = useState(new Date());
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const userId = localStorage.getItem("id");
  const [file, setFile] = useState<File[]>([]);
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [notedBy, setNotedBy] = useState<Approver[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [approvedBy, setApprovedBy] = useState<Approver[]>([]);
  const [filebase64, setFileBase64] = useState<string>("");
  const [customApprovers, setCustomApprovers] = useState<CustomApprover[]>([]);
  const [initialNotedBy, setInitialNotedBy] = useState<Approver[]>([]);
  const [initialApprovedBy, setInitialApprovedBy] = useState<Approver[]>([]);
  const [selectedApproverList, setSelectedApproverList] = useState<
    number | null
  >(null);
  const [selectedApprover, setSelectedApprover] = useState<{ name: string }[]>(
    []
  );
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      // Convert FileList to array and set it
      setFile(Array.from(e.target.files));
    }
  };
  useEffect(() => {
    setInitialNotedBy(notedBy);
    setInitialApprovedBy(approvedBy);
  }, [notedBy, approvedBy]);

  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();
  const navigate = useNavigate();

  const [items, setItems] = useState<
    {
      quantity: string;
      description: string;
      unitCost: string;
      totalAmount: string;
      remarks: string;
    }[]
  >([
    {
      quantity: "1",
      description: "",
      unitCost: "",
      totalAmount: "",
      remarks: "",
    },
  ]);

  /* const fetchCustomApprovers = async () => {
    try {
      const id = localStorage.getItem("id");
      const token = localStorage.getItem("token");
      if (!token || !id) {
        console.error("Token or user ID is missing");
        return;
      }

      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/custom-approvers/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (Array.isArray(response.data.data)) {
        setCustomApprovers(response.data.data);
      } else {
        console.error("Unexpected response format:", response.data);
        setCustomApprovers([]); // Ensure that customApprovers is always an array
      }
    } catch (error) {
      console.error("Error fetching custom approvers:", error);
      setCustomApprovers([]); // Ensure that customApprovers is always an array
    }
  };
 */
  const handleOpenConfirmationModal = () => {
    setShowConfirmationModal(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  // Function to close the confirmation modal
  const handleCloseConfirmationModal = () => {
    setShowConfirmationModal(false);
  };

  // Function to handle form submission with confirmation

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);

      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("id");
      const branch_code = localStorage.getItem("branch_code");

      if (!token || !userId) {
        console.error("Token or userId not found");
        return;
      }
      if (notedBy.length === 0 || approvedBy.length === 0) {
        Swal.fire({
          icon: "error",
          title: "No approver selected",
          text: "Please select an approver. To proceed, click on 'Add Approver' button above and select an approver from list.",
          confirmButtonText: "Close",
          confirmButtonColor: "#007bff",
        });
        // alert("Please select an approver.");
        setLoading(false); // Stop loading state
        return; // Prevent form submission
      }

      if (
        items.some((item) =>
          Object.entries(item)
            .filter(([key, value]) => key !== "remarks")
            .some(([key, value]) => value === "")
        )
      ) {
        console.error("Item fields cannot be empty");
        setLoading(false); // Stop loading state
        return;
      }

      let grandTotal = 0;
      items.forEach((item) => {
        if (item.totalAmount) {
          grandTotal += parseFloat(item.totalAmount);
        }
      });

      const formData = new FormData();

      // Append each file to FormData
      file.forEach((file) => {
        formData.append("attachment[]", file);
      });

      const notedByIds = Array.isArray(notedBy)
        ? notedBy.map((person) => person.id)
        : [];
      const approvedByIds = Array.isArray(approvedBy)
        ? approvedBy.map((person) => person.id)
        : [];
      formData.append("noted_by", JSON.stringify(notedByIds));
      formData.append("approved_by", JSON.stringify(approvedByIds));
      formData.append("user_id", userId);
      formData.append("form_type", "Stock Requisition Slip");
      formData.append(
        "form_data",
        JSON.stringify([
          {
            purpose: data.purpose,
            branch: branch_code,
            grand_total: grandTotal.toFixed(2),
            items: items.map((item) => ({
              quantity: item.quantity,
              description: item.description,
              unitCost: item.unitCost,
              totalAmount: item.totalAmount,
              remarks: item.remarks,
            })),
          },
        ])
      );

      // Display confirmation modal
      setShowConfirmationModal(true);
      setFormData(formData);
    } catch (error) {
      console.error("An error occurred while preparing the request:", error);
    } finally {
      setLoading(false);
    }
  };

  const openAddCustomModal = () => {
    setIsModalOpen(true);
  };
  const closeAddCustomModal = () => {
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

  const handleConfirmSubmit = async () => {
    setShowConfirmationModal(false);
    const token = localStorage.getItem("token");

    if (!notedBy || !approvedBy) {
      Swal.fire({
        icon: "error",
        title: "No approver selected",
        text: "Please select an approver. To proceed, click on 'Add Approver' button above and select an approver from list.",
        confirmButtonText: "Close",
        confirmButtonColor: "#007bff",
      });
      return; // Prevent form submission
    }

    try {
      setLoading(true);
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/create-request`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setShowSuccessModal(true);
      setFormSubmitted(true);
      setLoading(false);
    } catch (error) {
      console.error("An error occurred while submitting the request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubmit = () => {
    // Close the confirmation modal
    setShowConfirmationModal(false);
    // Reset formData state
    setFormData(null);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);

    navigate("/request");
  };

  const handleFormSubmit = () => {
    setFormSubmitted(true);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      Swal.fire({
        title: "Are you sure?",
        text: "This item will be removed!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, remove it!",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          const updatedItems = items.filter((_, i) => i !== index);
          setItems(updatedItems);
        }
      });
    }
  };

  const calculateGrandTotal = () => {
    let grandTotal = 0;
    items.forEach((item) => {
      if (item.totalAmount) {
        grandTotal += parseFloat(item.totalAmount);
      }
    });
    return grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 });
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        quantity: "1",
        description: "",
        unitCost: "",
        totalAmount: "0",
        remarks: "",
      },
    ]);
  };

  const handleInputChange = (
    index: number,
    field: keyof (typeof items)[0],
    value: string
  ) => {
    const updatedItems = [...items];
    updatedItems[index][field] = value;

    // Calculate total amount if both unitCost and quantity are provided
    if (field === "unitCost" || field === "quantity") {
      const unitCost = parseFloat(updatedItems[index].unitCost);
      const quantity = parseFloat(updatedItems[index].quantity);
      if (!isNaN(unitCost) && !isNaN(quantity)) {
        updatedItems[index].totalAmount = (unitCost * quantity).toFixed(2);
      } else {
        updatedItems[index].totalAmount = "";
      }
    }

    setItems(updatedItems);
  };

  const handleTextareaHeight = (index: number, field: string) => {
    const textarea = document.getElementById(
      `${field}-${index}`
    ) as HTMLTextAreaElement;
    if (textarea) {
      textarea.style.height = "auto"; // Reset to auto height first
      textarea.style.height = `${Math.max(textarea.scrollHeight, 100)}px`; // Set to scroll height or minimum 100px
    }
  };
  return (
    <div className="bg-graybg dark:bg-blackbg h-full pt-[15px] px-[30px] pb-[15px]">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75">
          <ClipLoader color="#007bff" />
        </div>
      )}
      <h1 className="text-primary dark:text-primaryD text-[32px] font-bold">
        Create Request
      </h1>

      <select
        className="w-2/5  lg:h-[56px] md:h-10 p-2 bg-gray-200 pl-[30px] border-2 border-black rounded-xl mb-2"
        onChange={(e) => navigate(e.target.value)}
      >
        <option value="" disabled>
          Type of request
        </option>
        {requestType.map((item) => (
          <option key={item.title} value={item.path}>
            {item.title}
          </option>
        ))}
      </select>

      <div className="bg-white w-full  mb-5 rounded-[12px] flex flex-col ">
        <div className="border-b flex justify-between flex-col px-[30px] md:flex-row ">
          <div>
            <h1 className=" text-[24px] text-left py-4 text-primary font-bold flex mr-2">
              <span className="mr-2 underline decoration-2 underline-offset-8">
                Stock
              </span>{" "}
              Requisition
            </h1>
          </div>
          <div className="my-2">
            <button
              onClick={openAddCustomModal}
              className="p-2 text-white rounded bg-primary"
            >
              Add Approver
            </button>
          </div>
        </div>
        <div className="px-[35px] mt-4">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col justify-between sm:flex-row">
              <div className="">
                <p className="font-bold">Purpose:</p>
                <div className="flex flex-col mt-2 space-y-2 ">
                  <div className="inline-flex items-center">
                    <label
                      className="relative flex items-center cursor-pointer"
                      htmlFor="repair_maintenance"
                    >
                      <input
                        type="radio"
                        id="repair_maintenance"
                        value="Repair & Maintenance"
                        className="w-5 h-5 ml-1 transition-all border rounded-full appearance-none cursor-pointer size-10 peer border-slate-300 checked:border-slate-400"
                        {...register("purpose")}
                      />
                      <span
                        className="absolute bg-blue-800 w-3.5 h-3.5 rounded-full opacity-0 ml-0.5 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        style={{ pointerEvents: "none" }} // Prevent span from blocking click events
                      ></span>
                    </label>
                    <label
                      className="ml-2 cursor-pointer"
                      htmlFor="repair_maintenance"
                    >
                      Repair & Maintenance
                    </label>
                  </div>
                  <div className="inline-flex items-center">
                    <label
                      className="relative flex items-center cursor-pointer"
                      htmlFor="repair_maintenance"
                    >
                      <input
                        type="radio"
                        id="repo_recon"
                        value="Repo. Recon"
                        className="w-5 h-5 ml-1 transition-all border rounded-full appearance-none cursor-pointer size-10 peer border-slate-300 checked:border-slate-400"
                        {...register("purpose", { required: true })}
                      />
                      <span
                        className="absolute bg-blue-800 w-3.5 h-3.5 rounded-full opacity-0 ml-0.5 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        style={{ pointerEvents: "none" }} // Prevent span from blocking click events
                      ></span>
                    </label>
                    <label className="ml-2 cursor-pointer" htmlFor="repo_recon">
                      Repo. Recon
                    </label>
                  </div>
                  <div className="inline-flex items-center">
                    <label
                      className="relative flex items-center cursor-pointer"
                      htmlFor="repair_maintenance"
                    >
                      <input
                        type="radio"
                        id="office_service_used"
                        value="Office/Service Used"
                        className="w-5 h-5 ml-1 transition-all border rounded-full appearance-none cursor-pointer size-10 peer border-slate-300 checked:border-slate-400"
                        {...register("purpose", { required: true })}
                      />
                      <span
                        className="absolute bg-blue-800 w-3.5 h-3.5 rounded-full opacity-0 ml-0.5 peer-checked:opacity-100 transition-opacity duration-200 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
                        style={{ pointerEvents: "none" }} // Prevent span from blocking click events
                      ></span>
                    </label>
                    <label
                      className="ml-2 cursor-pointer"
                      htmlFor="office_service_used"
                    >
                      Office/Service Used
                    </label>
                  </div>
                </div>
                {errors.purpose && formSubmitted && (
                  <p className="text-red-500">Purpose is required</p>
                )}
              </div>
            </div>

            {items.map((item, index) => (
              <div key={index} className="flex flex-col mt-5 mb-4">
                <label className="font-semibold">ITEM {index + 1}</label>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-5">
                  <div className={`${itemDiv}`}>
                    <label className="font-semibold">Quantity:</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleInputChange(index, "quantity", e.target.value)
                      }
                      onKeyDown={(e) => {
                        // Prevent non-digit input
                        if (
                          !/[0-9]/.test(e.key) &&
                          e.key !== "Backspace" &&
                          e.key !== "Tab"
                        ) {
                          e.preventDefault();
                        }
                      }}
                      className={`${inputStyle} h-[44px]`}
                    />
                    {validationErrors[`items.${index}.quantity`] &&
                      formSubmitted && (
                        <p className="text-red-500">
                          {validationErrors[`items.${index}.quantity`]}
                        </p>
                      )}
                    {!item.quantity &&
                      formSubmitted &&
                      !validationErrors[`items.${index}.quantity`] && (
                        <p className="text-red-500">Quantity Required</p>
                      )}
                  </div>
                  <div key={index} className={itemDiv}>
                    <label className="font-semibold">Description:</label>
                    <textarea
                      id={`description-${index}`}
                      value={item.description}
                      onChange={(e) =>
                        handleInputChange(index, "description", e.target.value)
                      }
                      className={`${inputStyle}`}
                      style={{ minHeight: "100px", maxHeight: "400px" }} // Minimum height 100px, maximum height 400px (optional)
                      onFocus={() => handleTextareaHeight(index, "description")} // Adjust height on focus
                      onBlur={() => handleTextareaHeight(index, "description")} // Adjust height on blur
                      onInput={() => handleTextareaHeight(index, "description")} // Adjust height on input change
                    />
                    {validationErrors?.[`items.${index}.description`] &&
                      formSubmitted && (
                        <p className="text-red-500">
                          {validationErrors[`items.${index}.description`]}
                        </p>
                      )}
                    {!item.description &&
                      formSubmitted &&
                      !validationErrors?.[`items.${index}.description`] && (
                        <p className="text-red-500">Description Required</p>
                      )}
                  </div>
                  <div className={`${itemDiv}`}>
                    <label className="font-semibold">Unit Cost:</label>
                    <input
                      type="number"
                      value={item.unitCost}
                      onChange={(e) =>
                        handleInputChange(index, "unitCost", e.target.value)
                      }
                      onKeyDown={(e) => {
                        // Prevent non-digit input
                        if (
                          !/[0-9]/.test(e.key) &&
                          e.key !== "Backspace" &&
                          e.key !== "Tab"
                        ) {
                          e.preventDefault();
                        }
                      }}
                      placeholder="₱"
                      className={`${inputStyle} h-[44px]`}
                    />
                    {validationErrors[`items.${index}.unitCost`] &&
                      formSubmitted && (
                        <p className="text-red-500">
                          {validationErrors[`items.${index}.unitCost`]}
                        </p>
                      )}
                    {!item.unitCost &&
                      formSubmitted &&
                      !validationErrors[`items.${index}.unitCost`] && (
                        <p className="text-red-500">Unit Cost Required</p>
                      )}
                  </div>
                  <div className={`${itemDiv} `}>
                    <label className="font-semibold">Total Amount:</label>
                    <input
                      type="number"
                      value={item.totalAmount}
                      onChange={(e) =>
                        handleInputChange(index, "totalAmount", e.target.value)
                      }
                      placeholder="₱"
                      className={`${inputStyle} h-[44px]`}
                      readOnly
                    />
                    {validationErrors[`items.${index}.totalAmount`] &&
                      formSubmitted && (
                        <p className="text-red-500">
                          {validationErrors[`items.${index}.totalAmount`]}
                        </p>
                      )}
                    {!item.totalAmount &&
                      formSubmitted &&
                      !validationErrors[`items.${index}.totalAmount`] && (
                        <p className="text-red-500">Total Amount Required</p>
                      )}
                  </div>
                  <div className={`${itemDiv}`}>
                    <label className="font-semibold">Usage/Remarks</label>
                    <textarea
                      id={`remarks-${index}`}
                      value={item.remarks}
                      onChange={(e) =>
                        handleInputChange(index, "remarks", e.target.value)
                      }
                      className={`${inputStyle}`}
                      style={{ minHeight: "100px", maxHeight: "400px" }} // Minimum height 100px, maximum height 400px (optional)
                      onFocus={() => handleTextareaHeight(index, "remarks")} // Adjust height on focus
                      onBlur={() => handleTextareaHeight(index, "remarks")} // Adjust height on blur
                      onInput={() => handleTextareaHeight(index, "remarks")} // Adjust height on input change
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      {items.length > 1 && (
                        <span
                          className={`${buttonStyle} bg-pink flex items-center justify-center cursor-pointer hover:bg-white hover:border-4 hover:border-pink hover:text-pink`}
                          onClick={() => handleRemoveItem(index)}
                        >
                          <MinusCircleIcon
                            className="w-5 h-5 mr-2"
                            aria-hidden="true"
                          />
                          Remove Item
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="flex flex-col items-center justify-center w-full mt-4">
              <hr className="w-full my-2 border-t-4 border-gray-400 border-dotted" />
              <span
                className={`bg-yellow flex items-center cursor-pointer hover:bg-white hover:border-4 hover:border-yellow hover:text-yellow text-gray-950 mt-2 max-w-md justify-center ${buttonStyle}`}
                onClick={handleAddItem}
              >
                <PlusCircleIcon className="w-5 h-5 mr-2" aria-hidden="true" />
                Add Item
              </span>
            </div>
            {errorMessage && <p className="text-red-600">{errorMessage}</p>}
            <div className="flex flex-col justify-between md:flex-row">
              <div className="w-full max-w-md p-4">
                <p className="font-semibold">Attachments:</p>
                <input
                  id="file"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full mt-2"
                />
              </div>

              <div className="mt-4">
                <p className="font-semibold">
                  Grand Total: ₱{calculateGrandTotal()}
                </p>
              </div>
            </div>
            <div className="mt-10 mb-4 ml-5">
              <h3 className="mb-3 font-bold">Noted By:</h3>
              <ul className="flex flex-wrap gap-6">
                {" "}
                {/* Use gap instead of space-x */}
                {notedBy.map((user, index) => (
                  <li
                    className="relative flex flex-col items-center justify-center w-auto text-center"
                    key={index}
                  >
                    {" "}
                    {/* Adjust width as needed */}
                    <div className="relative flex flex-col items-center justify-center">
                      <p className="relative inline-block pt-6 font-medium text-center uppercase">
                        <span className="relative z-10 px-2">
                          {user.firstName} {user.lastName}
                        </span>
                        <span className="absolute left-0 right-0 bottom-0 h-0.5 bg-black"></span>
                      </p>
                      <p className="font-bold text-[12px] text-center">
                        {user.position}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
            <div className="mb-4 ml-5">
              <h3 className="mb-3 font-bold">Approved By:</h3>
              {approvedBy.length === 0 ? (
                <p className="text-gray-500 ">
                  Please select an approver!
                  <br />
                  <span className="text-sm italic">
                    Note: You can add approvers by clicking the 'Add Approver'
                    button above.
                  </span>
                </p>
              ) : (
                <ul className="flex flex-wrap gap-6">
                  {approvedBy.map((user, index) => (
                    <li
                      className="relative flex flex-col items-center justify-center text-center"
                      key={index}
                    >
                      <div className="relative flex flex-col items-center justify-center">
                        <p className="relative inline-block pt-6 font-medium text-center uppercase">
                          <span className="relative z-10 px-2">
                            {user.firstName} {user.lastName}
                          </span>
                          <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black"></span>
                        </p>
                        <p className="font-bold text-[12px] text-center">
                          {user.position}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex justify-center pb-10 mt-20 space-x-3">
              <button
                className={`bg-[#0275d8] hover:bg-[#6fbcff] ${buttonStyle}`}
                type="submit"
                onClick={handleFormSubmit}
                disabled={loading}
              >
                <span className="text-white hover:text-black">
                  {loading ? "PLEASE WAIT..." : "CREATE REQUEST"}
                </span>
              </button>
            </div>
            {showConfirmationModal && (
              <div className="fixed top-0 left-0 z-50 flex items-center justify-center w-full h-full bg-black bg-opacity-50">
                <div className="p-4 bg-white rounded-md">
                  <p>Are you sure you want to submit the request?</p>
                  <div className="flex justify-end mt-4">
                    <button
                      className="px-4 py-2 mr-2 font-bold text-gray-800 bg-gray-300 rounded hover:bg-gray-400"
                      onClick={handleCloseConfirmationModal}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 font-bold text-white rounded bg-primary hover:bg-primary-dark"
                      onClick={handleConfirmSubmit}
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>

      {showSuccessModal && (
        <RequestSuccessModal onClose={handleCloseSuccessModal} />
      )}
      <AddCustomModal
        modalIsOpen={isModalOpen}
        closeModal={closeModal}
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

export default CreateStockRequistion;
