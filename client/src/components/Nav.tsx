import React, { useState, useEffect, useRef } from "react";
import {
  MoonIcon,
  SunIcon,
  ChevronDownIcon,
  BellIcon,
  ChevronUpIcon,
  EnvelopeIcon,
  Bars3Icon,
  EnvelopeOpenIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import Avatar from "./assets/avatar.png";
import { Link, useNavigate } from "react-router-dom";
import { useUser } from "../context/UserContext";
import axios from "axios";
import { format } from "date-fns";
import { useSpring, animated } from "@react-spring/web"; // Import useSpring and animated from @react-spring/web
import Pusher from "pusher-js";
import { set } from "react-hook-form";
import Swal from "sweetalert2";

interface NavProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  toggleSidebar: () => void;
  currentPage: string;
  isSidebarVisible: boolean;
  isSidebarOpen: boolean;
  updateUserInfo: () => void; // Function to update user info
}

const Nav: React.FC<NavProps> = ({
  darkMode,
  toggleDarkMode,
  currentPage,
  toggleSidebar,
  isSidebarVisible,
  isSidebarOpen,
  updateUserInfo,
}) => {
  const flexBetween = "flex items-center justify-between";
  const listProfile = "px-4 hover:bg-[#E0E0F9] cursor-pointer py-2";
  const listNotification =
    "px-4 hover:bg-[#E0E0F9] cursor-pointer py-4 border-b flex items-center justify-around";
  const divNotification =
    "size-8 flex items-center justify-center bg-black rounded-full";
  const iconNotifcation = "size-5 text-white cursor-pointer";
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenNotif, setIsOpenNotif] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { updateUser } = useUser();
  const userId = localStorage.getItem("userId");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [userInfo, setUserInfo] = useState(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [profilePicture, setProfilePicture] = useState("");
  const [sidebar, setSidebar] = useState(false);
  const [UserID, setUserId] = useState("");
  const [unreadCount, setUnreadCount] = useState(0); // State to keep track of unread notifications
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      const expiresAt = localStorage.getItem("expires_at");

      if (!token || !expiresAt) {
        // Token or expiration time is missing, clear data and redirect to login
        localStorage.removeItem("token");
        localStorage.removeItem("expires_at");
        navigate("/login"); // Redirect to login page
        return;
      }

      // Check if the token has expired
      const expirationDate = new Date(expiresAt);
      if (new Date() > expirationDate) {
        alert("Your token has expired. Please log in again.");

        localStorage.removeItem("token");
        localStorage.removeItem("expires_at");
        navigate("/login"); // Redirect to login page
      }
    };

    checkAuth();
  }, [navigate]);
  const handleClose = () => {
    setIsOpen(false);
  };

  const toggleProfileDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsOpen(false);
      setIsOpenNotif(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    const unreadNotifications = notifications.filter((notif) => !notif.read_at);

    if (unreadNotifications.length === 0) {
      Swal.fire({
        html: `
        <div style="text-align: center; margin-bottom: 15px;">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 text-gray-500 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l9 6 9-6V4a2 2 0 00-2-2H5a2 2 0 00-2 2v4z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8v10a2 2 0 002 2h14a2 2 0 002-2V8l-9 6-9-6z" />
          </svg>
          <br/>
          <p>No unread notifications to mark as read.</p>
        </div>
      `,
      confirmButtonColor: "#007bff",
      confirmButtonText: "Close",
      });
      return; // Exit early if there are no unread notifications
    }

    try {
      const id = localStorage.getItem("id");
      const response = await axios.put(
        `http://122.53.61.91:6002/api/notifications/mark-all-as-read/${id}`
      );

      if (response.data.success) {
        // Update all notifications as read in local state
        setNotifications((prevNotifications) =>
          prevNotifications.map((notif) => ({
            ...notif,
            read_at: new Date().toISOString(),
          }))
        );

        // Update unread count to 0
        setUnreadCount(0);

        Swal.fire({
          icon: 'success',
          title: 'Success!',
          text: 'All notifications marked as read.',
          confirmButtonColor: "#007bff",
          confirmButtonText: "Close",
        });
      } else {
        console.error("Failed to mark all notifications as read");
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      alert(
        "Failed to mark all notifications as read. Please try again later."
      );
    }
  };

  useEffect(() => {
    const fetchUserInfoFromDatabase = async () => {
      const id = localStorage.getItem("id");
      if (!id) {
        console.error("No user ID found in localStorage.");
        return;
      }
      try {
        const response = await axios.get(
          `http://122.53.61.91:6002/api/view-user/${id}`
        );

        if (response.data && response.data.data) {
          setUserInfo(response.data);
          setLastName(response.data.data.lastName);
          setFirstName(response.data.data.firstName);
          setUserId(response.data.data.id);
          setProfilePicture(response.data.data.profile_picture);
          setRole(response.data.data.role);
        } else {
          console.error("Unexpected response structure:", response.data);
        }
      } catch (error) {
        console.error(
          "Error fetching user information from the database: ",
          error
        );
      }
    };

    fetchUserInfoFromDatabase();
  }, [updateUserInfo]);

  useEffect(() => {
    const id = localStorage.getItem("id");

    // Fetch initial notifications
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          `http://122.53.61.91:6002/api/notifications/${id}/all`
        );
        const notificationsData = response.data.unread_notification;
        setNotifications(notificationsData);

        // Count unread notifications
        const unreadNotifications = notificationsData.filter(
          (notif: any) => !notif.read_at
        ).length;
        setUnreadCount(unreadNotifications);
      } catch (error) {
        console.error("Error fetching notifications: ", error);
      }
    };

    // Fetch initial notifications on mount
    fetchNotifications();

    // Enable Pusher logging for debugging
    Pusher.logToConsole = true;

    // Initialize Pusher instance
    const pusher = new Pusher("dd9d4765fc958213199b", {
      cluster: "ap1",
    });

    // Subscribe to the user's notification channel
    const channel = pusher.subscribe(`notification${id}`);

    // Listen for notification-event
    channel.bind("notification-event", (newNotification: any) => {
      // Destructure the required properties from newNotification
      const { message, user_id, date, type, read_at } = newNotification;

      // Update the notifications state with the new notification
      setNotifications((prevNotifications) => [
        {
          notification_id: `notif-${Date.now()}`, // Generate a unique ID
          read_at,
          type,
          data: {
            message,
            user_id,
            created_at: date,
          },
        },
        ...prevNotifications,
      ]);
      // Increment unread count if it's unread
      if (!newNotification.read_at) {
        setUnreadCount((prevCount) => prevCount + 1);
      }
    });

    // Cleanup function to unsubscribe from Pusher when component unmounts
    return () => {
      channel.unbind("notification-event"); // Unbind the specific event listener
      pusher.unsubscribe(`notification${id}`); // Unsubscribe from the channel
    };
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const isMobileView = windowWidth < 768;

  // Format the notification date
  const formatDate = (dateString: string) => {
    return format(new Date(dateString.replace(" ", "T")), "MMM d, yyyy h:mm a");
  };

  // Animation for the unread notification count
  const springProps = useSpring({
    opacity: unreadCount > 0 ? 1 : 0,
    transform: unreadCount > 0 ? "scale(1)" : "scale(0)",
    config: { tension: 250, friction: 15 },
  });

  const profilePictureUrl = profilePicture
    ? `http://122.53.61.91:6002/storage/${profilePicture.replace(/\\/g, "/")}`
    : Avatar;

  return (
    <div className={`nav-container ${darkMode ? "dark" : "white"}`}>
      {/* Toggle light and dark mode */}
      <nav className={`${flexBetween} bg-white dark:bg-blackD`}>
        <div className={`h-[67px] flex items-center bg-white dark:bg-blackD`}>
          {isMobileView ? (
            <div onClick={toggleSidebar}>
              {isSidebarOpen ? (
                <XMarkIcon
                  title="Close Menu"
                  className={`size-[36px] font-bold cursor-pointer pl-4 ml-60 ${
                    darkMode ? "dark:text-white" : "text-black"
                  }`}
                />
              ) : (
                <Bars3Icon
                  className={`size-[36px] font-bold cursor-pointer pl-4 ${
                    darkMode ? "dark:text-white" : "text-black"
                  }`}
                />
              )}
            </div>
          ) : (
            <div onClick={toggleSidebar}>
              {isSidebarOpen ? (
                <XMarkIcon
                  title="Close Menu"
                  className={`size-[36px] font-bold cursor-pointer pl-4 ${
                    darkMode ? "dark:text-white" : "text-black"
                  }`}
                />
              ) : (
                <Bars3Icon
                  className={`size-[36px] font-bold cursor-pointer pl-4 ${
                    darkMode ? "dark:text-white" : "text-black"
                  }`}
                />
              )}
            </div>
          )}

          <h1
            className={`lg:text-[32px] md:text-[28px] sm:text-[20px] font-bold text-primary ${
              darkMode ? "dark:text-white" : ""
            } pl-4`}
          >
            {currentPage}
          </h1>
        </div>

        <div className="flex items-center justify-between pr-12">
          <div className="pr-2 sm:pr-8">
            {darkMode ? (
              <SunIcon
                className="size-[27px] text-white cursor-pointer"
                onClick={toggleDarkMode}
              />
            ) : (
              <MoonIcon
                className="size-[27px] text-black cursor-pointer"
                onClick={toggleDarkMode}
              />
            )}
          </div>
          <div className={`${flexBetween} gap-2 relative`}>
            <img
              alt="logo"
              className="cursor-pointer hidden sm:block rounded-full"
              src={profilePictureUrl}
              height={45}
              width={45}
              onClick={toggleProfileDropdown}
            />
            {/* USER NAME */}
            <p
              className="pl-2 lg:text-[18px] text-[12px] dark:text-white cursor-pointer"
              onClick={toggleProfileDropdown}
            >
              {firstName} {lastName}
            </p>
            {!isOpen ? (
              <ChevronDownIcon
                className="size-[25px] text-black dark:text-white cursor-pointer"
                onClick={toggleProfileDropdown}
              />
            ) : (
              <ChevronUpIcon
                className="size-[25px] text-black dark:text-white cursor-pointer"
                onClick={toggleProfileDropdown}
              />
            )}
            {/* Profile dropdown */}
            {isOpen && (
              <div
                ref={dropdownRef}
                className="w-full border-x-2 border-b-2 bg-white absolute top-11 overflow-x-hidden z-50"
                style={{ zIndex: 1000 }}
              >
                <ul>
                  <Link to="/profile" onClick={handleClose}>
                    <li className={`${listProfile}`}>My Profile</li>
                  </Link>
                  <Link to="/help" onClick={handleClose}>
                    <li className={`${listProfile}`}>Help</li>
                  </Link>
                </ul>
              </div>
            )}
          </div>
          <div className="pl-4 sm:pl-10 relative">
            <div className="relative">
              <BellIcon
                className={`size-[30px] cursor-pointer ${
                  isOpenNotif ? "text-yellow" : "text-gray-400"
                }`}
                onClick={() => {
                  setIsOpenNotif(!isOpenNotif);
                  // handleOpenNotification();
                }}
              />
              {/* Notification Count */}
              {unreadCount > 0 && (
                <animated.div
                  style={{
                    ...springProps,
                    position: "absolute",
                    top: -10,
                    right: -10,
                    background: "red",
                    color: "white",
                    borderRadius: "50%",
                    width: 20,
                    height: 20,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 12,
                    fontWeight: "bold",
                  }}
                >
                  {unreadCount}
                </animated.div>
              )}
            </div>
            {/* Notification */}
            {isOpenNotif && (
              <div className="flex flex-row">
                <div
                  className="w-96 md:w-[500px] bg-white absolute top-11 right-0 border-2 border-black z-40 overflow-y-auto max-h-[500px] rounded-lg shadow-lg flex flex-col"
                  ref={dropdownRef}
                >
                  <ul className="flex-1 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <li className="px-4 py-4 text-center text-gray-500">
                        No notifications yet
                      </li>
                    ) : (
                      notifications.map((notif) => {
                        const message =
                          notif.data?.message || "No message available";
                        const createdAt =
                          notif.data?.created_at || new Date().toISOString();
                        const notificationId =
                          notif.notification_id || "unknown-id";

                        const linkTo =
                          notif.type ===
                            "App\\Notifications\\ApprovalProcessNotification" ||
                          notif.type ===
                            "App\\Notifications\\PreviousReturnRequestNotification"
                            ? "/request/approver"
                            : notif.type ===
                                "App\\Notifications\\EmployeeNotification" ||
                              notif.type ===
                                "App\\Notifications\\ReturnRequestNotification"
                            ? "/request"
                            : "/profile";

                        const textColor =
                          notif.type ===
                          "App\\Notifications\\EmployeeNotification"
                            ? "text-green"
                            : notif.type ===
                                "App\\Notifications\\PreviousReturnRequestNotification" ||
                              notif.type ===
                                "App\\Notifications\\ReturnRequestNotification"
                            ? "text-red-500"
                            : "text-primary";

                        return (
                          <Link to={linkTo} key={notificationId}>
                            <li
                              className={`px-4 py-4 hover:bg-[#E0E0F9] cursor-pointer border-b flex items-center`}
                              onClick={() => setIsOpenNotif(false)}
                              aria-label={`Notification: ${message}`}
                            >
                              <div className="w-12 h-12 flex items-center justify-center bg-black rounded-full">
                                {notif.read_at ? (
                                  <EnvelopeOpenIcon className="size-5 text-white" />
                                ) : (
                                  <EnvelopeIcon className="size-5 text-white" />
                                )}
                              </div>
                              <div className="ml-4 flex-1">
                                <p
                                  className={`${textColor} text-sm ${
                                    notif.read_at ? "" : "font-bold"
                                  } text-center`}
                                >
                                  {message}
                                </p>
                                <p className="text-gray-400 text-sm text-center">
                                  {formatDate(createdAt)}
                                </p>
                              </div>
                            </li>
                          </Link>
                        );
                      })
                    )}
                  </ul>
                  <hr />
                  {notifications.length > 0 && ( // Conditionally render this section
      <div
        className="py-5 text-center text-gray-500 cursor-pointer"
        onClick={handleMarkAllAsRead}
      >
        Mark All As Read
      </div>
    )}
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Nav;
