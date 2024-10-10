import React, { useState, useEffect } from "react";
import Nav from "./components/Nav";
import axios from "axios";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Outlet } from "react-router-dom";
import Sidebar2 from "./components/Sidebar2";
import { useUser } from "./context/UserContext";
import "./index.css";
import Preloader from "./loader/PreLoader";

interface AppProps {
  isdarkMode: boolean;
}

function capitalizeFirstLetter(string: string) {
  const index = string.indexOf("/");
  if (index !== -1) {
    string = string.substring(0, index);
  }
  string = string.replace(/_/g, " ");
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const App: React.FC<AppProps> = ({ isdarkMode }) => {
  const [darkMode, setDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const currentPage = capitalizeFirstLetter(location.pathname.substring(1));
  const [isSidebarVisible, setIsSidebarVisible] = useState(
    window.innerWidth > 768
  );
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const { loading, setLoading } = useUser();
  const [userRole, setUserRole] = useState("");
  const id = localStorage.getItem("id");
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    // Update sidebar visibility based on window width
    if (windowWidth > 768) {
      setIsSidebarVisible(true);
    } else {
      setIsSidebarVisible(false);
    }

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [windowWidth]);

  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/profile`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (response.status === 200) {
          setUserRole(response.data.data.role);
        }
      } catch (error: any) {
        if(error.response.status === 401){
          navigate('/login');
          setLoading(false);
        }
        console.error("Error fetching branch data:", error);
      }
    };

    fetchBranchData();
  }, [id]);

  // Disable right-click across the entire app
  useEffect(() => {
    const handleRightClick = (event: MouseEvent) => {
      event.preventDefault();
    };

    // Attach the event listener to the document
    document.addEventListener("contextmenu", handleRightClick);

    // Clean up the event listener on component unmount
    return () => {
      document.removeEventListener("contextmenu", handleRightClick);
    };
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prevDarkMode) => !prevDarkMode);
  };

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const [userInfoUpdated, setUserInfoUpdated] = useState(false);
  const updateUserInfo = () => {
    setUserInfoUpdated(!userInfoUpdated); // Toggle state to trigger Nav to update user info
  };

  const isMobileView = windowWidth < 768;

  const marginClass = isMobileView ? "ml-0" : isSidebarOpen ? "ml-20" : "ml-0";

  if (loading) {
    return <Preloader />;
  }

  return (
    <div
      className={`flex ${darkMode ? "dark" : "white"} relative w-full h-screen`}
    >
      <div
        className={`h-full fixed ${
          isSidebarOpen ? "block" : "hidden"
        } md:block z-30 text-black`}
      >
        <Sidebar2
          darkMode={darkMode}
          role={userRole}
          open={isSidebarOpen}
          toggleSidebar={toggleSidebar}
        />
      </div>
      <div
        className={`flex-1 flex-col w-full transition-all duration-300 ${
          isMobileView ? marginClass : isSidebarOpen ? "ml-60" : "ml-20"
        }`}
      >
        <Nav
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
          toggleSidebar={toggleSidebar}
          currentPage={currentPage}
          isSidebarVisible={isSidebarVisible}
          isSidebarOpen={isSidebarOpen}
          updateUserInfo={updateUserInfo}
        />
        <div
          className={`bg-${
            darkMode ? "black" : "gray"
          } flex-1 w-full text-black`}
        >
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default App;
