import React, { useState, useEffect } from "react";
import axios from "axios";
import Man from "./assets/manComputer.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPaperPlane,
  faCheck,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import {
  format,
  startOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from "date-fns";
import { CheckIcon, ChartBarIcon } from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useUser } from '../context/UserContext';


type Props = {};

const boxWhite =
  "bg-white w-full h-[190px] rounded-[15px] drop-shadow-lg relative";
const boxPink = "w-full h-[150px] rounded-t-[12px] relative";
const outerLogo =
  "lg:w-[120px] lg:h-[125px] w-[80px] h-[90px] right-0 mr-[56px] lg:mt-[26px] mt-[56px] absolute";
const innerBox =
  "lg:w-[82px] lg:h-[84px] w-[57px] h-[58px] bg-white absolute right-0 mr-[29px] lg:mt-[37px] md:mt-[47px] mt-[47px] rounded-[12px] flex justify-center items-center";
const innerLogo =
  "lg:w-[48px] lg:h-[51px] w-[40px] h-[45px] flex justify-center items-center";

interface Item {
  quantity: string;
  description: string;
  unitCost: string;
  totalAmount: string;
  remarks: string | null;
}

interface FormData {
  branch: string;
  date: string;
  status: string;
  grand_total: string;
  purpose?: string;
  items: Item[];
  approvers?: string;
  supplier?: string;
  address?: string;
}

interface Request {
  id: number;
  user_id: number;
  form_type: string;
  form_data: FormData[];
  created_at: string;
  updated_at: string;
  approvers_id: number;
  status: string;
}

interface ApprovalProcess {
  id: number;
  user_id: number;
  request_id: number;
  status: string;
  created_at: string;
  updated_at: string;
}

