import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Slice from "./assets/Slice.png";
import building from "./assets/building.jpg";
import { useNavigate } from "react-router-dom";
import { EyeIcon, EyeSlashIcon, XCircleIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import Swal from "sweetalert2";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleResetPassword = async () => {
    setLoading(true);
    if (!email) {
      setError("Please enter your email address."); // Set error if no email is provided
      setLoading(false); // Stop the loading indicator
      return; // Exit the function early
    }

    try {
      // Send a POST request to the password reset endpoint using axios
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/password/email`,
        {
          email,
        }
      );
      if (response.status === 200) {
        setEmail("");
        setError(null);
        Swal.fire({
          icon: "success",
          title: response.data.message || "",
          iconColor: "#007bff",
          text: "You will be redirected to the login page",
          confirmButtonText: "Go to login",
          confirmButtonColor: "#007bff",
        }).then(() => {
          navigate("/login");
        });
      }
    } catch (error: any) {
      if(error)
      {
        console.error(error.response.data.message);
        setError(error.response.data.message);
      }
    } finally {
      setLoading(false); // Stop the loading indicator
    }
  };

  const inputStyle =
    "w-full lg:max-w-[417px] lg:h-[56px] md:h-10  p-2 bg-gray-300 rounded-lg";
  return (
    <div className="flex flex-row">
      <div className="relative flex items-center justify-center w-full p-8 bg-center bg-cover lg:w-1/2">
        <img
          className="absolute inset-0 z-0 object-cover w-full h-screen lg:hidden"
          src={building}
          alt="photo"
        />
        <div className="lg:max-w-[481px] md:max-w-sm max-w-xs w-full lg:mt-0  mt-20 bg-white bg-opacity-90 p-8 rounded-lg z-10 lg:m-0 m-10 relative ">
          <Link to="/login">
            <div className="block lg:hidden">
              <XCircleIcon className="absolute mb-2 text-black cursor-pointer size-8 right-4 top-4" />
            </div>
          </Link>
          <h1 className="p-4 mt-4 text-2xl font-semibold text-center">
            Forgot your password?
          </h1>
          <p className="p-4 text-center">
            We'll email you a secure link to reset the password for your account
          </p>
          <div className="px-6">
            <p className="mb-2">Email</p>
            <input
              type="email"
              value={email}
              placeholder="Enter your email address"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full lg:max-w-[417px] lg:h-[56px] md:h-10  p-2 bg-gray-300 rounded-lg"
            />
            {error && <p className="mt-2 text-red-500">{error}</p>}
          </div>
          <div className="px-6 pt-4">
            <button
              disabled={loading}
              onClick={handleResetPassword}
              className={`${
                loading ? "bg-blue-400 cursor-not-allowed" : ""
              } bg-primary hover:bg-blue-500 text-white py-2 px-4 rounded-lg w-full lg:max-w-[417px] lg:h-[56px]  md:h-10`}
            >
              {loading ? "Sending..." : "Send Link"}
            </button>
            <Link to="/login">
              <button className="bg-gray-600 border-2 hover:bg-gray-700 text-white my-2 py-4.5 px-4 rounded-lg w-full lg:max-w-[417px] lg:h-[56px] md:h-10">
                <p className="-mt-1.7">Cancel</p>
              </button>
            </Link>
            <Link to="/registration">
              <div className="flex flex-row justify-center mt-[10px]">
                <p className="text-sm italic text-center lg:text-base">
                  Don't have an account?{" "}
                </p>
                <p className="pl-2 text-sm italic font-bold underline text-primary lg:text-base">
                  Sign Up
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
      <div className="items-center justify-center hidden w-1/2 lg:block">
        <img className="object-cover w-full h-screen" src={Slice} alt="photo" />
      </div>
    </div>
  );
};

export default ForgotPassword;
