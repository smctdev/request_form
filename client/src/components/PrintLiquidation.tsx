import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import SMCTLogo from "./assets/SMCT.png";
import DSMLogo from "./assets/DSM.jpg";
import DAPLogo from "./assets/DAP.jpg";
import HDILogo from "./assets/HDI.jpg";
import HOLogo from "./assets/logo.png";

type PrintRefundProps = {
  data?: any;
};

const PrintLiquidation: React.FC<PrintRefundProps> = ({ data }) => {
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

  // const tableStyle = "border border-black  py-4";
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

  return (
    <div className="print-container">
      <style>
        {`
    @media print {
      @page{
          size: letter;
          margin:0;
          }

          body {
            padding:0;
            margin: 0;
            display: flex;
            justify-content: center;
            align-items: flex-start;
            height: 100vh;
          }

          .content {
              transform: scale(0.7);
              transform-origin: center;
          }

          .summary-table {
            width: 100%;
          }

          .underline {
            text-decoration: underline;
          }

          .uppercase {
            text-transform: uppercase;
          }

          .two-column {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 10px;
          }
    }
  `}
      </style>
      <div className="bg-white text-black content -m-16">
        <div className="flex flex-col justify-center items-center">
          <div className="justify-center w-1/2">{logo}</div>
          <h1 className="font-semibold text-sm uppercase mt-1">
            liquidation of actual expense
          </h1>
          <div className="flex flex-col items-center font-bold mt-2">
            <h1 className="font-medium text-sm uppercase underline">
              {printData?.user.data.branch || ""}
            </h1>
            <h1 className="text-sm font-semibold">BRANCH</h1>
          </div>
        </div>
        <div className="mt-3">
          <p className="flex text-sm font-medium">
            Activity:{" "}
            <p className="underline ml-2 font-normal">
              {printData?.id.form_data[0].purpose}
            </p>{" "}
          </p>
          <p className="flex text-sm font-medium">
            Date:{" "}
            <p className="underline ml-2 font-normal">
              {formatDate(printData?.id.created_at)}
            </p>
          </p>
        </div>
        <div className="mt-2 mr-1">
          <table className="w-full border border-black text-xs">
            <thead className="border border-black">
              <tr className="border border-black">
                <th className="border border-black font-medium">Date</th>
                <th colSpan={4} className="border border-black font-medium">Transportation</th>
                <th colSpan={3} className="border border-black font-medium">Hotel</th>
                <th colSpan={3} className="border border-black font-medium">PER DIEM OTHER RELATED EXPENSES</th>
                <th className="border border-black font-medium"></th>
              </tr>
              <tr className="border border-black">
                <th className="border border-black font-semibold px-1">Date</th>
                <th className="border border-black font-semibold px-1">From</th>
                <th className="border border-black font-semibold px-1">To</th>
                <th className="border border-black font-semibold px-1">Transportation</th>
                <th className="border border-black font-semibold px-1">Amount</th>
                <th className="border border-black font-semibold px-1">Hotel</th>
                <th className="border border-black font-semibold px-1">Place</th>
                <th className="border border-black font-semibold px-1">Amount</th>
                <th className="border border-black font-semibold px-1">Per Diem</th>
                <th className="border border-black font-semibold px-1">Particulars</th>
                <th className="border border-black font-semibold px-1">Amount</th>
                <th className="border border-black font-semibold px-1">Grand Total</th>
              </tr>
            </thead>
            <tbody>
              {printData?.id.form_data.map((formData: any, index: number) => (
                <React.Fragment key={index}>
                  {formData.items.map((item: any, itemIndex: number) => (
                    <tr key={itemIndex} className="border border-black">
                      <td className="border border-black">{formatDate(item.liquidationDate)}</td>
                      <td className="border border-black">{item.from}</td>
                      <td className="border border-black">{item.to}</td>
                      <td className="border border-black">{item.transportation}</td>
                      <td className="border border-black text-center">{item.transportationAmount}</td>
                      <td className="border border-black">{item.hotel}</td>
                      <td className="border border-black">{item.hotelAddress}</td>
                      <td className="border border-black">{item.hotelAmount}</td>
                      <td className="border border-black text-center">{item.perDiem}</td>
                      <td className="border border-black text-center">{item.particulars}</td>
                      <td className="border border-black text-center">{item.particularsAmount}</td>
                      <td className="border border-black text-center">{item.grandTotal}</td>
                    </tr>
                  ))}
                  {[...Array(Math.max(2 - formData.items.length, 0))].map(
                    (_, emptyIndex) => (
                      <tr key={`empty-${index}-${emptyIndex}`}>
                        <td className="border border-black py-6"></td>
                        <td className="border border-black"></td>
                        <td className="border border-black"></td>
                        <td className="border border-black"></td>
                        <td className="border border-black"></td>
                        <td className="border border-black"></td>
                        <td className="border border-black"></td>
                        <td className="border border-black"></td>
                        <td className="border border-black"></td>
                        <td className="border border-black"></td>
                        <td className="border border-black"></td>
                        <td className="border border-black"></td>
                      </tr>
                    )
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <div className="two-column grid grid-cols-2 gap-6 pt-3 px-5">
          <div>
            <table className="border border-black w-full">
              <tbody className="w-full">
                <tr>
                  <td className="border border-black px-2 py-1 font-semibold text-xs">
                    TOTAL EXPENSE
                  </td>
                  <td className="border border-black px-2 py-1 font-normal text-xs">
                    {printData?.id.form_data[0].totalExpense}
                  </td>
                </tr>

                <tr>
                  <td className="border border-black px-2 py-1 font-semibold text-xs">
                    CASH ADVANCE
                  </td>
                  <td className="border border-black px-2 py-1 font-normal text-xs">
                    {printData?.id.form_data[0].cashAdvance}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-1 font-semibold text-xs">
                    SHORT
                  </td>
                  <td className="border border-black px-2 py-1 font-normal text-xs">
                    {printData?.id.form_data[0].short}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div>
            <table className="border border-black w-full">
              <tbody>
                <tr>
                  <td className="border border-black px-2 py-1 font-medium text-xs">
                    NAME OF EMPLOYEE
                  </td>
                  <td className="border border-black px-2 py-1 font-normal text-xs">
                    {printData?.user.data.lastName},{" "}
                    {printData?.user.data.firstName}
                  </td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-1 font-medium text-xs">
                    SIGNATURE
                  </td>
                  <td className="border border-black px-2 py-1 font-medium text-xs h-20">
                    <img
                      src={printData?.user.data.signature}
                      className="h-16"
                      alt="Signature"
                    />
                  </td>
                </tr>
                <tr>
                  <td className="border border-black px-2 py-1 font-medium text-xs">
                    EMPLOYEE NO.
                  </td>
                  <td className="border border-black px-2 py-1 font-normal text-xs">
                    {printData?.user.data.employee_id}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <div className="mt-4 ">
          <div className="flex flex-wrap justify-start ">
            {/* Requested By Section */}
            <div className="mb-4 flex-grow">
              <h3 className="font-normal text-sm mb-3">Requested By:</h3>
              <div className="flex flex-col items-center justify-center relative pt-3">
                <img
                  className="absolute -top-3 left-1/2 transform -translate-x-1/2 pointer-events-none"
                  src={printData?.user.data.signature}
                  alt="avatar"
                  width={120}
                />
                <p className="relative z-10 px-2 underline font-medium text-sm">
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
              <h3 className="font-normal text-sm mb-3">Noted By:</h3>
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
                    <p className="relative z-10 underline text-center font-medium text-sm">
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
              <h3 className="font-normal text-sm mb-3">Approved By:</h3>
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
                    <p className="relative z-10 underline text-center font-medium text-sm">
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

export default PrintLiquidation;
