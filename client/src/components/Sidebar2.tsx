import React, { useEffect, useState } from "react";
import Logo from "./assets/logo.png";
import {
  ChartBarIcon,
  EnvelopeIcon,
  BeakerIcon,
  DocumentCheckIcon,
  DocumentPlusIcon,
  UserGroupIcon,
  BookOpenIcon,
  ArrowLeftStartOnRectangleIcon,
  UserIcon,
  BuildingOfficeIcon,
  UserPlusIcon,
} from "@heroicons/react/24/solid";
import { Link, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import Echo from "../utils/Echo";
import Swal from "sweetalert2";
import axios from "axios";
import { set } from "react-hook-form";

type NavItem = {
  title: string;
  icon: React.ElementType;
  path: string;
};

interface SidebarProps {
  darkMode: boolean;
  role: string;
  open: boolean;
  toggleSidebar: () => void;
}

const Sidebar2: React.FC<SidebarProps> = ({
  darkMode,
  role,
  open,
  toggleSidebar,
}) => {
  const navigate = useNavigate();
  const location = useLocation(); // Get current location
  const [notificationReceived, setnotificationReceived] = useState(false);
  const [pendingCounts, setPendingCounts] = useState(0);

  const navItems: NavItem[] =
    role === "approver"
      ? [
          {
            title: "Dashboard",
            icon: ChartBarIcon,
            path: "/dashboard/approver",
          },
          { title: "My Request", icon: EnvelopeIcon, path: "/request" },
          {
            title: "Create Request",
            icon: DocumentPlusIcon,
            path: "/request/sr",
          },
          {
            title: "Process Request",
            icon: DocumentCheckIcon,
            path: "/request/approver",
          },
          { title: "Help", icon: BookOpenIcon, path: "/help" },
        ]
      : role === "Admin"
      ? [
          { title: "Dashboard", icon: ChartBarIcon, path: "/dashboard" },
          { title: "User", icon: UserPlusIcon, path: "/setup/User" },
          { title: "Branch", icon: BuildingOfficeIcon, path: "/setup/Branch" },
          { title: "Approver", icon: UserIcon, path: "/setup/Approver" },
          { title: "AVP Staff", icon: UserGroupIcon, path: "/setup/AVP" },
          {
            title: "Area Manager",
            icon: BeakerIcon,
            path: "/setup/AreaManager",
          },
          { title: "Help", icon: BookOpenIcon, path: "/help" },
        ]
      : [
          { title: "Dashboard", icon: ChartBarIcon, path: "/dashboard" },
          { title: "My Request", icon: EnvelopeIcon, path: "/request" },
          {
            title: "Create Request",
            icon: DocumentPlusIcon,
            path: "/request/sr",
          },
          { title: "Help", icon: BookOpenIcon, path: "/help" },
        ];

  useEffect(() => {
    const handleResize = () => {
      // Your resize logic here
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const userId = localStorage.getItem("id");
    if (userId) {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Token is missing");
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const fetchRequests = async () => {
        try {
          const response = await axios.get(
            `http://122.53.61.91:6002/api/request-forms/for-approval/${userId}`,
            { headers }
          );
          const filtered = response.data.request_forms.filter(
            (request: any) => request.status === "Pending"
          );
          setPendingCounts(filtered.length);
        } catch (error) {
          console.error("Error fetching requests data:", error);
        } finally {
        }
      };

      fetchRequests();
    }
  }, [notificationReceived]);

  useEffect(() => {
    const id = localStorage.getItem("id");

    const channel = Echo.private(`pendingCount.${id}`).listen(
      "NotificationEvent",
      (e: any) => {
        setnotificationReceived(true);
      }
    );

    return () => {
      channel.stopListening(
        "NotificationEvent"
      );
    };
  }, []);

  useEffect(() => {
    if (notificationReceived) {
      setnotificationReceived(false);
    }
  }, [notificationReceived]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
    navigate("/login");
  };

  const listStyle =
    "relative mx-2 group flex items-center text-[18px] text-gray-400 font-medium py-2 pr-3 px-2 cursor-pointer rounded-lg";
  const pStyle = "group-hover:text-primary font text-lg px-2 rounded-lg";
  const iconStyle = "size-[32px] group-hover:text-primary";
  const activeClass = "bg-[#D2E6F7] text-primary"; // Change to your preferred active color
  return (
    <div className={`${darkMode ? "dark" : "light"} dark:bg-blackD h-full`}>
      <div
        className={`bg-white dark:bg-blackD ${open ? "w-60" : "w-20"} h-full`}
      >
        <div className="px-2 py-3 h-[68px] flex justify-between items-center border-b-[0.5px] border-gray">
          <img
            src={Logo}
            height={34}
            width={75}
            className="cursor-pointer"
            onClick={toggleSidebar}
          />
          <h1
            className={`text-primary font-bold mr-7 ${
              open ? "visible" : "invisible"
            }`}
          >
            Request Form
          </h1>
        </div>
        <ul className="mt-6 flex-1 w-full">
          <div className="gap-2 w-full">
            {navItems.map((item) => (
              <Link to={item.path} key={item.title}>
                <li
                  className={`${listStyle} ${
                    location.pathname === item.path ? activeClass : ""
                  } ${!open ? "justify-center" : "hover:bg-[#E7F1F9]"}`}
                >
                  <div
                    className={`p-2 ${
                      !open ? "hover:bg-[#D2E6F7] rounded-lg relative" : ""
                    }`}
                  >
                    <item.icon className={iconStyle} />

                    {pendingCounts > 0 && item.title === "Process Request" ? (
                      <span className="absolute top-0 right-0 bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                        {pendingCounts}
                      </span>
                    ) : (
                      ""
                    )}
                  </div>
                  {open ? (
                    <div className={`flex-1 ${!open ? "hidden" : "block"}`}>
                      <p className={`${pStyle} truncate p-1`}>{item.title}</p>
                    </div>
                  ) : (
                    <div className={`relative group`}>
                      <p
                        className={`${pStyle} truncate p-1 absolute left-full ml-5 top-1/2 transform -translate-y-1/2 bg-[#D2E6F7] rounded-lg ${
                          open
                            ? "hidden"
                            : "opacity-0 invisible group-hover:opacity-100 group-hover:visible"
                        } transition-opacity`}
                      >
                        {item.title}
                      </p>
                    </div>
                  )}
                </li>
              </Link>
            ))}
            <div
              onClick={handleLogout}
              className="border-t flex justify-center items-center cursor-pointer"
            >
              <div className="flex h-5/6 p-2">
                <ArrowLeftStartOnRectangleIcon
                  className={`${iconStyle} dark:text-white`}
                />
              </div>
              <p
                className={`${pStyle} ${!open ? "hidden" : ""} dark:text-white`}
              >
                Logout
              </p>
            </div>
          </div>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar2;
