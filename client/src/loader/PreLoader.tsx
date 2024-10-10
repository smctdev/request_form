import React from "react";

const Preloader: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <iframe
        src="https://smctdevt.github.io/smctloder/"
        frameBorder="0"
        allowFullScreen
        style={{ width: "100%", height: "100%" }}
      ></iframe>
    </div>
  );
};

export default Preloader;
