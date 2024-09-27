import React, { useState, useEffect } from "react";
import Man from "./assets/manComputer.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPaperPlane, faCheck, faEnvelope } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";
import axios from "axios";
import DataTable from "react-data-table-component";
import ClipLoader from "react-spinners/ClipLoader";
import { set } from "react-hook-form";
import { CheckIcon, ChartBarIcon } from "@heroicons/react/24/solid";
import { useUser } from '../context/UserContext';


interface FormData {
  purpose: string;
  items: Item[];
  date: string;
  branch: string;
  grand_total: string;
  supplier?: string;
  address?: string;
  totalBoatFare?: string;
  totalContingency?: string;
  totalFare?: string;
  totalHotel?: string;
  totalperDiem?: string;
  totalExpense?: string;
  cashAdvance?: string;
  short?: string;
  name?: string;
  signature?: string;
}

interface Item {
  quantity: string;
  description: string;
  unitCost: string;
  totalAmount: string;
  remarks?: string | null;
  date?: string;
  branch?: string;
  status?: string;
  day?: string;
}

interface Request {
  id: number;
  user_id: number;
  form_type: string;
  form_data: FormData[];
  date: string;
  branch: string;
  status: string;
  purpose?: string;
  totalBoatFare?: string;
  destination?: string;
  approvers_id?: number;
  created_at?: string;
}

const boxWhite = "bg-white w-full h-[190px] rounded-[15px] drop-shadow-lg relative";
const boxPink = "w-full h-[150px] rounded-t-[12px] relative";
const outerLogo = "lg:w-[120px] lg:h-[125px] w-[80px] h-[90px] right-0 mr-[56px] lg:mt-[26px] mt-[56px] absolute";
const innerBox = "lg:w-[82px] lg:h-[84px] w-[57px] h-[58px] bg-white absolute right-0 mr-[29px] lg:mt-[37px] md:mt-[47px] mt-[47px] rounded-[12px] flex justify-center items-center";
const innerLogo = "lg:w-[48px] lg:h-[51px] w-[40px] h-[45px] flex justify-center items-center";

