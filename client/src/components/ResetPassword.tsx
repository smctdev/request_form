import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Slice from "./assets/Slice.png";
import building from "./assets/building.jpg";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon, XCircleIcon } from "@heroicons/react/24/solid";
import axios from 'axios';

const ResetPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();

  const handleResetPassword = async () => {
   
    setError(null); // Clear any previous error message
    setSuccess(null); // Clear any previous success message
    setLoading(true); // Start the loading indicator

    if (!email && !password && !confirmPassword) {
      setError("Please enter your email address."); // Set error if no email is provided
      setLoading(false); // Stop the loading indicator
      return; // Exit the function early
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match"); // Set error if no email is provided
      setLoading(false); // Stop the loading indicator
      return; // Exit the function early
    }
    try {
      // Send a POST request to the password reset endpoint using axios
      const response = await axios.post("http://122.53.61.91:6002/api/password/reset", {
        email, password,
      });
    

    
      setSuccess(response.data.message);
      setEmail(""); 
      navigate("/login");
    } catch (error: unknown) {
      // Handle the error response
      if (axios.isAxiosError(error) && error.response) {
        setError(error.response.data.message || "An error occurred. Please try again."); // Set error message from the response data
      } else {
        setError("An error occurred. Please try again."); // Set a generic error message
      }
    } finally {
      setLoading(false); // Stop the loading indicator
    }
  };

  const inputStyle =
    "w-full lg:max-w-[417px] lg:h-[56px] md:h-10  p-2 bg-gray-300 rounded-lg";
  return (
    <div className="flex flex-row">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-cover bg-center relative">
        <img
          className="absolute inset-0 object-cover w-full h-screen lg:hidden z-0"
          src={building}
          alt="photo"
        />
        <div className="lg:max-w-[481px] md:max-w-sm max-w-xs w-full lg:mt-0  mt-20 bg-white bg-opacity-90 p-8 rounded-lg z-10 lg:m-0 m-10 relative ">
          <Link to="/login">
            <div className="lg:hidden block">
              <XCircleIcon className="text-black size-8 absolute right-4 top-4 mb-2 cursor-pointer" />
            </div>
          </Link>
          <h1 className="text-2xl font-semibold text-center p-4 mt-4">
            Change your password
          </h1>
          <p className="text-center p-4">
           Enter your new password
          </p>
          <div className="px-6">
            <p className="mb-2">Email</p>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full lg:max-w-[417px] lg:h-[56px] md:h-10  p-2 bg-gray-300 rounded-lg"
            />
             <p className="my-2">Password</p>
            <input
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full lg:max-w-[417px] lg:h-[56px] md:h-10  p-2 bg-gray-300 rounded-lg"
            />
             <p className="my-2">Confirm Password</p>
            <input
              type="text"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full lg:max-w-[417px] lg:h-[56px] md:h-10  p-2 bg-gray-300 rounded-lg"
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>
          <div className="px-6 pt-4">
            <button
              onClick={handleResetPassword}
              className="bg-primary  text-white py-2 px-4 rounded-lg w-full lg:max-w-[417px] lg:h-[56px]  md:h-10"
            >
              Change password
            </button>
            <Link to="/login">
              <button className="bg-gray-300 border-2 border-black mt-2   py-2 px-4 rounded-lg w-full lg:max-w-[417px] lg:h-[56px]  md:h-10 text-black">
                Cancel
              </button>
            </Link>
            <Link to="/registration">
              <div className="flex flex-row justify-center mt-[10px]">
                <p className="text-center italic lg:text-base text-sm">
                  Don't have an account?{" "}
                </p>
                <p className="pl-2 italic font-bold text-primary underline  lg:text-base text-sm">
                  Sign Up
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
      <div className="hidden lg:block w-1/2  items-center justify-center">
        <img className="object-cover h-screen w-full" src={Slice} alt="photo" />
      </div>
    </div>
  );
};

export default ResetPassword;
