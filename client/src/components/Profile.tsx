import React, { useState, useEffect, useRef } from "react";
import Avatar2 from "./assets/avatar.png";
import { Link } from "react-router-dom";
import axios from "axios";
import SquareLoader from "react-spinners/SquareLoader";
import ClipLoader from "react-spinners/ClipLoader";
import {
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/solid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";
import PropogateLoader from "react-spinners/PropagateLoader";
import { set } from "react-hook-form";
import SignatureCanvas from "react-signature-canvas";
import { useNavigate } from "react-router-dom";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  branch_code: string;
  contact: string;
  signature: string;
  userName: string;
  profile_picture: string;
  position: string;
  branch: string;
}

const Profile = ({ isdarkMode }: { isdarkMode: boolean }) => {
  const signatureRef = useRef<SignatureCanvas>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem("token");
  const id = localStorage.getItem("id");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [successModal, setSuccessModal] = useState(false);
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [newProfilePic, setNewProfilePic] = useState<File | null>(null);
  const [branchList, setBranchList] = useState<{ id: number; branch_code: string }[]>([]);
  const [selectedBranchCode, setSelectedBranchCode] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState("");
  const [submitting, setSubmitting]= useState(false);
  const [showSuccessModal, setShowSuccessModal]= useState(false);
  const [showSignatureSuccess, setShowSignatureSuccess] = useState(false);
  const [signatureEmpty, setSignatureEmpty] = useState(false);
  const [signature, setSignature] = useState<SignatureCanvas | null>(null);
  const [signatureButton, setSignatureButton] = useState(false);
  const [shouldRefresh, setShouldRefresh] = useState(false);

  const navigate = useNavigate();


  useEffect(() => {
    const fetchBranchData = async () => {
      try {
        if (!token) {
          console.error("Token is missing");
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const response = await axios.get(`http://122.53.61.91:6002/api/view-branch`, { headers });
        const branches = response.data.data;
        const branchOptions = branches.map((branch: { id: number; branch_code: string }) => ({
          id: branch.id,
          branch_code: branch.branch_code,
        }));
        setBranchList(branchOptions);
      } catch (error) {
        console.error("Error fetching branch data:", error);
      }
    };

    fetchBranchData();
  }, [token]);
  
  useEffect(() => {
    if (signature) {
      signature.toDataURL("image/png");
      
    }
  }, [signature]);
 
 
  useEffect(() => {
    const fetchUserInformation = async () => {
      try {
        if (!token || !branchList.length) {
          return; // Ensure branch list is available before fetching user data
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };
        const response = await axios.get(`http://122.53.61.91:6002/api/view-user/${id}`, { headers });

        if (response.data.status) {
          const userData = response.data.data;
          setUser(userData);

          const branch = branchList.find(b => b.id === Number(userData.branch_code));
          if (branch) {
            setSelectedBranchCode(branch.branch_code);
          }
        } else {
          throw new Error(response.data.message || "Failed to fetch user information");
        }
      } catch (error: any) {
        setError(error.response?.data?.message || "An error occurred while fetching user information");
      }
    };

    fetchUserInformation();
  }, [token, id, branchList]);

  
  const handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    signature?.clear();
  };
  const handleChangePassword = async () => {
    setErrorMessage("");
    if (!token || !id) {
      console.error("User not authenticated. Please log in.");
      return;
    }
    try {
      setLoading(true);
      if (newPassword !== confirmNewPassword) {
        console.error("The new password fields confirmation does not match.");
        return;
      }

      const response = await axios.put(
        `http://122.53.61.91:6002/api/change-password/${id}`,
        {
          current_password: currentPassword,
          new_password: newPassword,
          new_password_confirmation: confirmNewPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSuccessModal(true);
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      console.error(
        "Failed to change password:",
        error.response?.data?.message || error.message
      );
      setErrorMessage(error.response?.data?.message || error.message);
    }
  };

  const closeSuccessModal = () => {
    setShowSuccessModal(false);
    setSignatureButton(false);
    setShouldRefresh(true); // Set to true to trigger data refetch
    navigate("/profile");
  };
  const closeSignatureSuccess = () => {
    setSignatureButton(false);
    navigate("/profile");
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!user) {
    return (
      <div className="flex bg-white justify-center items-center h-full">
        <SquareLoader color="#ADD8E6" />
      </div>
    );
  }

  if (error === "User not authenticated") {
    return <div>User not authenticated. Please log in.</div>;
  }

  const saveInfo = async () => {
    if (!newProfilePic) {
      console.error("No profile picture selected.");
      return;
    }

    const formData = new FormData();
    formData.append("profile_picture", newProfilePic);

    try {
      setLoading(true);
      const response = await axios.post(
        `http://122.53.61.91:6002/api/upload-profile-pic/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status) {
        setUser((prevUser) =>
          prevUser
            ? { ...prevUser, signature: response.data.data.signature }
            : null
        );
      } else {
        throw new Error(
          response.data.message || "Failed to upload profile picture"
        );
      }
    } catch (error: any) {
      console.error(
        "Failed to upload profile picture:",
        error.response?.data?.message || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleImageClick = () => {
    inputRef.current?.click();
  };


  const profilePictureUrl = newProfilePic
    ? URL.createObjectURL(newProfilePic) // Create a temporary URL for the new profile picture
    : user?.profile_picture
    ? `http://122.53.61.91:6002/storage/${user.profile_picture.replace(
        /\\/g,
        "/"
      )}`
    : Avatar2;
    const onSubmit = async () => {
      try {
        setSubmitting(true);
    
        const token = localStorage.getItem("token");
        const id = localStorage.getItem("id");
    
        if (!token || !id) {
          console.error("Token or ID is missing");
          setSubmitting(false);
          return;
        }
    
        const formData = new FormData();
    
        // Ensure profile picture is a File object before appending
        if (newProfilePic) {
          formData.append("profile_picture", newProfilePic);
        } else {
          console.error("Profile picture is missing");
          setSubmitting(false);
          return;
        }
    
        
     
        const response = await axios.post(
          `http://122.53.61.91:6002/api/update-profilepic/${id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
    
       
        setSubmitting(false);
        setShowSuccessModal(true);
      } catch (error: any) {
        console.error(
          "Failed to update profile picture:",
          error.response?.data || error.message
        );
        setSubmitting(false);
        setShowSuccessModal(true);
      }
    };
     const saveSignature = () => {
    if (signatureRef.current) {
      const signatureImage = signatureRef.current.toDataURL();
      // You can save signatureImage or set it to a form field for submission
    
    }
  };
  const signatureIsEmpty = () => {
    if (signature && signature.isEmpty && signature.isEmpty()) {
      setSignatureEmpty(true);
      return true;
    }
    return false;
  };
 

  const handleSaveSignature = async () => {
    if (signatureRef.current) {
      setSignatureButton(true);
      // Convert the signature to a data URL
      const signatureDataURL = signatureRef.current.toDataURL();
   

      try {
        // Send the data URL to the backend API
        const response = await axios.post(
          `http://122.53.61.91:6002/api/update-signature/${id}`, // Ensure the URL is correct
          { signature: signatureDataURL },
          {
            headers: {
              Authorization: `Bearer ${token}`, // Ensure token is valid
              "Content-Type": "application/json",
            },
          }
        );
        setSignatureButton(false);
       
      } catch (error) {
        setSignatureButton(false);
        console.error("Error saving signature:", error); // Log any errors
      }
    } else {
      setSignatureButton(false);
      console.error("Signature reference is not set."); // Log if signatureRef.current is null
    }
  };

  const handleProfilePicUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setNewProfilePic(file); // Store the selected file in state
 
  };
    
  return (
    <div className="bg-graybg dark:bg-blackbg w-full h-full py-4 px-4 md:px-10 lg:px-30 ">
      <div className="bg-white rounded-[12px] flex flex-col w-full px-4 md:px-8 lg:px-10 xl:px-12 py-[50px]">
        <div className="rounded-[12px] flex flex-col lg:flex-row items-center justify-center">
          <div className="flex flex-col items-start text-left px-4 md:px-10 w-full">
            <div className="flex flex-col lg:flex-row items-center md:items-start">
              <img
                alt="profile"
                height={180}
                width={180}
                src={profilePictureUrl}
          
              />
              <div className="flex flex-col ml-2 mt-4">
                <h1 className="font-bold text-lg md:text-xl lg:text-2xl">
                  {user.firstName} {user.lastName}
                </h1>
                <div onClick={handleImageClick}>
                  <p className="text-primary cursor-pointer">
                    Upload new picture
                  </p>
                  <input
                    type="file"
                    ref={inputRef}
                    className="hidden"
                    onChange={handleProfilePicUpload}
                  />
                </div>
                <p className="text-black italic font-semibold">{user.position}</p>
              </div>
            </div>
            <h1 className="font-semibold text-lg md:text-xl lg:text-2xl my-5">
              User Information
            </h1>
            <div className="grid grid-cols-1 gap-4 lg:gap-6 w-full">
              <div className="flex flex-col">
                <p className="text-gray-400">Email</p>
                <p className="font-medium border p-2 rounded-md">{user.email}</p>
              </div>
              <div className="flex flex-col">
                <p className="text-gray-400">Branch</p>
                <p className="font-medium border p-2 rounded-md">{selectedBranchCode}</p>
              </div>
              <div className="flex flex-col">
                <p className="text-gray-400">Contact</p>
                <p className="font-medium border p-2 rounded-md">{user.contact}</p>
              </div>
              <div className="flex flex-col">
                <p className="text-gray-400">Username</p>
                <p className="font-medium border p-2 rounded-md">{user.userName}</p>
              </div>
              <div className="flex flex-col">
                <p className="text-gray-400">Branch</p>
                <p className="font-medium border p-2 rounded-md">{user.branch}</p>
              </div>
            </div>
           
            {newProfilePic && ( 
             <div className="bg-black text-white w-full h-[48px] rounded-[12px] mt-4 flex items-center justify-center"> 
        
              <button className="text-white" onClick={onSubmit}>Upload Profile Picture</button>
              </div>
              )}
          </div>

          <div className="mt-4 md:mt-0 w-full md:px-10 ">
            <h1 className="font-semibold text-lg md:text-xl lg:text-2xl my-5">
              Change Password
            </h1>
            <p className="mt-2 text-gray-400">Enter your current password</p>
            <div className="flex justify-center items-center relative w-full">
              <input
                type={showCurrent ? "text" : "password"}
                className="w-full h-10 p-2 bg-gray-300 rounded-lg"
                onChange={(e) => setCurrentPassword(e.target.value)}
                value={currentPassword}
              />
              {showCurrent ? (
                <EyeSlashIcon
                  className="size-[24px] absolute right-3 cursor-pointer"
                  onClick={() => setShowCurrent(!showCurrent)}
                />
              ) : (
                <EyeIcon
                  className="size-[24px] absolute right-3 cursor-pointer"
                  onClick={() => setShowCurrent(!showCurrent)}
                />
              )}
            </div>
            <p className="mt-2 text-gray-400">Enter your new password</p>
            <div className="flex justify-center items-center relative w-full">
              <input
                type={showPassword ? "text" : "password"}
                className="w-full h-10 p-2 bg-gray-300 rounded-lg"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              {showPassword ? (
                <EyeSlashIcon
                  className="size-[24px] absolute right-3 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                />
              ) : (
                <EyeIcon
                  className="size-[24px] absolute right-3 cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                />
              )}
            </div>
            <p className="mt-2 text-gray-400">Confirm password</p>
            <div className="flex justify-center items-center relative w-full">
              <input
                type={showConfirmPassword ? "text" : "password"}
                className="w-full h-10 p-2 bg-gray-300 rounded-lg"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
              {showConfirmPassword ? (
                <EyeSlashIcon
                  className="size-[24px] absolute right-3 cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              ) : (
                <EyeIcon
                  className="size-[24px] absolute right-3 cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                />
              )}
            </div>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            <button
              className="text-white bg-primary flex justify-center items-center rounded-[12px] w-full h-[50px] mt-4"
              onClick={handleChangePassword}
            >
              {loading ? <PropogateLoader color="#FFFF" /> : "Change Password"}
            </button>
          </div>

          <div className="w-full md:w-1/2 mb-4 flex flex-col">
            <h1 className="lg:text-lg text-base mb-2">Signature</h1>
            {user?.signature ? (
              <img
                src={user.signature}
                alt="User Signature"
                className="sigCanvas border border-black h-28 w-full"
              />
            ) : (
              <SignatureCanvas
                penColor="black"
                ref={signatureRef}
                canvasProps={{
                  className: "sigCanvas border border-black h-20 w-full",
                }}
              />
            )}
            {signatureEmpty && (
              <span className="text-red-500 text-xs">
                Please provide a signature.
              </span>
            )}
            {!user?.signature && (
              <div className="flex mt-2">
                <button
                  onClick={handleClear}
                  className="bg-gray-300 p-1 rounded-lg mr-2"
                >
                  Clear
                </button>
                <button
                  onClick={handleSaveSignature}
                  className={`bg-primary text-white p-2 rounded-lg flex items-center ${
                    signatureButton ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  disabled={signatureButton}
                >
                  {signatureButton ? (
                    <ClipLoader
                      color="#ffffff" // Adjust the color to match your design
                      size={24} // Adjust the size if needed
                      className="mr-2"
                    />
                  ) : null}
                  {signatureButton ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      {showSuccessModal && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 flex-col ">
          <div className="bg-white relative w-1/4 flex flex-col items-center justify-center rounded-md ">
            <FontAwesomeIcon
              icon={faCircleCheck}
              className="size-20 text-primary absolute -top-6  "
            />
            <div>
              <h1 className="mt-20 text-[28px] font-bold text-center">
                Success
              </h1>
              <p className="my-7  text-gray-400 font-semibold text-center">
                User information updated!
              </p>
            </div>
            <div className="bg-graybg w-full rounded-b-lg flex justify-center items-center p-4">
              <button
                className=" bg-primary p-2 w-1/2 rounded-[12px] text-white font-extrabold"
                onClick={closeSuccessModal}
              >
                OKAY
              </button>
            </div>
          </div>
        </div>
      )}
      {signatureButton && (
        <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 flex-col ">
          <div className="bg-white relative w-1/4 flex flex-col items-center justify-center rounded-md ">
            <FontAwesomeIcon
              icon={faCircleCheck}
              className="size-20 text-primary absolute -top-6  "
            />
            <div>
              <h1 className="mt-20 text-[28px] font-bold text-center">
                Success
              </h1>
              <p className="my-7  text-gray-400 font-semibold text-center">
                Signature Added!
              </p>
            </div>
            <div className="bg-graybg w-full rounded-b-lg flex justify-center items-center p-4">
              <button
                className=" bg-primary p-2 w-1/2 rounded-[12px] text-white font-extrabold"
                onClick={closeSignatureSuccess}
              >
                OKAY
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;