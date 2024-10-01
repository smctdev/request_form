import React, { useEffect, useState } from "react";
import Avatar from "./assets/avatar.png"; // Example import for avatar
import { useLocation } from "react-router-dom";
import { table } from "console";
import SMCTLogo from "./assets/SMCT.png";
import DSMLogo from "./assets/DSM.jpg";
import DAPLogo from "./assets/DAP.jpg";
import HDILogo from "./assets/HDI.jpg";
import { toWords } from "number-to-words";
import { ToWords } from "to-words";
type PrintRefundProps = {
  data?: any;
};

const tableStyle = "border border-black px-4 py-2";
const PrintCash: React.FC<PrintRefundProps> = ({ data }) => {
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

/*   useEffect(() => {
    if (printData !== null) {
      window.print();

      window.onafterprint = () => {
        localStorage.removeItem("printData"); // Clean up after printing
        window.close(); // Close the tab after printing or canceling
      };
    }
  }, [printData]); */

  const tableStyle = " border-black border py-4 font-bold";
  return (
    <div className="print-container p-2 parent ">
      <style>
        {`
          @media print {
            .print-container {
              padding: 4px;
              margin: 2px;
            }
               .parent {
            page-break-inside: avoid;
        }

        .div1 {
            page-break-after: always;
        }
               .print-page {
              padding: 4px;
              margin: 2px;
              text-align: justify;
                  font-size: 9px;
            }
                  .sign-name{
                  font-size: 10px;}

            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 20px;
            }

            th, td {
              padding: 2px;
              border: 1px solid black;
              vertical-align: top;
              font-size: 9px;
            }

            .summary-table {
              width: 20%;
            }

            .flex-wrap {
              flex-wrap: wrap;
            }

            .justify-between {
              justify-content: space-between;
            }

            .font-bold {
              font-weight: bold;
            }

            .underline {
              text-decoration: underline;
            }

            .text-center {
              text-align: center;
            }

            .uppercase {
              text-transform: uppercase;
            }
          }
        `}
      </style>
      <div className=" print-page div1 flex flex-col font-bold  border-2 border-black h-auto pb-10 mb-10">
        <h1 className="uppercase text-2xl mt-10  text-center">
          Application for Cash Advance
        </h1>
        <div className="mx-20 mt-10 ">
          <p className=" indent-10">
            I hereby apply for cash advance in the amount of
            <span className="border-b border-black px-6 ml-2">
              {printData?.id?.form_data?.[0]?.grand_total
                ? toWords(printData?.id?.form_data?.[0]?.grand_total)
                : "N/A"}
            </span>
            (₱ {printData?.id?.form_data?.[0]?.grand_total}) for the following
            reasons:{" "}
            <span className="border-b border-black px-6">
              {printData?.id.form_data[0].remarks}
            </span>
            I promise to liquidate the said amount on or before{" "}
            <span className="border-b border-black px-6">
              {formatDate(printData?.id.form_data[0].liquidationDate)}
            </span>{" "}
            it is understood that my failure to do so shall mean the imposition
            of appropriate disciplinary action upon me by the company.
          </p>
        </div>
        {/* container signature */}
        <div className="flex  justify-between mx-20 mt-10">
          <div className="mb-4 flex-grow relative flex">
            <h3 className="font-bold mb-3 indent-10 sign-name">Payee:</h3>
            <div className="ml-6  text-center">
              <span className=" inline-block border-b sign-name border-black w-[200px] text-center">
                {printData?.user?.data?.firstName}{" "}
                {printData?.user?.data?.lastName}
              </span>
            </div>
          </div>
          <div className="mb-4 flex-grow relative flex ">
            <div className="ml-6 relative  ">
              <img
                className="absolute -top-3 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                src={printData?.user?.data?.signature}
                alt=""
                width={100}
              />
              <div className="border-b w-[200px] border-black text-center">
                <span className="   text-center sign-name">
                  {printData?.user?.data?.firstName}{" "}
                  {printData?.user?.data?.lastName}
                </span>
              </div>

              <p className=" text-center text-[9px]">Print Name & Sign</p>
            </div>
          </div>
        </div>
        <div className="flex  justify-between border-b-2 pb-4 border-dashed border-black w-full">
          <div className="ml-20">
            <p>Noted By:</p>
            <div className=" border-black text-center">
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
                  <div className=" border-b w-[200px] border-black">
                    <p className=" text-[8px] relative z-10 text-sm text-center font-bold ">
                      {approver.firstName} {approver.lastName} 
                    </p>
                  </div>
                  <p className="font-bold  text-center">{approver.position}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mr-20">
            <p>Approved By:</p>
            <div className=" border-black text-center">
              {printData?.approvedBy.map((approver: any, index: number) => (
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
                  <div className="border-b w-[200px] border-black">
                    <p className="relative z-10 text-sm text-center font-bold">
                      {approver.firstName} {approver.lastName}
                    </p>
                  </div>
                  <p className="font-bold  text-center">{approver.position}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mx-20 mt-4 ">
          <h1 className="text-2xl mb-16 text-center">LIQUIDATION STATEMENT</h1>

          <div className="w-2/5">
            <p className="flex justify-between">
              <span className="w-full">TOTAL CASH ADVANCE</span>
              <span className="ml-4">P</span>
              <span className="border-b border-black w-36 text-center">
                {printData?.id.form_data[0].grand_total}
              </span>
            </p>
            <p className="flex justify-between">
              <span className="w-full">TOTAL EXPENSES</span>
              <span className="ml-4">P</span>
              <span className="border-b border-black w-36 text-center"></span>
            </p>
            <p className="flex justify-between">
              <span className="w-full">BALANCE</span>
              <span className="ml-4">P</span>
              <span className="border-b border-black w-36 text-center"></span>
            </p>
          </div>
        </div>
        <div className="flex  justify-between pb-4  w-full">
          <div className="ml-20">
            <p>Noted By:</p>
            <div className=" border-black text-center">
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
                  <div className="border-b w-[200px] border-black">
                    <p className="relative z-10 text-sm text-center font-bold">
                      {approver.firstName} {approver.lastName}
                    </p>
                  </div>
                  <p className="font-bold  text-center">{approver.position}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="mr-20">
            <p>Approved By:</p>
            <div className=" border-black text-center">
              {printData?.approvedBy.map((approver: any, index: number) => (
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
                  <div className="border-b w-[200px] border-black">
                    <p className="relative z-10 text-sm text-center font-bold">
                      {approver.firstName} {approver.lastName}
                    </p>
                  </div>
                  <p className="font-bold  text-center">{approver.position}</p>
                </div>
              ))}
              <div className="flex flex-col items-center justify-center relative pt-8 mr-10">
                <div className="border-b w-[200px] border-black">
                  <p className="relative z-10 text-sm text-center font-bold">
                    Marilou D. Lumapas
                  </p>
                </div>
                <p className="font-bold text-center">Vice President</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className=" print-page div2 flex flex-col font-bold  border-2 border-black h-auto pb-10 mb-10">
        <div className="flex flex-col justify-center items-center">
          <div className="justify-center w-1/2 mt-10">{logo}</div>

          <h1 className="font-bold text-lg uppercase">
            Application for Cash Advance
          </h1>
          <div className="flex flex-col items-center font-bold mt-2">
            <h1 className="font-medium text-[16px] uppercase underline">
              {printData?.user.data.branch || ""}
            </h1>
            <h1 className="text-lg">BRANCH</h1>
          </div>
        </div>

        {/*   
      <p>Status: {printData.status}</p>
      
     <p>Date: {formatDate(data.date)}</p> */}
        <div className="flex justify-center w-full">
          <table className="border w-[70%] mr-2">
            <thead className="border border-black ">
              <tr>
                <th className={`${tableStyle} `}>Date</th>
                <th className={`${tableStyle} `}>Day</th>
                <th className={`${tableStyle} `}>From</th>
                <th className={`${tableStyle} `}>To</th>
                <th className={`${tableStyle} `}>Activity</th>
                <th className={`${tableStyle} `}>Hotel</th>
                <th className={`${tableStyle} `}>Rate</th>
                <th className={`${tableStyle} `}>Amount</th>
                <th className={`${tableStyle} `}>Per Diem</th>
                <th className={`${tableStyle} `}>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {printData?.id.form_data.map((formData: any, index: number) => (
                <React.Fragment key={index}>
                  {formData.items.map((item: any, itemIndex: number) => (
                    <tr key={itemIndex}>
                      <td className={`${tableStyle} `}>
                        {formatDate(item.cashDate)}
                      </td>
                      <td className={`${tableStyle} `}>{item.day}</td>
                      <td className={`${tableStyle} `}>{item.from}</td>
                      <td className={`${tableStyle} `}>{item.to}</td>
                      <td className={`${tableStyle} `}>{item.activity}</td>
                      <td className={`${tableStyle} `}>{item.hotel}</td>
                      <td className={`${tableStyle} `}>{item.rate}</td>
                      <td className={`${tableStyle} `}>{item.amount}</td>
                      <td className={`${tableStyle} `}>{item.perDiem}</td>
                      <td className={`${tableStyle} `}>{item.remarks}</td>
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
                        <td className={`${tableStyle} `}></td>
                        <td className={`${tableStyle} `}></td>
                        <td className={`${tableStyle} `}></td>
                      </tr>
                    )
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          <table className={`${tableStyle} summary-table `}>
            <thead>
              <tr>
                <th colSpan={2} className="bg-[#8EC7F7]">
                  <p className="font-semibold text-[12px] p-2">
                    SUMMARY OF EXPENSES TO BE INCURRED (for C/A)
                  </p>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={`${tableStyle} `}>BOAT FARE</td>
                <td className={`${tableStyle}  `}>
                  {printData?.id.form_data[0].totalBoatFare}
                </td>
              </tr>
              <tr>
                <td className={`${tableStyle} `}>HOTEL</td>
                <td className={`${tableStyle} `}>
                  {printData?.id.form_data[0].totalHotel}
                </td>
              </tr>
              <tr>
                <td className={`${tableStyle} `}>PER DIEM</td>
                <td className={`${tableStyle} `}>
                  {/* Display calculated total per diem */}
                  {printData?.id.form_data[0].items.reduce(
                    (totalPerDiem: number, item: any) =>
                      totalPerDiem + Number(item.perDiem),
                    0
                  )}
                </td>
              </tr>
              <tr>
                <td className={`${tableStyle} `}>FARE</td>
                <td className={`${tableStyle} `}>
                  {printData?.id.form_data[0].totalFare}
                </td>
              </tr>
              <tr>
                <td className={`${tableStyle} `}>CONTINGENCY</td>
                <td className={`${tableStyle} `}>
                  {printData?.id.form_data[0].totalContingency}
                </td>
              </tr>
              <tr>
                <td className={`${tableStyle} `}></td>
                <td className={`${tableStyle} `}></td>
              </tr>
              <tr>
                <td className={`${tableStyle} `}>TOTAL</td>
                <td className={`${tableStyle} `}>
                  ₱ {printData?.id.form_data[0].grand_total}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="uppercase font-bold mt-2">
          Grand Total: {printData?.id.form_data[0].grand_total}
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

export default PrintCash;
