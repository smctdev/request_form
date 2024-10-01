import React, { useEffect, useState } from "react";
import Avatar from "./assets/avatar.png"; // Example import for avatar
import { useLocation } from "react-router-dom";
import { table } from "console";
import SMCTLogo from "./assets/SMCT.png";
import DSMLogo from "./assets/DSM.jpg";
import DAPLogo from "./assets/DAP.jpg";
import HDILogo from "./assets/HDI.jpg";
type PrintRefundProps = {
  data?: any;
};

const PrintStock: React.FC<PrintRefundProps> = ({ data }) => {
  const location = useLocation();
  const [printData, setPrintData] = useState<any>(null); // State to hold print data
  const queryParams = new URLSearchParams(location.search);
  const serializedData = queryParams.get("data");
  let logo;
  if (printData?.user?.data?.branch === "Strong Motocentrum, Inc.") {
    logo = <img src={SMCTLogo} alt="SMCT Logo" />;
  } else if (printData?.user?.data?.branch === "Des Strong Motors, Inc.") {
    logo = <img src={DSMLogo} alt="DSM Logo" />;
  } else if (printData?.user?.data?.branch === "Des Appliance Plaza, Inc.") {
    logo = <img src={DAPLogo} alt="DAP Logo" />;
  } else if (printData?.user?.data?.branch === "Honda Des, Inc.") {
    logo = <img src={HDILogo} alt="HDI Logo" />;
  } else {
    logo = null; // Handle the case where branch does not match any of the above
  }
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return ""; // Return empty string if dateString is undefined or null

    // Convert dateString to Date object
    const date = new Date(dateString);

    // Check if date is a valid Date object
    if (!(date instanceof Date && !isNaN(date.getTime()))) {
      return ""; // Return empty string if date is not a valid Date object
    }

    const options: Intl.DateTimeFormatOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    };

    return date.toLocaleDateString("en-US", options);
  };

  useEffect(() => {
    // Retrieve the data from localStorage
    const storedData = localStorage.getItem("printData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setPrintData(parsedData); // Set the printData state
    }

    localStorage.removeItem("printData");
  }, []);

  useEffect(() => {
    if (printData !== null) {
      window.print();

      window.onafterprint = () => {
        localStorage.removeItem("printData"); // Clean up after printing
        window.close(); // Close the tab after printing or canceling
      };
    }
  }, [printData]);

  const tableStyle = "border-b border-black";
  return (
    <div className="print-container bg-white h-lvh text-black  ">
      <div className="border-2 border-black px-4 pt-2">
        <div className="flex flex-col justify-center items-center">
          <div className="justify-center w-1/2 ">{logo}</div>

          <h1 className="font-bold text-lg uppercase">
            Stock Requisition Slip
          </h1>
          <div className="flex flex-col items-center font-bold mt-2">
            <h1 className="font-medium text-[16px] uppercase underline">
              {printData?.user.data.branch}
            </h1>
            <h1 className="text-lg">BRANCH</h1>
          </div>
        </div>
        <div className="flex absolute justify-start pr-6">
          <p className=" mb-2 flex font-bold ">
            Purpose: {printData?.purpose}
            </p>
        </div>
        <div className="flex justify-end pr-6">
          <p className=" mb-2 flex font-bold ">
            Date:{" "}
            <p className="underline ml-2 mb-2">
              {formatDate(printData?.id.created_at)}
            </p>
          </p>
        </div>
        {/*   
      <p>Status: {printData.status}</p>
      
     <p>Date: {formatDate(data.date)}</p> */}
        <div className="flex justify-center w-full">
          <table className="w-full border-separate border-spacing-x-4">
            <thead className="">
              <tr>
                <th>Quantity</th>
                <th>Description</th>
                <th>Unit Cost</th>
                <th>Total Amount</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {printData?.id.form_data.map((formData: any, index: number) => (
                <React.Fragment key={index}>
                  {formData.items.map((item: any, itemIndex: number) => (
                    <tr key={itemIndex} className="text-center">
                      <td className={`${tableStyle}`}>{item.quantity}</td>
                      <td className={`${tableStyle}`}>{item.description}</td>
                      <td className={`${tableStyle}`}>{item.unitCost}</td>
                      <td className={`${tableStyle}`}>{item.totalAmount}</td>
                      <td className={`${tableStyle}`}>{item.remarks}</td>
                    </tr>
                  ))}
                  <tr key="empty-0-0">
                    <td className={`${tableStyle} py-4`}></td>
                    <td className={`${tableStyle}`}></td>
                    <td className={`${tableStyle}`}></td>
                    <td className={`${tableStyle}`}></td>
                    <td className={`${tableStyle}`}></td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <p className="uppercase font-bold mt-2 ml-4">
          Grand Total: ₱ {printData?.id.form_data[0].grand_total}
        </p>

        <div className="mt-4 ">
          <div className="flex flex-wrap justify-start ">
            {/* Requested By Section */}
            <div className="mb-4 flex-grow">
              <h3 className="font-bold mb-3">Requested By:</h3>
              <div className="flex flex-col items-center justify-center relative pt-8">
                <img
                  className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-none"
                  src={printData?.user.data.signature}
                  alt="avatar"
                  width={120}
                />
                <p className="relative z-10 px-2 underline font-bold">
                  {printData?.user.data.firstName}{" "}
                  {printData?.user.data.lastName}
                </p>
                <p className="font-bold text-xs text-center">
                  {printData?.user.data.position}
                </p>
              </div>
            </div>

            {/* Noted By Section */}
            <div className="mb-4 flex-grow">
              <h3 className="font-bold mb-3">Noted By:</h3>
              <div className="flex flex-wrap justify-start">
                {printData?.notedBy.map((approver: any, index: number) => (
                  <div
                    key={index}
                    className="flex flex-col items-center justify-center relative pt-8 mr-10"
                  >
                    {approver.status === "Approved" && (
                      <img
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                        src={approver.signature}
                        alt=""
                        width={120}
                      />
                    )}
                    <p className="relative z-10 underline text-center font-bold">
                      {approver.firstName} {approver.lastName}
                    </p>
                    <p className="font-bold text-xs text-center">
                      {approver.position}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Approved By Section */}
            <div className="mb-4 flex-grow">
              <h3 className="font-bold mb-3">Approved By:</h3>
              <div className="flex flex-wrap justify-start">
                {printData?.approvedBy.map((approver: any, index: number) => (
                  <div
                    key={index}
                    className="flex flex-col justify-start items-center mr-10 relative pt-8"
                  >
                    {approver.status === "Approved" && (
                      <img
                        className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-none"
                        src={approver.signature}
                        alt=""
                        width={120}
                      />
                    )}
                    <p className="relative z-10 underline text-center font-bold">
                      {approver.firstName} {approver.lastName}
                    </p>
                    <p className="font-bold text-xs text-center">
                      {approver.position}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrintStock;