const ApproverDashboard: React.FC<Props> = ({}) => {
  const [darkMode, setDarkMode] = useState(true);
  const [records, setRecords] = useState<Request[]>([]);
  const [totalRequests, setTotalRequests] = useState(0);
  const [approvedRequests, setApprovedRequests] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [unsuccessfulRequests, setUnsuccessfulRequests] = useState(0);
  const [areaChartData, setAreaChartData] = useState<
    {
      name: string;
      Total: number;
      Approved: number;
      Pending: number;
      Disapproved: number;
    }[]
  >([]);

  const [barChartData, setBarChartData] = useState<
    { name: string; Request: number }[]
  >([]);
  const [isFetching, setIsFetching] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("thisMonth");
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState<Request[]>([]);
  const [totalRequestsSent, setTotalRequestsSent] = useState<number | null>(
    null
  );
  const [totalApprovedRequests, setTotalApprovedRequests] = useState<
    number | null
  >(null);
  const [totalPendingRequests, setTotalPendingRequests] = useState<
    number | null
  >(null);
  const [totalDisapprovedRequests, setTotalDisapprovedRequests] = useState<
    number | null
  >(null);

  const { email, role, branchCode, contact, signature } = useUser();
  const firstName = localStorage.getItem("firstName")
  const lastName = localStorage.getItem("lastName")
  const userId = localStorage.getItem("id")
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

      // Fetch total requests sent
      axios
        .get(`http://122.53.61.91:6002/api/total-request-sent/${userId}`, {
          headers,
        })
      
        .then((response) => {
         
          setTotalRequestsSent(response.data.totalRequestSent);
          setTotalPendingRequests(response.data.totalPendingRequest);
          setTotalApprovedRequests(response.data.totalApprovedRequest);
          setTotalDisapprovedRequests(response.data.totalDisapprovedRequest);
          setLoading(false);
          
        })
        
        .catch((error) => {
          console.error("Error fetching total requests sent:", error);
          setLoading(false);
        });
    }
  }, [userId]);
  const fetchData = async () => {
    try {
      const token = localStorage.getItem("token");
      const userId = localStorage.getItem("id");
  
      if (!token || !userId) {
        console.error("Token or userId is missing");
        return;
      }
  
      const headers = {
        Authorization: `Bearer ${token}`,
      };
  
      const response = await axios.get(
        `http://122.53.61.91:6002/api/request-forms/for-approval/${userId}`,
        { headers }
      );
  
      const requests: Request[] = response.data.request_forms || []; // Use the defined type
  
      setRecords(requests);
      setTotalRequests(requests.length);
  
      let approvedCount = 0;
      let pendingCount = 0;
      let unsuccessfulCount = 0;
  
      requests.forEach((request: Request) => {
        const status = request.status.toLowerCase();      
        if (status.includes("approved")) {
          approvedCount++;
        } else if (status.includes("pending")) {
          pendingCount++;
        } else if (status.includes("rejected") || status.includes("disapproved")) {

          unsuccessfulCount++;
    
        }
      });
  
      setApprovedRequests(approvedCount);
      setPendingRequests(pendingCount);
      setUnsuccessfulRequests(unsuccessfulCount);
      processAreaChartData(requests);
      processBarChartData(requests);
  
    } catch (error) {
      console.error("Error fetching requests data:", error);
    }
  };
  
  

  const processAreaChartData = (requests: Request[]) => {
    const today = new Date();
    let startDate: Date;
    let endDate: Date;
  
    // Set startDate to January 1 of the current year
    startDate = new Date(today.getFullYear(), 0, 1); // January 1 of the current year
    
    // Set endDate to the last day of the current month
    endDate = endOfMonth(today);

  
    const aggregatedData: {
      [key: string]: {
        total: number;
        approved: number;
        pending: number;
        disapproved: number;
        rejected: number;
      };
    } = {};
  
    requests.forEach((record) => {
      const recordDate = new Date(record.created_at);
      if (recordDate >= startDate && recordDate <= endDate) {
        const monthName = format(recordDate, "MMM");
        if (!aggregatedData[monthName]) {
          aggregatedData[monthName] = {
            total: 0,
            approved: 0,
            pending: 0,
            disapproved: 0,
            rejected: 0,
          };
        }
        aggregatedData[monthName].total += 1;
        if (record.status === "Approved") {
          aggregatedData[monthName].approved += 1;
        } else if (record.status === "Pending") {
          aggregatedData[monthName].pending += 1;
        } else if (record.status.includes("Disapproved")) {
          aggregatedData[monthName].disapproved += 1;
        } else if (record.status.includes("Rejected")) {
          aggregatedData[monthName].rejected += 1;
        }
      }
    });
  
    const allMonths = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
  
    const areaChartData = allMonths.map((month) => ({
      name: month,
      Total: Math.floor(aggregatedData[month]?.total || 0),
      Approved: Math.floor(aggregatedData[month]?.approved || 0),
      Pending: Math.floor(aggregatedData[month]?.pending || 0),
      Disapproved: Math.floor(aggregatedData[month]?.disapproved || 0),
      Rejected: Math.floor(aggregatedData[month]?.rejected || 0),
    }));
  
    setAreaChartData(areaChartData);
  };
  
  

  const processBarChartData = (requests: Request[]) => {
    const today = new Date();
    const currentWeekStartDate = startOfWeek(today);

    const aggregatedData: { [key: string]: number } = {};

    requests.forEach((record) => {
      const recordDate = new Date(record.created_at);
      if (recordDate >= currentWeekStartDate) {
        const dayName = format(recordDate, "EEE");
        if (aggregatedData[dayName]) {
          aggregatedData[dayName] += 1;
        } else {
          aggregatedData[dayName] = 1;
        }
      }
    });

    const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const barChartData = weekDays.map((day) => ({
      name: day,
      Request: Math.floor(aggregatedData[day] || 0),
    }));

    setBarChartData(barChartData);
  
  };

  useEffect(() => {
    fetchData();
  }, []);
  
  return (
    <div className="bg-graybg dark:bg-blackbg h-full pt-[26px] px-[30px] pb-20">
      <div className="bg-primary w-full sm:w-full h-[210px] rounded-[12px] pl-[30px] flex flex-row justify-between items-center">
        <div>
          <p className="text-[15px] lg:text-[20px]">Hi, {firstName} 👋</p>
          <p className="text-[15px] lg:text-[20px] text-white font-semibold">
            Welcome to Request
          </p>
          <p className="text-[15px] hidden sm:block text-white mb-4">
            Request products and services
          </p>
          <div className="flex flex-row gap-2">
            <Link to="/request/sr">
              <button className="bg-[#FF947D] text-[15px] w-full lg:h-[57px] h-[40px] rounded-[12px] font-semibold px-3">
                Create a Request
              </button>
            </Link>
            <Link to="/request/approver">
              <button className="bg-[#FF947D] text-[15px] w-full lg:h-[57px] h-[40px] rounded-[12px] font-semibold px-3">
                Process Request
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
      <div className="flex gap-4 flex-col md:flex-row ">
        <div className="flex-7 pt-2 bg-white drop-shadow-lg w-full rounded-[12px] h-[327px] mt-4">
          <h1 className="text-center font-bold text-lg ">
            REQUESTS THIS MONTH
          </h1>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={areaChartData}
              margin={{ right: 30, left: 0, bottom: 30 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                domain={[0, "auto"]} 
                ticks={[20, 60, 90, 150]} 
                tickFormatter={(value) => Math.floor(value).toString()} 
              />
              <Tooltip />
              <Area
                type="monotone"
                dataKey="Total"
                stroke="#1E9AFF" // Blue for total requests
                fillOpacity={0.3}
                fill="#1E9AFF"
              />
              <Area
                type="monotone"
                dataKey="Approved"
                stroke="#5EB562" // Green for approved requests
                fillOpacity={0.3}
                fill="#5EB562"
              />
              <Area
                type="monotone"
                dataKey="Pending"
                stroke="#FEA01C" // Yellow for pending requests
                fillOpacity={0.3}
                fill="#FEA01C"
              />
              <Area
                type="monotone"
                dataKey="Disapproved"
                stroke="#E73774" // Red for unapproved requests
                fillOpacity={0.3}
                fill="#E73774"
              />
                <Area
                type="monotone"
                dataKey="Rejected"
                stroke="#Ff0000" // Red for unapproved requests
                fillOpacity={0.3}
                fill="#FF4122"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="flex-3 pb-10 pt-2 bg-white w-full drop-shadow-lg lg:w-2/4 rounded-[12px] h-[327px] mt-4">
          <h1 className="text-center font-bold text-lg">REQUEST THIS WEEK</h1>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              width={500}
              height={300}
              data={barChartData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis
                tickFormatter={(value) => Math.floor(value).toString()}
                allowDecimals={false}
                domain={[0, "auto"]} 
                ticks={[20, 60, 90, 150]} 
              />
              <Tooltip />
              <Bar dataKey="Request" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default ApproverDashboard;
