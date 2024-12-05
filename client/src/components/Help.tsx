import React from "react";
import { BookOpenIcon, LifebuoyIcon } from "@heroicons/react/24/solid";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";

type Props = {};

const Help: React.FC<Props> = ({}) => {
  const { role } = useUser();
  return (
    <div className="bg-graybg dark:bg-blackbg h-full py-[26px]  px-[35px] ">
      <div className="bg-primary w-full sm:w-full h-96 rounded-[12px] pl-[30px] flex flex-col justify-center items-center">
        <p className="text-5xl font-bold text-white ">Help Center</p>
        <p className="mt-2 ">
          Explore Our Categories to Quickly Access the Information You Need.
        </p>
      </div>

      <div
        className={`grid w-full grid-cols-1 gap-4 md:grid-cols-2 mt-14 ${
          role === "User" ? "lg:grid-cols-3" : "lg:grid-cols-2"
        }`}
      >
        <Link
          to="/help/user"
          className="block px-6 py-6 bg-white border-2 rounded-lg cursor-pointer"
        >
          <QuestionMarkCircleIcon className="size-14 text-primary " />
          <p className="mt-4 text-lg font-bold">FAQs</p>
          <p>
            FAQ, short for frequently asked questions, is a list of commonly
            asked questions and answers about a specific topic.
          </p>
        </Link>
        <Link
          to="/help/guide"
          className="block px-6 py-6 bg-white border-2 rounded-lg cursor-pointer"
        >
          <BookOpenIcon className="size-14 text-primary " />
          <p className="mt-4 text-lg font-bold">How to Request</p>
          <p>Step-by-Step Guide: Filling Out Request Slips</p>
        </Link>
        {role === "User" && (
          <Link
            to="/help/setup"
            className="block px-6 py-6 bg-white border-2 rounded-lg cursor-pointer"
          >
            <LifebuoyIcon className="size-14 text-primary " />
            <p className="mt-4 text-lg font-bold">Setup</p>
            <p>Setting Up: A Quick Guide for Admin</p>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Help;