const Dashboard: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalRequestsSent, setTotalRequestsSent] = useState<number | null>(null);
  const [totalApprovedRequests, setTotalApprovedRequests] = useState<number | null>(null);
  const [totalPendingRequests, setTotalPendingRequests] = useState<number | null>(null);
  const [totalDisapprovedRequests, setTotalDisapprovedRequests] = useState<number | null>(null);

  const [branchList, setBranchList] = useState<any[]>([]);
  const [branchMap, setBranchMap] = useState<Map<number, string>>(new Map());
  const { email, role, branchCode, contact, signature } = useUser();
  const firstName = localStorage.getItem("firstName");
  const lastName = localStorage.getItem("lastName");
  const userId = localStorage.getItem("id")
 
  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        const response = await axios.get(
          `http://122.53.61.91:6002/api/view-branch`
        );
        const branches = response.data.data;
  
        // Create a mapping of id to branch_code
        const branchMapping = new Map<number, string>(
          branches.map((branch: { id: number; branch_code: string }) => [
            branch.id,
            branch.branch_code
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
    if (userId) {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token is missing");
        setLoading(false);
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      // Fetch requests data
      axios
        .get(`http://122.53.61.91:6002/api/view-request`, { headers })
        .then((response) => {
          if (Array.isArray(response.data.data)) {
            setRequests(response.data.data);
          } else {
            console.error("Unexpected data format:", response.data);
          }
        })
        .catch((error) => {
          console.error("Error fetching requests data:", error);
        });

      // Fetch total requests sent
      axios
        .get(`http://122.53.61.91:6002/api/total-request-sent/${userId}`, { headers })
        .then((response) => {
     
          setTotalRequestsSent(response.data.totalRequestSent);
          setTotalPendingRequests(response.data.totalPendingRequest);
          setTotalApprovedRequests(response.data.totalApprovedRequest)
          setTotalDisapprovedRequests(response.data.totalDisapprovedRequest);
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching total requests sent:", error);
          setLoading(false);
        });
    }
  }, [userId]);


  const sortedRequests = requests.sort((a, b) => b.id - a.id);

  // Take the first 5 requests
  const latestRequests = sortedRequests.slice(0, 5);

  const columns = [
    {
      name: "Request ID",
      selector: (row: Request) => row.id,
      width: "100px",
      sortable: true,
    },
   
    {
      name: "Request Type",
      selector: (row: Request) => row.form_type,
      width: "300px",
    },
    {
      name: "Date",
      selector: (row: Request) =>
        row.created_at ? new Date(row.created_at).toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        }) : '',
      sortable: true,
    },
    {
      name: "Branch",
      selector: (row: Request) => {
      
        const branchId = parseInt(row.form_data[0].branch, 10);
        return branchMap.get(branchId) || "Unknown";
      },
    },
    {
      name: "Status",
      selector: (row: Request) => row.status.trim(),
      sortable: true,
      cell: (row: Request) => (
        <div
          className={`${
            row.status.trim() === "Pending"
            ? "bg-yellow"
            : row.status.trim() === "Approved"
            ? "bg-green"
            : row.status.trim() === "Disapproved"
            ? "bg-pink"
            : row.status.trim() === "Ongoing"
             ? "bg-primary"
            
            : ""
          } rounded-lg py-1 w-full md:w-full xl:w-3/4 2xl:w-2/4 text-center text-white`}
        >
          {row.status.trim()}
        </div>
      ),
    },
  ];



  return (
    <div className="bg-graybg dark:bg-blackbg h-full pt-[26px] px-[35px]">
      
      <div className="bg-primary w-full sm:w-full h-[210px] rounded-[12px] pl-[30px] flex flex-row justify-between items-center">
        <div>
          <p className="text-[15px] lg:text-[20px]">Hi, {firstName} 👋</p>
          <p className="text-[15px] lg:text-[20px] text-white font-semibold">
            Welcome to Request
          </p>
          <p className="text-[15px] hidden sm:block text-white mb-4">
            Request products and services
          </p>
          <div>
            <Link to="/request">
              <button className="bg-[#FF947D] text-[10px] w-full lg:h-[57px] h-[40px] rounded-[12px] font-semibold">
                Raise a Request
              </button>
            </Link>
          </div>
        </div>
        <div className="ml-4 mr-[29px]">
          <img alt="man" src={Man} width={320} height={176} />
        </div>
      </div>

      <div className="w-full sm:w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 space-y-2 md:space-y-0 gap-8 mt-4">
        <div className={`${boxWhite} hover:-translate-y-1 hover:scale-110`}>
          <div className={`${boxPink} bg-primary`}>
            <ChartBarIcon className={`${outerLogo} text-[#298DDE]`} />
            <div className={`${innerBox}`}>
              <ChartBarIcon className={`${innerLogo} text-primary`} />
            </div>
            <p className="text-[16px] font-semibold mt-[30px] ml-[17px] absolute">
              Total Requests
            </p>
            <p className="text-[40px] font-bold bottom-6 mx-5 absolute">
              {totalRequestsSent}
            </p>
          </div>
        </div>
        <div className={`${boxWhite} hover:-translate-y-1 hover:scale-110`}>
          <div className={`${boxPink} bg-green`}>
            <FontAwesomeIcon
              icon={faCheck}
              className={`${outerLogo} text-[#4D9651]`}
            />
            <div className={`${innerBox}`}>
              <FontAwesomeIcon
                icon={faCheck}
                className={`${innerLogo} text-green`}
              />
            </div>
            <p className="text-[16px] font-semibold mt-[30px] ml-[17px] absolute">
              Approved Requests
            </p>
            <p className="text-[40px] font-bold bottom-6 mx-5 absolute">
              {totalApprovedRequests}
            </p>
          </div>
        </div>
        <div className={`${boxWhite} hover:-translate-y-1 hover:scale-110`}>
          <div className={`${boxPink} bg-yellow`}>
            <FontAwesomeIcon
              icon={faEnvelope}
              className={`${outerLogo} text-[#D88A1B]`}
            />
            <div className={`${innerBox}`}>
              <FontAwesomeIcon
                icon={faEnvelope}
                className={`${innerLogo} text-yellow`}
              />
            </div>
            <p className="text-[16px] font-semibold mt-[30px] ml-[17px] absolute">
              Pending Requests
            </p>
            <p className="text-[40px] font-bold bottom-6 mx-5 absolute">
              {totalPendingRequests}
            </p>
          </div>
        </div>
        <div className={`${boxWhite} hover:-translate-y-1 hover:scale-110`}>
          <div className={`${boxPink} bg-pink`}>
            <FontAwesomeIcon
              icon={faPaperPlane}
              className={`${outerLogo} text-[#C22158]`}
            />
            <div className={`${innerBox}`}>
              <FontAwesomeIcon
                icon={faPaperPlane}
                className={`${innerLogo} text-pink`}
              />
            </div>
            <p className="text-[16px] font-semibold mt-[30px] ml-[17px] absolute">
              Unsuccessful Requests
            </p>
            <p className="text-[40px] font-bold bottom-6 mx-5 absolute">
              {totalDisapprovedRequests}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-[20px] mb-10 bg-white w-full h-72 drop-shadow-lg rounded-[12px] relative sm:w-full overflow-x-auto">
        <h1 className="py-[16px] px-[25px] font-bold text-[20px]">Recent requests</h1>
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <ClipLoader color={"#123abc"} loading={loading} size={50} />
          </div>
        ) : (
          <DataTable columns={columns} data={latestRequests} pagination />
        )}
      </div>
    </div>
  );
};

export default Dashboard;