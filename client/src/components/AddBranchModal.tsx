import React, { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader";

type Branch = z.infer<typeof schema>;
const schema = z.object({
  branchCode: z.string().nonempty(),
  branch: z.string(),
});

const branchOptions = [  
  "Des Strong Appliance, Inc.",  
  "Des Strong Motors, Inc.",  
  "Head Office",  
  "Honda Des, Inc.",  
  "Strong Motocentrum, Inc."];

const AddBranchModal = ({
  modalIsOpen,
  closeModal,
  openCompleteModal,
  entityType,
  refreshData,
}: {
  modalIsOpen: boolean;
  closeModal: any;
  openCompleteModal: any;
  entityType: string;
  refreshData: () => void;
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const {
    control,
    reset,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Branch>({
    resolver: zodResolver(schema),
  });

  const submitData = async (data: Branch) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
      };
      const requestData = {
        branch: data.branch,
        branch_code: data.branchCode,
      };
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/add-branch`,
        requestData,
        { headers }
      );


      if (response.status === 200 && response.data.status) {
        openCompleteModal();
        refreshData();
        reset();
      } else {
        alert("Registration failed. Please check your details and try again.");
      }
    } catch (error) {
      console.error("Registration Error:", error);
      alert("An error occurred during the registration process.");
    } finally {
      setLoading(false);
    }
  };
 
     const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedBranch = e.target.value;
      if ([
        "AKLA", "ALEN", "ALIC", "ANTI", "ANTIP", "BANTA", "BAYB", "BINAN",
        "BOHK", "BOHL", "CAGL", "CALAP", "CALAP2", "CALI", "CARMB", "CARMO",
        "CARS", "CATAR", "DASMA", "DIPL", "FAMY", "GUIN", "GUIN2", "JAGN",
        "LIPA", "LOAY", "MADRI", "MALA", "MANG", "MANL", "MANP", "MOLS",
        "NAIC", "OZAL", "PAGS", "SAGBA", "SALA", "SANJ", "SANP", "SDAV",
        "SDIP", "SARG", "SILA", "SLAP", "SLAS", "SLIL", "SMCT", "SROS",
        "TALI", "TANZ", "TANZ2", "TRINI2", "TUBI", "VALEN", "YATI", "ZAML"
      ].includes(selectedBranch)) {
        setValue("branch", "Strong Motocentrum, Inc.");
      } else if ([
        "AURO", "BALA", "BUHA", "BULU", "CARMCDO", "DIGOS", "DONC", "DSMBL",
        "DSMC", "DSMCA", "DSMD", "DSMD2", "DSMM", "DSMPO", "DSMSO", "DSMTG",
        "DSMV", "ELSA", "ILIG", "JIMEDSM", "KABA2", "KATI", "LABA", "MARA",
        "MATI", "RIZA", "TACU", "TORI", "CERI", "VILLA", "VISA", "CARC",
        "CARC2", "CARMC2", "CATM", "COMPO", "DAAN", "DSMA", "DSMAO", "DSMB",
        "DSMBN", "DSMCN", "DSMDB", "DSMDM", "DSMDN", "DSMK", "DSMLN", "DSMP",
        "DSMSB", "DSMT", "DSMT2", "DSMTA", "ILOI", "LAHU", "LAPU 2", "MAND",
        "MAND2", "MEDE", "PARD", "PARD2", "REMI", "REMI2", "SANT", "TUBU",
        "UBAY", "BOGO", "DSML", "CALIN"
      ].includes(selectedBranch)) {
        setValue("branch", "Des Strong Motors, Inc.");
      } else if ([
        "ALAD", "AURD", "BALD", "BONI", "BUUD", "CALD", "CAMD", "DAPI", "DIPD", "DIPD2", "ILID", "IMED", "INIT2", "IPID", "JIME", "KABD", "LABD", "LILD", "MANO", "MARA2", "MARD", "MOLD", "MOLD2", "NUND2", "OROD", "OZAD", "PUTD", "RIZD", "SANM", "SIND", "SUCD", "TUBOD", "VITA"
      ].includes(selectedBranch)) {
        setValue("branch", "Des Strong Motors, Inc.");
      } else if (["HO"].includes(selectedBranch)) {
        setValue("branch", "Head Office");
      } else {
        setValue("branch", "Honda Des, Inc.");
      }
    }; 

  const onSubmit = (data: Branch) => {
    submitData(data);
  };
 
 
    
  const submitAllBranches = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("No authentication token found");
      }
  
      const headers = {
        Authorization: `Bearer ${token}`,
      };
  
      // List of branch codes
      const branchOptions = [
        "AKLA", "ALEN", "ALIC", "ANTI", "ANTIP", "BANTA", "BAYB", "BINAN",
        "BOHK", "BOHL", "CAGL", "CALAP", "CALAP2", "CALI", "CARMB", "CARMO",
        "CARS", "CATAR", "DASMA", "DIPL", "FAMY", "GUIN", "GUIN2", "JAGN",
        "LIPA", "LOAY", "MADRI", "MALA", "MANG", "MANL", "MANP", "MOLS",
        "NAIC", "OZAL", "PAGS", "SAGBA", "SALA", "SANJ", "SANP", "SDAV",
        "SDIP", "SARG", "SILA", "SLAP", "SLAS", "SLIL", "SMCT", "SROS",
        "TALI", "TANZ", "TANZ2", "TRINI2", "TUBI", "VALEN", "YATI", "ZAML",
        "AURO", "BALA", "BUHA", "BULU", "CARMCDO", "DIGOS", "DONC", "DSMBL",
        "DSMC", "DSMCA", "DSMD", "DSMD2", "DSMM", "DSMPO", "DSMSO", "DSMTG",
        "DSMV", "ELSA", "ILIG", "JIMEDSM", "KABA2", "KATI", "LABA", "MARA",
        "MATI", "RIZA", "TACU", "TORI", "CERI", "VILLA", "VISA", "CARC",
        "CARC2", "CARMC2", "CATM", "COMPO", "DAAN", "DSMA", "DSMAO", "DSMB",
        "DSMBN", "DSMCN", "DSMDB", "DSMDM", "DSMDN", "DSMK", "DSMLN", "DSMP",
        "DSMSB", "DSMT", "DSMT2", "DSMTA", "ILOI", "LAHU", "LAPU 2", "MAND",
        "MAND2", "MEDE", "PARD", "PARD2", "REMI", "REMI2", "SANT", "TUBU",
        "UBAY", "BOGO", "DSML", "CALIN",
        "ALAD", "AURD", "BALD", "BONI", "BUUD", "CALD", "CAMD", "DAPI", "DIPD", "DIPD2", "ILID", "IMED", "INIT2", "IPID", "JIME", "KABD", "LABD", "LILD", "MANO", "MARA2", "MARD", "MOLD", "MOLD2", "NUND2", "OROD", "OZAD", "PUTD", "RIZD", "SANM", "SIND", "SUCD", "TUBOD", "VITA",
      ];
  
      const branchPromises = branchOptions.map(async (branchCode) => {
        const branchName = getBranchName(branchCode);
        const requestData = {
          branch: branchName,
          branch_code: branchCode,
        };
  
        try {
          const response = await axios.post(
            `${process.env.REACT_APP_API_BASE_URL}/add-branch`,
            requestData,
            { headers }
          );
  
          if (response.status !== 200 || !response.data.status) {
            console.error(`Failed to add branch: ${branchCode}`, response.data);
            throw new Error(`Failed to add branch: ${branchCode}`);
          }
        } catch (error) {
          console.error("Error submitting branch:", branchCode, error);
          throw error;
        }
      });
  
      await Promise.all(branchPromises);
  
      openCompleteModal();
      refreshData();
      reset();
    } catch (error) {
      console.error("Registration Error:", error);
      alert("An error occurred during the registration process.");
    } finally {
      setLoading(false);
    }
  };
  
  
  // Helper function to determine branch name based on branch code
  const getBranchName = (branchCode: string): string => {
    const strongMotocentrumBranches = [
      "AKLA", "ALEN", "ALIC", "ANTI", "ANTIP", "BANTA", "BAYB", "BINAN",
      "BOHK", "BOHL", "CAGL", "CALAP", "CALAP2", "CALI", "CARMB", "CARMO",
      "CARS", "CATAR", "DASMA", "DIPL", "FAMY", "GUIN", "GUIN2", "JAGN",
      "LIPA", "LOAY", "MADRI", "MALA", "MANG", "MANL", "MANP", "MOLS",
      "NAIC", "OZAL", "PAGS", "SAGBA", "SALA", "SANJ", "SANP", "SDAV",
      "SDIP", "SARG", "SILA", "SLAP", "SLAS", "SLIL", "SMCT", "SROS",
      "TALI", "TANZ", "TANZ2", "TRINI2", "TUBI", "VALEN", "YATI", "ZAML"
    ];
  
    const desStrongMotorsBranches = [
      "AURO", "BALA", "BUHA", "BULU", "CARMCDO", "DIGOS", "DONC", "DSMBL",
      "DSMC", "DSMCA", "DSMD", "DSMD2", "DSMM", "DSMPO", "DSMSO", "DSMTG",
      "DSMV", "ELSA", "ILIG", "JIMEDSM", "KABA2", "KATI", "LABA", "MARA",
      "MATI", "RIZA", "TACU", "TORI", "CERI", "VILLA", "VISA", "CARC",
      "CARC2", "CARMC2", "CATM", "COMPO", "DAAN", "DSMA", "DSMAO", "DSMB",
      "DSMBN", "DSMCN", "DSMDB", "DSMDM", "DSMDN", "DSMK", "DSMLN", "DSMP",
      "DSMSB", "DSMT", "DSMT2", "DSMTA", "ILOI", "LAHU", "LAPU 2", "MAND",
      "MAND2", "MEDE", "PARD", "PARD2", "REMI", "REMI2", "SANT", "TUBU",
      "UBAY", "BOGO", "DSML", "CALIN"
    ];
  
    const desStrongMotorsApplianceBranches = [
      "ALAD", "AURD", "BALD", "BONI", "BUUD", "CALD", "CAMD", "DAPI", "DIPD", "DIPD2", "ILID", "IMED", "INIT2", "IPID", "JIME", "KABD", "LABD", "LILD", "MANO", "MARA2", "MARD", "MOLD", "MOLD2", "NUND2", "OROD", "OZAD", "PUTD", "RIZD", "SANM", "SIND", "SUCD", "TUBOD", "VITA"
    ];
  
    if (strongMotocentrumBranches.includes(branchCode)) {
      return "Strong Motocentrum, Inc.";
    } else if (desStrongMotorsBranches.includes(branchCode)) {
      return "Des Strong Motors, Inc.";
    } else if (desStrongMotorsApplianceBranches.includes(branchCode)) {
      return "Des Strong Appliance, Inc.";
    } else if (branchCode === "HO") {
      return "Head Office";
    } else {
      return "Honda Des, Inc.";
    }
  };
  

  return modalIsOpen ? (
    <div className="fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 flex-col">
      <div className="p-4 w-7/12 md:w-2/6 relative bg-primary flex justify-center mx-20 border-b rounded-t-[12px]">
        <h2 className="text-center text-xl md:text-[32px] font-bold text-white">
          Add {entityType}
        </h2>
        <XMarkIcon
          className="size-6 text-black absolute right-3 cursor-pointer"
          onClick={closeModal}
        />
      </div>
      <div className="bg-white w-7/12 md:w-2/6 x-20 rounded-b-[12px] shadow-lg overflow-y-auto h-2/3">
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-2 place-content-center mt-10 mx-5 md:mx-10 gap-4">
            <div>
              <p className="font-medium w-full">Branch</p>
              <select
                {...register("branch")}
                className="w-full bg-[#F5F5F5] border border-[#E4E4E4] py-2 px-3 rounded-md text-sm text-[#333333] mt-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                onChange={(e) => setValue("branch", e.target.value)}
              >
                {branchOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              {errors.branch && (
                <span className="text-red-500 text-xs">{errors.branch.message}</span>
              )}
            </div>
            <div>
              <p className="font-medium w-full">Branch Code</p>
             <input
             type="text"
             onChange={(e) => setValue("branchCode", e.target.value)}
             className="w-full bg-[#F5F5F5] border border-[#E4E4E4] py-2 px-3 rounded-md text-sm text-[#333333] mt-2 outline-none focus:border-primary focus:ring-1 focus:ring-primary"
             />
              {errors.branchCode && (
                <span className="text-red-500 text-xs">{errors.branchCode.message}</span>
              )}
            </div>
          </div>
          <div className="flex  lg:flex-row justify-center space-x-2 mt-5 mx-4 sm:x-10 lg:justify-end items-center  md:mt-10  mb-10">
            <button
              className="bg-[#9C9C9C] p-2 h-12  w-1/2 sm:w-1/3 rounded-[12px] text-white font-medium"
              onClick={closeModal}
            >
              Cancel
            </button>
            <button
              className="bg-primary p-2 w-1/2 sm:w-1/3  h-12 rounded-[12px] text-white font-medium"
              type="submit"
              disabled={loading}
            >
              {loading ? <ClipLoader color="#36d7b7" /> : "Add"}
            </button>
        
          </div>
        </form>
      </div>
    </div>
  ) : null;
};

export default AddBranchModal;
