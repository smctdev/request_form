import React, { useState, useEffect } from "react";
import Select from "react-select/dist/declarations/src/Select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarIcon, MinusCircleIcon, PlusCircleIcon } from "@heroicons/react/24/solid";
import TextareaAutosize from "react-textarea-autosize";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z, ZodError } from "zod";
import axios from "axios";
import RequestSuccessModal from "./Modals/RequestSuccessModal";
import ClipLoader from "react-spinners/ClipLoader";
import AddCustomModal from "./AddCustomModal";
import { table } from "console";
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
const schema = z.object({
  department: z.string(),
  cashAmount: z.string(),
  liquidationDate: z.string(),
  remarks: z.string(),
  totalBoatFare: z.string(),
  totalHotel: z.string(),
  totalPerDiem: z.string(),
  totalFare: z.string(),
  totalContingency: z.string(),
  totalAmount: z.string(),
  approver_list_id: z.number(),
  approver: z.string(),
  items: z.array(
    z.object({
      cashDate: z.string().nonempty("Cash date is required"),
      day: z.string().nonempty("Day is required"),
      itinerary: z.string().nonempty("Itinerary is required"),
      from: z.string().nonempty("From  is required"),
      to: z.string().nonempty("To is required"),
      hotel: z.string().optional(),
      rate: z.string().optional(),
      amount: z.string().optional(),
      perDiem: z.string().optional(),
      remarks: z.string().optional(),
    })
  ),
});

const brancheList = [
  "Branch A",
  "Branch B",
  "Branch C",
  "Branch D",
  "Branch E",
];
type FormData = z.infer<typeof schema>;
type TableDataItem = {
  cashDate: string;
  day: string;
  from: string;
  to: string;
  activity: string;
  hotel: string;
  rate: string;
  amount: string;
  perDiem: string;
  remarks: string;
};

const initialTableData: TableDataItem[] = Array.from({ length: 1 }, () => ({
  cashDate: "",
  day: "",
  from: "",
  to: "",
  activity: "",
  hotel: "",
  rate: "",
  amount: "",
  perDiem: "",
  remarks: "",
}));

const tableStyle = "border border-black p-2";
const inputStyle =
  "w-full  border-2 rounded-[12px] pl-[10px] bg-white  autofill-input focus:outline-0";
const inputStyle2 =
  "w-full   rounded-[12px] pl-[10px] bg-white  autofill-input focus:outline-0";
const tableInput =
  "w-full h-full bg-white px-2 py-1 bg-white  autofill-input focus:outline-0";
