import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import ClipLoader from "react-spinners/ClipLoader";

const EditPositionModal = ({
  editModal,
  editModalClose
}: {
  editModal: boolean;
  editModalClose: any;
  openSuccessModal: any;
  selectedUser: any;
  refreshData: any;
}) => {
  const [position, setPosition] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  const handleCancel = () => {
    editModalClose();
  };

  if (!editModal) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 flex flex-col items-center justify-center w-full h-full bg-black bg-opacity-50">
      <div className="p-6 w-10/12 md:w-2/5 bg-primary text-white rounded-t-[12px] shadow-xl relative">
        <h2 className="text-center text-xl md:text-[32px] font-bold">Edit Position</h2>
        <XMarkIcon
          className="absolute text-white cursor-pointer size-6 right-3 top-6"
          onClick={handleCancel}
        />
      </div>
      <div className="bg-white w-10/12 md:w-2/5 mx-auto rounded-b-[12px] shadow-lg overflow-y-auto p-6">
        <div className="flex flex-col">
          {/* Render input fields dynamically */}
          <p className="w-full font-medium">Edit Position</p>
              <input
                type="text"
                onChange={(e) => setPosition(e.target.value)}
                className="w-full bg-[#F5F5F5] border input input-bordered border-[#E4E4E4] py-2 px-3 rounded-md text-sm text-[#333333] mt-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
          </div>
        {/* Error message */}
        <div className="mt-4">
          {errorMessage && (
            <p className="text-sm text-red-600">{errorMessage}</p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-6 space-x-4">
          <button
            className="w-24 text-white bg-gray-500 border-gray-500 btn btn-secondary hover:bg-gray-600 hover:border-gray-600"
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            className={`btn btn-primary bg-primary border-primary hover:bg-blue-400 hover:border-blue-400 text-white hover:text-white w-1/3`}
            // onClick={}
          >
            {loading ? <ClipLoader color="#36d7b7" /> : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPositionModal;