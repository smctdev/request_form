import React from "react";
import { BookOpenIcon, LifebuoyIcon } from "@heroicons/react/24/solid";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

type Props = {};

const Help: React.FC<Props> = ({}) => {
  return (
    <div className="bg-graybg dark:bg-blackbg  h-full py-[26px]  px-[35px] ">
      <div className="bg-primary w-full sm:w-full h-96 rounded-[12px] pl-[30px] flex flex-col justify-center items-center">
        <p className="text-5xl text-white font-bold ">Help Center</p>
        <p className="mt-2  ">
          Explore Our Categories to Quickly Access the Information You Need.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 mt-14 gap-4 w-full">
        <Link
          to="/help/user"
          className="cursor-pointer block bg-white border-2 rounded-lg px-6 py-6"
        >
          <QuestionMarkCircleIcon className="size-14 text-primary    " />
          <p className="font-bold text-lg mt-4">FAQs</p>
          <p>
            FAQ, short for frequently asked questions, is a list of commonly
            asked questions and answers about a specific topic.
          </p>
        </Link>
        <Link
          to="/help/guide"
          className="cursor-pointer block bg-white border-2 rounded-lg px-6 py-6"
        >
          <BookOpenIcon className="size-14 text-primary    " />
          <p className="font-bold text-lg mt-4">How to Request</p>
          <p>Step-by-Step Guide: Filling Out Request Slips</p>
        </Link>
        <Link
          to="/help/setup"
          className="cursor-pointer block bg-white border-2 rounded-lg px-6 py-6"
        >
          <LifebuoyIcon className="size-14 text-primary    " />
          <p className="font-bold text-lg mt-4">Setup</p>
          <p>Setting Up: A Quick Guide for Admin</p>
        </Link>
      </div>
    </div>
  );
};

export default Help;