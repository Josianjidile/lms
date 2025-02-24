import React from "react";
import { assets } from "../../assets/assets";

const CallToAction = () => {
  return (
    <div className="flex flex-col items-center text-center p-10 bg-gray-100 rounded-lg shadow-md max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold text-gray-800 mb-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Ipsam qui
        veritatis atque dolorum beatae vitae optio sint minus ipsa tenetur
        ratione.
      </h1>
      <p className="text-gray-600 mb-6">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Hic distinctio
        animi asperiores quas, blanditiis tenetur repellendus tempore
        repudiandae nihil corporis placeat ab iste itaque veritatis magnam
        dolores ad reiciendis nam?
      </p>
      <div className="flex gap-4">
        <button className="bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md hover:bg-blue-600 transition">
          Get Started
        </button>
        <button className="flex items-center gap-2 border border-blue-500 text-blue-500 px-6 py-2 rounded-lg shadow-md hover:bg-blue-100 transition">
          Learn More <img src={assets.arrow_icon} alt="arrow icon" className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default CallToAction;
