import React, { useState } from "react";
import ReactPlayer from 'react-player/youtube';

type Props = {};

const videoOptions = [
  {
    url: "https://www.youtube.com/watch?v=B4nkpQvQ_Hc&t=10s",
    title: "Setting Up Your Request and Create Request",
  },
  {
    url: "https://www.youtube.com/watch?v=TirBBQSH3R4&t=9s",
    title: "How to edit request ",
  },
  {
    url: "https://www.youtube.com/watch?v=fWUlts5nTwI",
    title: "How to print request with Approved status",
  },
  {
    url: "https://www.youtube.com/watch?v=Ak95tZafP5k",
    title: "How to approve or decline a request",
    role: "approver",
  },
];

const HelpGuide = (props: Props) => {
  const [currentVideo, setCurrentVideo] = useState(videoOptions[0].url);
  const [currentTitle, setCurrentTitle] = useState(videoOptions[0].title);

  const handleVideoChange = (url: string, title: string) => {
    setCurrentVideo(url);
    setCurrentTitle(title);
  };
  return (
    <div className="bg-graybg dark:bg-blackbg h-full pt-[26px] px-[35px]">
      <h1 className="text-primary dark:text-primaryD text-[32px] font-bold">
        Help Guide
      </h1>
      <div className="bg-white w-full mb-5 rounded-[12px] flex flex-col p-10">
        <div className="flex justify-center items-center mb-4">
          <ReactPlayer url={currentVideo} width="1280px" height="720px" controls pip playing />
        </div>
        <p className="font-bold">{currentTitle}</p>
        <div className="mt-10">
          <h2 className="text-primary  text-[24px] font-bold">Other Video</h2>
          <ul>
            {videoOptions.map((option, index) => (
              <li key={index} className="mb-2">
                <button
                  className="text-blue-500 hover:underline"
                  onClick={() => handleVideoChange(option.url, option.title)}
                >
                  {option.title}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HelpGuide;
