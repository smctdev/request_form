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
    <div className="text-black bg-white h-lvh">
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
      <div className="px-4 pt-2 border-2 border-black">
        <div className="flex justify-end pr-3">
          <p className="flex text-xs font-medium">
            Date:{" "}
            <p className="ml-2 text-xs font-normal underline">
              {formatDate(printData?.id.created_at)}
            </p>
          </p>
        </div>
        <div className="flex flex-col items-center justify-center">
          <div className="justify-center w-1/2">{logo}</div>

          <h1 className="mt-2 text-xs font-semibold uppercase">
            Discount Requisition Slip
          </h1>
          <div className="flex flex-col items-center mt-2 text-xs font-medium">
            <h1 className="text-xs font-medium underline uppercase">
              {printData?.requested_branch}
            </h1>
            <h1 className="text-xs font-semibold">BRANCH</h1>
          </div>
        </div>
        {/* <div className="flex justify-end pr-6">
          <p className="flex mb-2 text-xs font-medium ">
            Date:{" "}
            <p className="mb-2 ml-2 font-normal underline">
              {formatDate(printData?.id.created_at)}
            </p>
          </p>
        </div> */}
        <div className="flex justify-center w-full mt-2">
          <table className="w-full border">
            <thead className="border border-black ">
              <tr>
                <th className="px-1 text-xs font-medium text-center border border-black">
                  Brand
                </th>
                <th className="px-1 text-xs font-medium text-center border border-black">
                  Model
                </th>
                <th className="px-1 text-xs font-medium text-center border border-black whitespace-nowrap">
                  Unit/Part/Job Description
                </th>
                <th className="px-1 text-xs font-medium text-center border border-black whitespace-nowrap">
                  Part No./Job Order No.
                </th>
                <th className="px-1 text-xs font-medium text-center border border-black whitespace-nowrap">
                  Labor Charge
                </th>
                <th className="px-1 text-xs font-medium text-center border border-black whitespace-nowrap">
                  Net Spotcash
                </th>
                <th className="px-1 text-xs font-medium text-center border border-black whitespace-nowrap">
                  Discounted Price
                </th>
              </tr>
            </thead>
            <tbody>
              {printData?.id.form_data.map((formData: any, index: number) => (
                <React.Fragment key={index}>
                  {formData.items.map((item: any, itemIndex: number) => (
                    <tr key={itemIndex}>
                      <td className="px-1 text-xs font-normal text-center border border-black">
                        {item.brand}
                      </td>
                      <td className="px-1 text-xs font-normal text-center border border-black">
                        {item.model}
                      </td>
                      <td className="px-1 text-xs font-normal text-center border border-black">
                        {item.unit}
                      </td>
                      <td className="px-1 text-xs font-normal text-center border border-black">
                        {item.partno}
                      </td>
                      <td className="px-1 text-xs font-normal text-center border border-black">
                        {item.labor}
                      </td>
                      <td className="px-1 text-xs font-normal text-center border border-black">
                        {item.spotcash}
                      </td>
                      <td className="px-1 text-xs font-normal text-center border border-black">
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
                <td
                  colSpan={4}
                  className="text-xs font-medium text-right border border-black"
                >
                  Total:
                </td>
                <td className="text-xs font-medium text-center border border-black">
                  {printData?.id.form_data[0].total_labor.toFixed(2)}
                </td>
                <td className="text-xs font-medium text-center border border-black">
                  {printData?.id.form_data[0].total_spotcash.toFixed(2)}
                </td>
                <td className="text-xs font-medium text-center border border-black">
                  {printData?.id.form_data[0].total_discount.toFixed(2)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="mt-4 ">
          <div className="flex flex-wrap justify-start ">
            {/* Requested By Section */}
            <div className="flex-grow mb-4">
              <h3 className="mb-2 text-sm font-normal">Requested By:</h3>
              <div className="relative flex flex-col items-center justify-center pt-4">
                <img
                  className="absolute transform -translate-x-1/2 pointer-events-none -top-3 left-1/2"
                  src={printData?.user?.data?.signature}
                  alt="avatar"
                  width={120}
                />
                <p className="relative z-10 px-2 text-sm font-normal underline">
                  {printData?.user?.data?.firstName}{" "}
                  {printData?.user?.data?.lastName}
                </p>
                <p className="text-xs font-light text-center">
                  {printData?.user?.data?.position}
                </p>
              </div>
            </div>

            {/* Noted By Section */}
            <div className="flex-grow mb-4">
              <h3 className="mb-3 text-xs font-normal">Noted By:</h3>
              <div className="flex flex-wrap justify-start">
                {printData?.notedBy.map((approver: any, index: number) => (
                  <div
                    key={index}
                    className="relative flex flex-col items-center justify-center pt-3 mr-10"
                  >
                    {approver.status === "Approved" && (
                      <img
                        className="absolute transform -translate-x-1/2 pointer-events-none -top-3 left-1/2"
                        src={approver.signature}
                        alt=""
                        width={120}
                      />
                    )}
                    <p className="relative z-10 text-xs font-normal text-center underline">
                      {approver.firstName} {approver.lastName}
                    </p>
                    <p className="text-xs font-light text-center">
                      {approver.position}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Approved By Section */}
            <div className="flex-grow mb-4">
              <h3 className="mb-3 text-xs font-normal">Approved By:</h3>
              <div className="flex flex-wrap justify-start">
                {printData?.approvedBy.map((approver: any, index: number) => (
                  <div
                    key={index}
                    className="relative flex flex-col items-center justify-start pt-3 mr-10"
                  >
                    {approver.status === "Approved" && (
                      <img
                        className="absolute transform -translate-x-1/2 pointer-events-none -top-3 left-1/2"
                        src={approver.signature}
                        alt=""
                        width={120}
                      />
                    )}
                    <p className="relative z-10 text-xs font-normal text-center underline">
                      {approver.firstName} {approver.lastName}
                    </p>
                    <p className="text-xs font-light text-center">
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
