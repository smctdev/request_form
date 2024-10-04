import React, { useEffect, useState } from "react";
import Avatar from "./assets/avatar.png"; // Example import for avatar
import { useLocation } from "react-router-dom";
import { table } from "console";
import SMCTLogo from "./assets/SMCT.png";
import DSMLogo from "./assets/DSM.jpg";
import DAPLogo from "./assets/DAP.jpg";
import HDILogo from "./assets/HDI.jpg";
import HOLogo from "./assets/logo.png";
type PrintRefundProps = {
  data?: any;
};
const tableStyle = " border-black border py-4 font-bold";
const PrintDiscount: React.FC<PrintRefundProps> = ({ data }) => {
  const location = useLocation();
  const [printData, setPrintData] = useState<any>(null); // State to hold print data
  const queryParams = new URLSearchParams(location.search);
  const serializedData = queryParams.get("data");
  let logo;
  if (printData?.user?.data?.branch === "Strong Motoentrum, Inc.") {
    logo = <img src={SMCTLogo} alt="SMCT Logo" />;
  } else if (printData?.user?.data?.branch === "Des Strong Motors, Inc.") {
    logo = <img src={DSMLogo} alt="DSM Logo" />;
  } else if (printData?.user?.data?.branch === "Des Appliance Plaza, Inc.") {
    logo = <img src={DAPLogo} alt="DAP Logo" />;
  } else if (printData?.user?.data?.branch === "Honda Des, Inc.") {
    logo = <img src={HDILogo} alt="HDI Logo" />;
  } else if (printData?.user?.data?.branch === "Head Office") {
    logo = (
      <div className="flex items-center justify-center">
        <img src={HOLogo} alt="HO Logo" className="w-44" />
      </div>
    );
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

  // useEffect(() => {
  //   // Retrieve the data from localStorage
  //   const storedData = localStorage.getItem("printData");
  //   if (storedData) {
  //     const parsedData = JSON.parse(storedData);
  //     setPrintData(parsedData); // Set the printData state
  //   }

  //   localStorage.removeItem("printData");
  // }, []);

  // useEffect(() => {
  //   if (printData !== null) {
  //     window.print();

  //     window.onafterprint = () => {
  //       localStorage.removeItem("printData"); // Clean up after printing
  //       window.close(); // Close the tab after printing or canceling
  //     };
  //   }
  // }, [printData]);

  useEffect(() => {
    const storedData = localStorage.getItem("printData");
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      setPrintData(parsedData);
    }
  
    localStorage.removeItem("printData");
  }, []);
  
  useEffect(() => {
    if (printData !== null) {
      let isPrinting = false;
  
      window.onbeforeprint = () => {
        isPrinting = true;
      };
  
      window.onafterprint = () => {
        localStorage.removeItem("printData");
        window.close();
      };
  
      window.print();
  
      setTimeout(() => {
        if (!isPrinting) {
          window.close();
        }
      }, 500);
    }
  }, [printData]);

  const tableStyle = "border-black border py-2 font-bold text-xs text-center";
  return (
    <div className="bg-white h-lvh text-black">
      <style>
        {`
        @media print
        {
          @page{
          size: letter;
          margin:20px; 
          }
        }
        `}
      </style>
      <div className="border-2 border-black px-4 pt-2">
      <div className="flex justify-end pr-3">
          <p className="flex font-medium text-xs">
            Date:{" "}
            <p className="underline ml-2 text-xs font-normal">
              {formatDate(printData?.id.created_at)}
            </p>
          </p>
        </div>
        <div className="flex flex-col justify-center items-center">
          <div className="justify-center w-1/2">{logo}</div>

          <h1 className="mt-2 font-semibold text-xs uppercase">
            Discount Requisition Slip
          </h1>
          <div className="flex flex-col items-center font-medium text-xs mt-2">
            <h1 className="font-medium text-xs uppercase underline">
              {printData?.user.data.branch}
            </h1>
            <h1 className="text-xs font-semibold">BRANCH</h1>
          </div>
        </div>
        {/* <div className="flex justify-end pr-6">
          <p className=" mb-2 flex font-medium text-xs ">
            Date:{" "}
            <p className="underline ml-2 mb-2 font-normal">
              {formatDate(printData?.id.created_at)}
            </p>
          </p>
        </div> */}
        <div className="flex justify-center w-full mt-2">
          <table className="border w-full">
            <thead className="border border-black ">
              <tr>
                <th className="border border-black font-medium text-xs text-center px-1">
                  Brand
                </th>
                <th className="border border-black font-medium text-xs text-center px-1">
                  Model
                </th>
                <th className="border border-black font-medium text-xs text-center px-1 whitespace-nowrap">
                  Unit/Part/Job Description
                </th>
                <th className="border border-black font-medium text-xs text-center px-1 whitespace-nowrap">
                  Part No./Job Order No.
                </th>
                <th className="border border-black font-medium text-xs text-center px-1 whitespace-nowrap">
                  Labor Charge
                </th>
                <th className="border border-black font-medium text-xs text-center px-1 whitespace-nowrap">
                  Net Spotcash
                </th>
                <th className="border border-black font-medium text-xs text-center px-1 whitespace-nowrap">
                  Discounted Price
                </th>
              </tr>
            </thead>
            <tbody>
              {printData?.id.form_data.map((formData: any, index: number) => (
                <React.Fragment key={index}>
                  {formData.items.map((item: any, itemIndex: number) => (
                    <tr key={itemIndex}>
                      <td className="border border-black font-normal text-xs text-center px-1">
                        {item.brand}
                      </td>
                      <td className="border border-black font-normal text-xs text-center px-1">
                        {item.model}
                      </td>
                      <td className="border border-black font-normal text-xs text-center px-1">
                        {item.unit}
                      </td>
                      <td className="border border-black font-normal text-xs text-center px-1">
                        {item.partno}
                      </td>
                      <td className="border border-black font-normal text-xs text-center px-1">
                        {item.labor}
                      </td>
                      <td className="border border-black font-normal text-xs text-center px-1">
                        {item.spotcash}
                      </td>
                      <td className="border border-black font-normal text-xs text-center px-1">
                        {item.discountedPrice}
                      </td>
                    </tr>
                  ))}
                  {[...Array(Math.max(5 - formData.items.length, 0))].map(
                    (_, emptyIndex) => (
                      <tr key={`empty-${index}-${emptyIndex}`}>
                        <td className={`${tableStyle} `}></td>
                        <td className={`${tableStyle} `}></td>
                        <td className={`${tableStyle} `}></td>
                        <td className={`${tableStyle} `}></td>
                        <td className={`${tableStyle} `}></td>
                        <td className={`${tableStyle} `}></td>
                        <td className={`${tableStyle} `}></td>
                      </tr>
                    )
                  )}
                </React.Fragment>
              ))}
            </tbody>
            <tfoot className={`${tableStyle} `}>
              <tr>
                <td colSpan={4} className="text-right font-medium text-xs border-black border">
                  Total:
                </td>
                <td className="font-medium text-xs text-center border border-black">
                  {printData?.id.form_data[0].total_labor.toFixed(2)}
                </td>
                <td className="font-medium text-xs text-center border border-black">
                  {printData?.id.form_data[0].total_spotcash.toFixed(2)}
                </td>
                <td className="font-medium text-xs text-center border border-black">
                  {printData?.id.form_data[0].total_discount.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-4 ">
          <div className="flex flex-wrap justify-start ">
            {/* Requested By Section */}
            <div className="mb-4 flex-grow">
              <h3 className="font-normal text-xs mb-3">Requested By:</h3>
              <div className="flex flex-col items-center justify-center relative pt-3">
                <img
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2 pointer-events-none"
                  src={printData?.user.data.signature}
                  alt="avatar"
                  width={120}
                />
                <p className="relative z-10 px-2 underline font-normal text-xs">
                  {printData?.user.data.firstName}{" "}
                  {printData?.user.data.lastName}
                </p>
                <p className="font-light text-xs text-center">
                  {printData?.user.data.position}
                </p>
              </div>
            </div>

            {/* Noted By Section */}
            <div className="mb-4 flex-grow">
              <h3 className="font-normal text-xs mb-3">Noted By:</h3>
              <div className="flex flex-wrap justify-start">
                {printData?.notedBy.map((approver: any, index: number) => (
                  <div
                    key={index}
                    className="flex flex-col items-center justify-center relative pt-3 mr-10"
                  >
                    {approver.status === "Approved" && (
                      <img
                        className="absolute -top-3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                        src={approver.signature}
                        alt=""
                        width={120}
                      />
                    )}
                    <p className="relative z-10 underline text-center font-normal text-xs">
                      {approver.firstName} {approver.lastName}
                    </p>
                    <p className="font-light text-xs text-center">
                      {approver.position}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Approved By Section */}
            <div className="mb-4 flex-grow">
              <h3 className="font-normal text-xs mb-3">Approved By:</h3>
              <div className="flex flex-wrap justify-start">
                {printData?.approvedBy.map((approver: any, index: number) => (
                  <div
                    key={index}
                    className="flex flex-col justify-start items-center mr-10 relative pt-3"
                  >
                    {approver.status === "Approved" && (
                      <img
                        className="absolute -top-3 left-1/2 transform -translate-x-1/2 pointer-events-none"
                        src={approver.signature}
                        alt=""
                        width={120}
                      />
                    )}
                    <p className="relative z-10 underline text-center font-normal text-xs">
                      {approver.firstName} {approver.lastName}
                    </p>
                    <p className="font-light text-xs text-center">
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

export default PrintDiscount;
