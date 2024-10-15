import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Avatar from "./assets/avatar.png";

interface Record {
  id: number;
  firstname: string;
  lastname: string;
  branch_code: string;
  email: string;
  role: string;
  contact: string;
  username: string;
  profile_picture: string;
}

interface ViewUserModalProps {
  modalIsOpen: boolean;
  closeModal: () => void;
  user: Record | null;
}

const ViewUserModal: React.FC<ViewUserModalProps> = ({
  modalIsOpen,
  closeModal,
  user,
}) => {
  if (!modalIsOpen) {
    return null;
  }
  return (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 flex-col">
      <div className="p-6 w-4/5 md:w-2/5 relative bg-primary flex justify-center mx-4 rounded-t-[12px] shadow-lg">
        <h2 className="text-center text-xl md:text-[32px] font-semibold text-white">
          User Information
        </h2>
        <XMarkIcon
          className="text-white size-6 absolute right-4 top-4 cursor-pointer"
          onClick={closeModal}
        />
      </div>

      <div className="bg-white w-4/5 md:w-2/5 rounded-b-[12px] shadow-xl px-10 py-6">
        {user && (
          <div className="flex flex-col items-center gap-8">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center mb-8">
              <img
                src={
                  user.profile_picture
                    ? `${process.env.REACT_APP_URL_STORAGE}/${user.profile_picture}`
                    : Avatar
                } // Default image if no profile image exists
                alt="Profile"
                className="w-32 h-32 rounded-full border-4 border-primary mb-4"
              />
              <h3 className="text-xl font-bold text-gray-800">
                {user.username || "User Name"}
              </h3>
              <p className="text-gray-600">
                {user.email || "user@example.com"}
              </p>
            </div>

            {/* User Information Section */}
            <div className="w-full grid lg:grid-cols-2 gap-6">
              {/* Left Column of Information */}
              <div className="flex flex-col items-start">
                {Object.entries(user)
                  .filter(
                    ([key]) =>
                      key !== "profile_picture" &&
                      key !== "username" &&
                      key !== "email"
                  )
                  .map(([key, value], index) =>
                    index % 2 === 0 ? (
                      <div key={key} className="mb-4 w-full">
                        <p className="font-semibold text-gray-700">
                          {key.replace(/_/g, " ").toUpperCase()}
                        </p>
                        <div className="border p-4 border-gray-300 rounded-xl shadow-sm">
                          <p className="text-gray-800 break-words">{value}</p>
                        </div>
                      </div>
                    ) : null
                  )}
              </div>

              {/* Right Column of Information */}
              <div className="flex flex-col items-start">
                {Object.entries(user)
                  .filter(
                    ([key]) =>
                      key !== "profile_picture" &&
                      key !== "username" &&
                      key !== "email"
                  )
                  .map(([key, value], index) =>
                    index % 2 !== 0 ? (
                      <div key={key} className="mb-4 w-full">
                        <p className="font-semibold text-gray-700">
                          {key.replace(/_/g, " ").toUpperCase()}
                        </p>
                        <div className="border p-4 border-gray-300 rounded-xl shadow-sm">
                          <p className="text-gray-800 break-words">{value}</p>
                        </div>
                      </div>
                    ) : null
                  )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewUserModal;
