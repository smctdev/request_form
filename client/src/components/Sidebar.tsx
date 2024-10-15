import React, { useState, useEffect } from "react";
import Logo from "./assets/logo.png";
import {
  ChartBarIcon,
  EnvelopeIcon,
  BeakerIcon,
  ArrowLeftStartOnRectangleIcon,
  ArrowLeftCircleIcon,
  BookOpenIcon,
  DocumentCheckIcon,
  DocumentPlusIcon,
  UserGroupIcon,
} from "@heroicons/react/24/solid";
import { Link } from "react-router-dom";

type NavItem = {
  title: string;
  submenu: boolean;
  icon: React.ElementType;
  path: string;
};

interface SidebarProps {
  darkMode: boolean;
  role: string;
  isSidebarVisible: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ darkMode, role }) => {
  const [open, setOpen] = useState(false);

  const navItems: NavItem[] =
    role === "approver"
      ? [
          {
            title: "Dashboard",
            submenu: false,
            icon: ChartBarIcon,
            path: "/dashboard/approver",
          },
          {
            title: "View Requestss",
            submenu: false,
            icon: EnvelopeIcon,
            path: "/request",
          },
          {
            title: "Create Request",
            submenu: false,
            icon: DocumentPlusIcon,
            path: "/request/sr",
          },
          {
            title: "Approve Request",
            submenu: false,
            icon: DocumentCheckIcon,
            path: "/request/approver",
          },
          {
            title: "Custom Request",
            submenu: false,
            icon: UserGroupIcon,
            path: "/request/custom",
          },
        ]
      : role === "Admin"
      ? [
          {
            title: "Dashboard",
            submenu: false,
            icon: ChartBarIcon,
            path: "/dashboard",
          },
          {
            title: "View Request",
            submenu: false,
            icon: EnvelopeIcon,
            path: "/request",
          },
          {
            title: "Create Request",
            submenu: false,
            icon: EnvelopeIcon,
            path: "/request/sr",
          },
          {
            title: "Custom Request",
            submenu: false,
            icon: EnvelopeIcon,
            path: "/request/custom",
          },
          {
            title: "User",
            submenu: false,
            icon: BeakerIcon,
            path: "/setup/User",
          },
          {
            title: "Branch",
            submenu: false,
            icon: BeakerIcon,
            path: "/setup/Branch",
          },
          {
            title: "Approver",
            submenu: false,
            icon: BeakerIcon,
            path: "/setup/Approver",
          },
          {
            title: "Area Manager",
            submenu: false,
            icon: BeakerIcon,
            path: "/setup/AreaManager",
          },
          {
            title: "Help",
            submenu: false,
            icon: BookOpenIcon,
            path: "/help",
          },
        ]
      : [
          {
            title: "Dashboard",
            submenu: false,
            icon: ChartBarIcon,
            path: "/dashboard",
          },
          {
            title: "View Request",
            submenu: false,
            icon: EnvelopeIcon,
            path: "/request",
          },
          {
            title: "Create Request",
            submenu: false,
            icon: EnvelopeIcon,
            path: "/request/sr",
          },
          {
            title: "Custom Request",
            submenu: false,
            icon: EnvelopeIcon,
            path: "/request/custom",
          },
          {
            title: "Help",
            submenu: false,
            icon: BookOpenIcon,
            path: "/help",
          },
        ];

  useEffect(() => {
    const handleResize = () => {};

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const listStyle =
    "group flex ml-1 items-center text-[18px] text-gray-400 font-medium py-2 pr-2 px-2  gap-2  overflow-hidden cursor-pointer  rounded-lg";
  const pStyle = "group-hover:text-primary  font text-lg";
  const iconStyle = "size-[26px] group-hover:text-primary ";
  return (
    <div className={`${darkMode ? "dark" : "light"} dark:bg-blackD h-full`}>
      <div
        className={`bg-white dark:bg-blackD w-60
        } h-full`}
      >
        <div className="px-2 py-3 h-[68px] flex justify-between items-center border-b-[0.5px] border-gray">
          <img
            src={Logo}
            height={34}
            width={75}
            className="cursor-pointer"
            onClick={() => setOpen(!open)}
          />
          <h1
            className={`text-primary font-bold  mr-7 ${
              !open && "scale-0"
            } duration-500`}
          >
            Request Form
          </h1>
          <ArrowLeftCircleIcon
            className={`size-[34px] text-black dark:text-white -right-2 ml-2 absolute cursor-pointer ${
              !open && "hidden"
            }`}
            onClick={() => setOpen(false)}
          />
        </div>
        <div className="flex flex-col   space-y-2">
          <ul className="mt-[65px] flex-1 ">
            <p className="text-[12px] text-gray-400 px-3 w-fit">MENU</p>
            <div className="space-y-5">
              {navItems.map((item: NavItem) => (
                <Link to={item.path} key={item.title}>
                  <li
                    className={`${listStyle} ${
                      !open ? "" : "hover:bg-[#E0E0F9]"
                    }`}
                  >
                    <div
                      className={`p-2
                         ${!open ? "hover:bg-[#E0E0F9] rounded-lg" : ""}`}
                    >
                      <item.icon className={iconStyle} />
                    </div>
                    <p className={`${pStyle}`}>{item.title}</p>
                  </li>
                </Link>
              ))}
            </div>
          </ul>

          <Link to="/login">
            <div className="border-t flex justify-center items-center ">
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
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;