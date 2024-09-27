import React, { useState, useEffect } from "react";
import Select from "react-select/dist/declarations/src/Select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarIcon } from "@heroicons/react/24/solid";
import { useNavigate } from "react-router-dom";
import { set, useForm } from "react-hook-form";
import { z, ZodError } from "zod";
import axios from "axios";
import RequestSuccessModal from "./Modals/RequestSuccessModal";
import ClipLoader from "react-spinners/ClipLoader";
import AddCustomModal from "./AddCustomModal";
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
  approver_list_id: z.number(),
  approver: z.string(),
  supplier: z.string(),
  address: z.string(),
  items: z.array(
    z.object({
      quantity: z.string(),
      description: z.string(),
      unitCost: z.string(),
      remarks: z.string().optional(),
    })
  ),
});

type FormData = z.infer<typeof schema>;

const inputStyle = "w-full   border-2 border-black rounded-[12px] bg-white  autofill-input";
const itemDiv = "flex flex-col  ";
const buttonStyle = "h-[45px] w-[150px] rounded-[12px] text-white";

const CreatePurchaseOrder = (props: Props) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState<any>(null);
  const [customApprovers, setCustomApprovers] = useState<CustomApprover[]>([]);
  const [selectedApproverList, setSelectedApproverList] = useState<
    number | null
  >(null);
  const [selectedApprover, setSelectedApprover] = useState<{ name: string }[]>(
    []
  );
  const [file, setFile] = useState<File[]>([]);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const [notedBy, setNotedBy] = useState<Approver[]>([]);
  const [approvedBy, setApprovedBy] = useState<Approver[]>([]);
  const [initialNotedBy, setInitialNotedBy] =useState<Approver[]>([]);
  const [initialApprovedBy, setInitialApprovedBy] =useState<Approver[]>([]);
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const {
    formState: { errors: formErrors },
  } = useForm<FormData>();
  const [selectedRequestType, setSelectedRequestType] =
    useState("/request/pors");
    
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
      quantity: "",
      description: "",
      unitCost: "",
      totalAmount: "",
      remarks: "",
    },
  ]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

 /*  useEffect(() => {
    fetchCustomApprovers();
  }, []);

  const fetchCustomApprovers = async () => {
    try {
        const id = localStorage.getItem("id");
        const token = localStorage.getItem("token");
        if (!token || !id) {
            console.error("Token or user ID is missing");
            return;
        }

        const response = await axios.get(`http://122.53.61.91:6002/api/custom-approvers/${id}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

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
const onSubmit = async (data: any) => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("id");
      const branch_code = localStorage.getItem("branch_code");
  
      if (!token || !userId) {
        console.error("Token or userId not found");
        return;
      }
      if (notedBy.length === 0 || approvedBy.length === 0) {
      
        alert("Please select an approver.");
        setLoading(false); // Stop loading state
        return; // Prevent form submission
      }
      // Check if any item fields are empty
      if (
        items.some((item) =>
          Object.entries(item)
            .filter(([key, value]) => key !== "remarks")
            .some(([key, value]) => value === "")
        )
      ) {
        console.error("Item fields cannot be empty");
        // Display error message to the user or handle it accordingly
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
        formData.append("attachment[]", file); // Use "attachment[]" to handle multiple files
    });
    const notedByIds = Array.isArray(notedBy) ? notedBy.map(person => person.id) : [];
    const approvedByIds = Array.isArray(approvedBy) ? approvedBy.map(person => person.id) : [];
    formData.append("noted_by", JSON.stringify(notedByIds));
    formData.append("approved_by", JSON.stringify(approvedByIds));
    formData.append("form_type", "Purchase Order Requisition Slip");  
    formData.append("user_id", userId);

    formData.append(
      "form_data",
      JSON.stringify([
          {
            branch: branch_code,
            supplier: data.supplier,
            address: data.address,
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

      setShowConfirmationModal(true);
      setLoading(false);
        // Log formData content
      
        setFormData(formData);
    } catch (error) {
      console.error("An error occurred while submitting the request:", error);
      setLoading(false);
    
    } finally {
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
      alert("Please select an approver.");
      return; // Prevent form submission
    }
  
    try {
      setLoading(true);  
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
      setLoading(false);
      setShowSuccessModal(true);
      setValidationErrors(response.data.message)
      setFormSubmitted(true);
    } catch (error) {
   
      console.error("An error occurred while submitting the request:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseConfirmationModal = () => {
    setShowConfirmationModal(false);
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);

    navigate("/request");
  };

  const handleFormSubmit = () => {
    setFormSubmitted(true);
  };

  const handleCancelSubmit = () => {
    // Close the confirmation modal
    setShowConfirmationModal(false);
    // Reset formData state
    setFormData(null);
  };

  const handleRemoveItem = () => {
    if (items.length > 1) {
      const updatedItems = [...items];
      updatedItems.pop();
      setItems(updatedItems);
    }
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      {
        quantity: "",
        description: "",
        unitCost: "",
        totalAmount: "",
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
    <div className="space-x-3 flex justify-end mt-20 pb-10">
      <button className={`bg-yellow ${buttonStyle}`} onClick={handleAddItem}>
        Add
      </button>
      {items.length > 1 && (
        <button className={`${buttonStyle} bg-pink`} onClick={handleRemoveItem}>
          Remove Item
        </button>
      )}
      <button
        className={`bg-primary ${buttonStyle}`}
        type="submit"
        onClick={handleFormSubmit}
      >
        {loading ? <ClipLoader color="#36d7b7" /> : "Send Request"}
      </button>
    </div>;

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
      <h1 className="text-primary text-[32px] font-bold">Create Request</h1>
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
      <div className="bg-white w-full mb-5 rounded-[12px] flex flex-col">
        <div className="border-b flex justify-between flex-col px-[30px] md:flex-row ">
          <div>
            <h1 className=" text-[24px] text-left py-4 text-primary font-bold flex mr-2">
              <span className="mr-2 underline decoration-2 underline-offset-8">
                Purchase
              </span>{" "}
              Order Requisition Slip
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
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4  mt-2 sm:mt-0 flex-row  justify-start space-y-2 sm:space-y-0 sm:gap-4 lg:gap-0 lg:space-x-4">
                <div className={`${itemDiv}`}>
                  <p className="font-semibold">Supplier</p>
                  <textarea
               
                    {...register("supplier", { required: true })}
                    className={`${inputStyle} h-[44px] p-1`}
                  />

                  {errors.supplier && formSubmitted && (
                    <p className="text-red-500">Supplier is required</p>
                  )}
                </div>
                <div className={`${itemDiv}`}>
                  <p className="font-semibold">Address</p>
                  <textarea
               
                    {...register("address", { required: true })}
                    className={`${inputStyle} h-[44px] p-1`}
                  />
                  {errors.address && formSubmitted && (
                    <p className="text-red-500">Address is required</p>
                  )}
                </div>
              </div>
            </div>
            {items.map((item, index) => (
              <div key={index} className="flex flex-col mt-5 mb-4">
                <label className="font-semibold">ITEM {index + 1}</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 lg:grid-cols-5">
                  <div className={`${itemDiv}`}>
                    <label className="font-semibold">Quantity:</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleInputChange(index, "quantity", e.target.value)
                      }
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
                      className={`${inputStyle} p-2`}
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
                  <div className={`${itemDiv}`}>
                    <label className="font-semibold">Total Amount:</label>
                    <input
                      value={item.totalAmount}
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
                      className={`${inputStyle} p-2`}
                      style={{ minHeight: "100px", maxHeight: "400px" }} // Minimum height 100px, maximum height 400px (optional)
                      onFocus={() => handleTextareaHeight(index, "remarks")} // Adjust height on focus
                      onBlur={() => handleTextareaHeight(index, "remarks")} // Adjust height on blur
                      onInput={() => handleTextareaHeight(index, "remarks")} // Adjust height on input change
                    />
                  </div>
                </div>
              </div>
            ))}
            
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

              <div className="mt-4">
                <p className="font-semibold">
                  Grand Total: ₱{calculateGrandTotal()}
                </p>
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
                </div>
            <div className="space-x-3 flex justify-end mt-20 pb-10">
              <button
               type="button"
                className={`bg-yellow ${buttonStyle}`}
                onClick={handleAddItem}
              >
                Add
              </button>
              {items.length > 1 && (
                <button
                 type="button"
                  className={`${buttonStyle} bg-pink`}
                  onClick={handleRemoveItem}
                >
                  Remove Item
                </button>
              )}
              <button
                className={`bg-primary ${buttonStyle}`}
                type="submit"
                onClick={handleFormSubmit}
                disabled={loading}
              >
                {loading ? <ClipLoader color="#36d7b7" /> : "Send Request"}
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
        handleAddCustomData = {handleAddCustomData}
      />
    </div>
  );
};

export default CreatePurchaseOrder;