const itemDiv = "flex flex-col ";
const buttonStyle = "h-[45px] w-[150px] rounded-[12px] text-white";
const CreateApplicationCash = (props: Props) => {
  const [totalBoatFare, setTotalBoatFare] = useState(0);
  const [totalHotel, setTotalHotel] = useState(0);
  const [formData, setFormData] = useState<any>(null);
  const [totalFare, setTotalFare] = useState(0);
  const [totalContingency, setTotalContingency] = useState(0);
  const [startDate, setStartDate] = useState(new Date());
  const navigate = useNavigate();
  const [file, setFile] = useState<File[]>([]);
  const [customApprovers, setCustomApprovers] = useState<CustomApprover[]>([]);
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [notedBy, setNotedBy] = useState<Approver[]>([]);
  const [approvedBy, setApprovedBy] = useState<Approver[]>([]);
  const [initialNotedBy, setInitialNotedBy] = useState<Approver[]>([]);
  const [initialApprovedBy, setInitialApprovedBy] = useState<Approver[]>([]);
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    formState: { errors: formErrors },
  } = useForm<FormData>();
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const [items, setItems] = useState<
    {
      cashDate: string;
      day: string;
      from: string;
      to: string;
      activity: string;
      hotel: string;
      rate: string;
      amount: string;
      perDiem: string;
      remarks: string;
    }[]
  >([
    {
      cashDate: "",
      day: "",
      from: "",
      to: "",
      activity: "",
      hotel: "",
      rate: "",
      amount: "",
      perDiem: "",
      remarks: "",
    },
  ]);

  useEffect(() => {
    setInitialNotedBy(notedBy);
    setInitialApprovedBy(approvedBy);
  }, [notedBy, approvedBy]);
  /*  const fetchCustomApprovers = async () => {
    try {
      const id = localStorage.getItem("id");
      const token = localStorage.getItem("token");
      if (!token || !id) {
        console.error("Token or user ID is missing");
        return;
      }

      const response = await axios.get(
        `http://122.53.61.91:6002/api/custom-approvers/${id}`,
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
  }; */

  const handleOpenConfirmationModal = () => {
    setShowConfirmationModal(true);
  };

  // Function to close the confirmation modal
  const handleCloseConfirmationModal = () => {
    setShowConfirmationModal(false);
  };

  const totalPerDiem = items.reduce(
    (total, item) => total + parseFloat(String(item.perDiem) || "0"),
    0
  );

  const calculateTotal = () => {
    const total =
      totalBoatFare + totalHotel + totalPerDiem + totalFare + totalContingency;
    return total.toFixed(2);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>();

  const inputStyle =
    "w-full max-w-[300px] border-2 border-black rounded-[12px] pl-[10px] bg-white";
  const [tableData, setTableData] = useState<TableDataItem[]>(initialTableData);
  const [selectedRequestType, setSelectedRequestType] =
    useState("/request/afca");

  const handleChange = (
    index: number,
    field: keyof TableDataItem,
    value: string
  ) => {
    const newData = [...tableData];
    newData[index][field] = value;

    // Check if the value is empty for 'from' and 'to' fields
    if (field === "from" || field === "to") {
      if (!value.trim()) {
        setValidationErrors((prevErrors) => ({
          ...prevErrors,
          [`items.${index}.${field}`]: "This field is required",
        }));
      } else {
        setValidationErrors((prevErrors) => {
          const newErrors = { ...prevErrors };
          delete newErrors[`items.${index}.${field}`];
          return newErrors;
        });
      }
    }

    setItems(newData);
  };

  const handleAddRow = () => {
    setTableData([
      ...tableData,
      {
        cashDate: "",
        day: "",
        from: "",
        to: "",
        activity: "",
        hotel: "",
        rate: "",
        amount: "",
        perDiem: "",
        remarks: "",
      },
    ]);
  };

  const handleRemoveItem = () => {
    if (tableData.length > 1) {
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
          const updatedItems = [...tableData];
          updatedItems.pop();
          setTableData(updatedItems);
        }
      });
    }
  };

  const handleAddItem = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevent form submission

    setTableData([
      ...tableData,
      {
        cashDate: "",
        day: "",
        from: "",
        to: "",
        activity: "",
        hotel: "",
        rate: "",
        amount: "",
        perDiem: "",
        remarks: "",
      },
    ]);
  };

  const calculateTotalPerDiem = (items: TableDataItem[]) => {
    const totalPerDiem = items.reduce(
      (total, item) => total + parseFloat(item.perDiem || "0"),
      0
    );
    return totalPerDiem.toFixed(2);
  };

  const onSubmit = async (data: FormData) => {
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
        })
        setLoading(false); // Stop loading state
        return; // Prevent form submission
      }

      // Calculate total per diem
      const totalPerDiem = items.reduce(
        (total, item) => total + parseFloat(item.perDiem || "0"),
        0
      );

      // Calculate total amount
      const total =
        parseFloat(data.totalBoatFare || "0") +
        parseFloat(data.totalHotel || "0") +
        parseFloat(data.totalPerDiem || "0") +
        parseFloat(data.totalFare || "0") +
        parseFloat(data.totalContingency || "0");

      // Calculate grand total
      const grand_total = (total + totalPerDiem).toFixed(2);

      // Validate if any item fields are empty
      const emptyItems: number[] = [];
      items.forEach((item, index) => {
        if (!item.cashDate || !item.from || !item.to) {
          emptyItems.push(index);
        }
      });

      if (emptyItems.length > 0) {
        emptyItems.forEach((index) => {});

        return;
      }

      const formData = new FormData();

      file.forEach((file) => {
        formData.append("attachment[]", file); // Use "attachment[]" to handle multiple files
      });
      const notedByIds = Array.isArray(notedBy)
        ? notedBy.map((person) => person.id)
        : [];
      const approvedByIds = Array.isArray(approvedBy)
        ? approvedBy.map((person) => person.id)
        : [];
      formData.append("noted_by", JSON.stringify(notedByIds));
      formData.append("approved_by", JSON.stringify(approvedByIds));
      formData.append("form_type", "Application For Cash Advance");
      formData.append("user_id", userId);

      formData.append(
        "form_data",
        JSON.stringify([
          {
            branch: branch_code,
            grand_total: grand_total,
            department: data.department,
            remarks: data.remarks,
            liquidationDate: data.liquidationDate,
            totalBoatFare: data.totalBoatFare,
            totalHotel: data.totalHotel,
            totalperDiem: totalPerDiem,
            totalFare: data.totalFare,
            totalContingency: data.totalContingency,
            items: items.map((item) => ({
              cashDate: item.cashDate,
              day: item.day,
              from: item.from,
              to: item.to,
              activity: item.activity,
              hotel: item.hotel,
              rate: item.rate,
              amount: item.amount,
              perDiem: item.perDiem,
              remarks: item.remarks,
            })),
          },
        ])
      );

      logFormData(formData);

      // Display confirmation modal
      setShowConfirmationModal(true);

      // Set form data to be submitted after confirmation
      setFormData(formData);
    } catch (error) {
      console.error("An error occurred while submitting the request:", error);
    } finally {
      setLoading(false);
    }
  };
  const closeModal = () => {
    setIsModalOpen(false);
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
    // Close the confirmation modal
    setShowConfirmationModal(false);
    const token = localStorage.getItem("token");

    if (!notedBy && !approvedBy) {
      Swal.fire({
        icon: "error",
        title: "No approver selected",
        text: "Please select an approver. To proceed, click on 'Add Approver' button above and select an approver from list.",
        confirmButtonText: "Close",
        confirmButtonColor: "#007bff",
      })
      return; // Prevent form submission
    }

    try {
      setLoading(true);
      logFormData(formData);

      // Perform the actual form submission
      const response = await axios.post(
        "http://122.53.61.91:6002/api/create-request",
        formData, // Use the formData stored in state
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

  const logFormData = (formData: any) => {
    for (let [key, value] of formData.entries()) {
    }
  };

  const handleBoatFareChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTotalBoatFare(parseFloat(e.target.value) || 0);
  };

  // Function to handle change in totalHotel input
  const handleHotelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTotalHotel(parseFloat(e.target.value) || 0);
  };

  // Function to handle change in totalFare input
  const handleFareChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTotalFare(parseFloat(e.target.value) || 0);
  };

  // Function to handle change in totalContingency input
  const handleContingencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTotalContingency(parseFloat(e.target.value) || 0);
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
    <div className="bg-graybg dark:bg-blackbg w-full h-full pt-[15px] inline-flex flex-col px-[30px] pb-[15px]">
     {loading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-75 z-50">
          <ClipLoader color="#007bff" />
        </div>
      )}
      <h1 className="text-primary text-[32px] font-bold inline-block">
        Create Request
      </h1>
      <select
        className="w-2/5 lg:h-[56px] md:h-10 p-2 bg-gray-200 pl-[30px] border-2 border-black rounded-xl mb-2"
        value={selectedRequestType}
        onChange={(e) => {
          setSelectedRequestType(e.target.value);
          navigate(e.target.value);
        }}
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
      <div className="bg-white w-full   mb-5 rounded-[12px] flex flex-col">
        <div className="border-b flex justify-between flex-col px-[30px] md:flex-row ">
          <div>
            <h1 className=" text-[24px] text-left py-4 text-primary font-bold flex mr-2">
              <span className="mr-2 underline decoration-2 underline-offset-8">
                Application
              </span>{" "}
              For Cash Advance
            </h1>
          </div>
          <div className="my-2  ">
            <button
              onClick={openAddCustomModal}
              className="bg-primary text-white p-2 rounded"
            >
              Add Approver
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="px-[35px] mt-4 ">
            <div className="grid xl:grid-cols-4 md:grid-cols-2 gap-8 justify-between ">
              <div className={`${itemDiv}`}>
                <p className="font-semibold">Department</p>
                <input
                  type="text"
                  {...register("department", { required: true })}
                  className={`${inputStyle} h-[44px]`}
                />
                {errors.department && formSubmitted && (
                  <p className="text-red-500">Department is required</p>
                )}
              </div>

              <div className={`${itemDiv}`}>
                <p>Usage/Remarks</p>
                <textarea
                  {...register("remarks")}
                  className={`${inputStyle} h-[100px]`}
                />
              </div>
              <div className={`${itemDiv}`}>
                <p className="font-semibold">Liquidation Date</p>
                <input
                  type="date"
                  {...register("liquidationDate", { required: true })}
                  className={`${inputStyle} h-[44px]`}
                />
                {errors.liquidationDate && formSubmitted && (
                  <p className="text-red-500">Liquidation Date is required</p>
                )}
              </div>
            </div>

            <div className="mt-4 w-full overflow-x-auto md:overflow-auto">
              <div className="w-full border-collapse border border-black">
                <div className="table-container">
                  <table className="border-collapse w-full border border-black ">
                    <thead className="bg-[#8EC7F7]">
                      <tr>
                        <th className={`${tableStyle}`}>Date</th>
                        <th className={`${tableStyle}`}>Day</th>
                        <th className={`${tableStyle}`}>From</th>
                        <th className={`${tableStyle}`}>To</th>
                        <th className={`${tableStyle}`}>Activity</th>
                        <th className={`${tableStyle}`}>Hotel</th>
                        <th className={`${tableStyle}`}>Rate</th>
                        <th className={`${tableStyle}`}>Amount</th>
                        <th className={`${tableStyle}`}>Per Diem</th>
                        <th className={`${tableStyle}`}>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.map((item, index) => (
                        <tr key={index} className="border border-black">
                          <td className="p-1 border border-black ">
                            <input
                              type="date"
                              value={item.cashDate}
                              onChange={(e) => {
                                const value = e.target.value;
                                const day = [
                                  "Sunday",
                                  "Monday",
                                  "Tuesday",
                                  "Wednesday",
                                  "Thursday",
                                  "Friday",
                                  "Saturday",
                                ][new Date(value).getDay()];
                                handleChange(index, "cashDate", value);
                                handleChange(index, "day", day);
                              }}
                              className={`${tableInput} bg-[#F9f9f9]`}
                            />
                            {validationErrors[`items.${index}.date`] &&
                              formSubmitted && (
                                <p className="text-red-500">
                                  {validationErrors[`items.${index}.date`]}
                                </p>
                              )}
                            {!item.cashDate &&
                              formSubmitted &&
                              !validationErrors[`item.${index}.date`] && (
                                <p className="text-red-500">Date Required</p>
                              )}
                          </td>
                          <td className="p-1 border border-black">
                            <input
                              type="text"
                              value={item.day}
                              readOnly
                              className={`cursor-not-allowed ${tableInput}`}
                            />
                          </td>
                          <td className="p-1 border border-black ">
                            <input
                              type="text"
                              value={item.from}
                              onChange={(e) =>
                                handleChange(index, "from", e.target.value)
                              }
                              className={`${inputStyle2}`}
                              style={{ minHeight: "50px", maxHeight: "400px" }}
                              onFocus={() =>
                                handleTextareaHeight(index, "from")
                              }
                              onBlur={() =>
                                handleTextareaHeight(index, "from")
                              }
                              onInput={() =>
                                handleTextareaHeight(index, "from")
                              }
                            />
                            {validationErrors[`items.${index}.from`] &&
                              formSubmitted && (
                                <p className="text-red-500">
                                  {validationErrors[`items.${index}.from`]}
                                </p>
                              )}
                            {!item.from &&
                              formSubmitted &&
                              !validationErrors[`items.${index}.from`] && (
                                <p className="text-red-500">From Required</p>
                              )}
                          </td>

                          <td className="p-1 border border-black ">
                            <input
                              type="text"
                              value={item.to}
                              onChange={(e) =>
                                handleChange(index, "to", e.target.value)
                              }
                              className={`${inputStyle2}`}
                              style={{ minHeight: "50px", maxHeight: "400px" }}
                              onFocus={() =>
                                handleTextareaHeight(index, "to")
                              }
                              onBlur={() =>
                                handleTextareaHeight(index, "to")
                              }
                              onInput={() =>
                                handleTextareaHeight(index, "to")
                              }
                            />
                            {validationErrors[`items.${index}.to`] &&
                              formSubmitted && (
                                <p className="text-red-500">
                                  {validationErrors[`items.${index}.to`]}
                                </p>
                              )}
                            {!item.to &&
                              formSubmitted &&
                              !validationErrors[`items.${index}.to`] && (
                                <p className="text-red-500">To Required</p>
                              )}
                          </td>
                          <td className="p-1 border border-black ">
                            <textarea
                              id={`activity-${index}`}
                              value={item.activity}
                              onChange={(e) =>
                                handleChange(index, "activity", e.target.value)
                              }
                              className={`${inputStyle2}`}
                              style={{ minHeight: "50px", maxHeight: "400px" }}
                              onFocus={() =>
                                handleTextareaHeight(index, "activity")
                              }
                              onBlur={() =>
                                handleTextareaHeight(index, "activity")
                              }
                              onInput={() =>
                                handleTextareaHeight(index, "activity")
                              }
                            />
                          </td>
                          <td className="p-1 border border-black">
                            <textarea
                              value={item.hotel}
                              onChange={(e) =>
                                handleChange(index, "hotel", e.target.value)
                              }
                              className={`${tableInput}`}
                              style={{ minHeight: "50px", maxHeight: "400px" }}
                              onFocus={() =>
                                handleTextareaHeight(index, "hotel")
                              }
                              onBlur={() =>
                                handleTextareaHeight(index, "hotel")
                              }
                              onInput={() =>
                                handleTextareaHeight(index, "hotel")
                              }
                            />
                          </td>
                          <td className="p-1 border border-black">
                            <input
                              type="number"
                              value={item.rate}
                              onChange={(e) =>
                                handleChange(index, "rate", e.target.value)
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
                              className={`${tableInput}`}
                            />
                          </td>
                          <td className="p-1 border border-black">
                            <input
                              type="number"
                              value={item.amount}
                              onChange={(e) =>
                                handleChange(index, "amount", e.target.value)
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
                              className={`${tableInput}`}
                            />
                          </td>
                          <td className="p-1 border border-black">
                            <input
                              type="number"
                              value={item.perDiem}
                              onChange={(e) =>
                                handleChange(index, "perDiem", e.target.value)
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
                              className={`${tableInput}`}
                            />
                          </td>
                          <td className="p-1 border border-black">
                            <textarea
                              id={`remarks-${index}`}
                              value={item.remarks}
                              onChange={(e) =>
                                handleChange(index, "remarks", e.target.value)
                              }
                              className={`${inputStyle2} `}
                              style={{ minHeight: "50px", maxHeight: "400px" }}
                              onFocus={() =>
                                handleTextareaHeight(index, "remarks")
                              }
                              onBlur={() =>
                                handleTextareaHeight(index, "remarks")
                              }
                              onInput={() =>
                                handleTextareaHeight(index, "remarks")
                              }
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center mt-4">
              <hr className="w-full border-t-4 border-dotted border-gray-400 my-2" />

              <div className="flex flex-row items-center gap-2 mt-2">
                {tableData.length > 1 && (
                  <span
                    className={`${buttonStyle} bg-pink flex items-center justify-center cursor-pointer hover:bg-white hover:border-4 hover:border-pink hover:text-pink`}
                    onClick={handleRemoveItem}
                  >
                    <MinusCircleIcon
                      className="h-5 w-5 mr-2"
                      aria-hidden="true"
                    />
                    Remove Item
                  </span>
                )}
                <span
                  className={`bg-yellow flex items-center cursor-pointer hover:bg-white hover:border-4 hover:border-yellow hover:text-yellow text-gray-950 max-w-md justify-center ${buttonStyle}`}
                  onClick={handleAddItem}
                >
                  <PlusCircleIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                  Add Item
                </span>
              </div>
            </div>
            <div className="flex justify-between overflow-x-auto ">
              <div>
                <table className="border border-black  mt-10">
                  <tr>
                    <th colSpan={2} className="bg-[#8EC7F7] ">
                      <p className="font-semibold text-[12px] p-2">
                        SUMMARY OF EXPENSES TO BE INCURRED (for C/A)
                      </p>
                    </th>
                  </tr>
                  <tr>
                    <td className={`${tableStyle}`}>
                      <p className="font-semibold  ">BOAT FARE</p>
                    </td>
                    <td className={`${tableStyle}`}>
                      <input
                        type="number"
                        {...register("totalBoatFare", { required: true })}
                        className="bg-white font-bold text-center"
                        value={totalBoatFare.toFixed(2)}
                        onChange={handleBoatFareChange}
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className={`${tableStyle}`}>
                      <p className="font-semibold">HOTEL</p>
                    </td>
                    <td className={`${tableStyle}`}>
                      <input
                        type="number"
                        {...register("totalHotel", { required: true })}
                        className="bg-white font-bold text-center"
                        value={totalHotel.toFixed(2)}
                        onChange={handleHotelChange}
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className={`${tableStyle}`}>
                      <p className="font-semibold">PER DIEM</p>
                    </td>
                    <td className={`${tableStyle} text-center`}>
                      <input className="font-bold text-center"  value={`${totalPerDiem.toFixed(2)}\u00A0\u00A0\u00A0\u00A0`}  disabled/> 
                      {/* <p className="font-bold">{totalPerDiem.toFixed(2)}</p> */}
                    </td>
                  </tr>

                  <tr>
                    <td className={`${tableStyle}`}>
                      <p className="font-semibold  ">FARE</p>
                    </td>
                    <td className={`${tableStyle}`}>
                      <input
                        type="number"
                        {...register("totalFare", { required: true })}
                        className="bg-white font-bold text-center"
                        value={totalFare.toFixed(2)}
                        onChange={handleFareChange}
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className={`${tableStyle}`}>
                      <p className="font-semibold  ">CONTINGENCY</p>
                    </td>
                    <td className={`${tableStyle}`}>
                      <input
                        type="number"
                        {...register("totalContingency", { required: true })}
                        className="bg-white font-bold text-center"
                        value={totalContingency.toFixed(2)}
                        onChange={handleContingencyChange}
                        inputMode="numeric"
                        pattern="[0-9]*"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className={`${tableStyle} h-8`}></td>
                    <td className={`${tableStyle}`}></td>
                  </tr>
                  <tr>
                    <td className={`${tableStyle} h-14 font-bold`}>TOTAL</td>
                    <td className={`${tableStyle} text-center `}>
                      <p className="bg-white font-bold ">
                        {" "}
                        ₱{calculateTotal()}{" "}
                      </p>
                    </td>
                  </tr>
                </table>
              </div>
            </div>
            <div className="flex justify-between flex-col md:flex-row">
              <div className="w-full max-w-md  p-4">
                <p className="font-semibold">Attachments:</p>
                <input
                  id="file"
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full mt-2"
                />
              </div>
            </div>
            <div className="mb-4 ml-5 mt-10">
              <h3 className="font-bold mb-3">Noted By:</h3>
              <ul className="flex flex-wrap gap-6">
                {" "}
                {/* Use gap instead of space-x */}
                {notedBy.map((user, index) => (
                  <li
                    className="flex flex-col items-center justify-center text-center relative w-auto"
                    key={index}
                  >
                    {" "}
                    {/* Adjust width as needed */}
                    <div className="relative flex flex-col items-center justify-center">
                      <p className="relative inline-block uppercase font-medium text-center pt-6">
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
              <h3 className="font-bold mb-3">Approved By:</h3>
              {approvedBy.length === 0 ? (
                <p className=" text-gray-500">
                  Please select an approver!
                  <br/> 
                  <span className="italic text-sm">Note: You can add approvers by clicking the 'Add Approver' button above.</span>
                </p>
              ) : (
              <ul className="flex flex-wrap gap-6">
                {" "}
                {/* Use gap instead of space-x */}
                {approvedBy.map((user, index) => (
                  <li
                    className="flex flex-col items-center justify-center text-center relative"
                    key={index}
                  >
                    <div className="relative flex flex-col items-center justify-center">
                      <p className="relative inline-block uppercase font-medium text-center pt-6">
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
            <div className="space-x-3 flex justify-end mt-20 pb-10">
              {/* <button
                type="button"
                className={`bg-yellow ${buttonStyle}`}
                onClick={handleAddItem}
              >
                Add
              </button>
              {tableData.length >= 1 && (
                <button
                  type="button"
                  className={`${buttonStyle} bg-pink`}
                  onClick={handleRemoveItem}
                >
                  Remove Item
                </button>
              )} */}

              <button
                className={`bg-primary ${buttonStyle}`}
                type="submit"
                onClick={handleFormSubmit}
                disabled={loading}
              >
                {loading ? "Please Wait..." : "Send Request"}
              </button>
            </div>
          </div>
          {showConfirmationModal && (
            <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-white p-4 rounded-md">
                <p>Are you sure you want to submit the request?</p>
                <div className="flex justify-end mt-4">
                  <button
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                    onClick={handleCloseConfirmationModal}
                  >
                    Cancel
                  </button>
                  <button
                    className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded"
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

export default CreateApplicationCash;
