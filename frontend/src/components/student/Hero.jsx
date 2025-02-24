import React from "react";
import { assets } from "../../assets/assets"; // Ensure the correct import path
import SearchBar from "./SearchBar";

const Hero = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full md:pt-36 pt-20 px-7 md:px-0 text-center bg-gradient-to-b from-cyan-100/70">
      <h1 className="md:text-5xl text-3xl relative font-bold text-gray-800 max-w-3xl mx-auto">
        Empower your future with the courses designed to
        <span className="text-blue-600"> fit your choice</span>
        <img
          src={assets.sketch}
          alt="Sketch illustration"
          className="md:block hidden absolute -bottom-7 right-0 w-32"
        />
      </h1>
      
      <p className="md:block hidden text-gray-500 max-w-2xl mx-auto mt-4">
        Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatum
        accusantium impedit ad, temporibus consequuntur inventore, minus
        distinctio veniam facere, praesentium sunt suscipit maiores! In placeat
        ducimus delectus, ullam obcaecati id!
      </p>
      {/* SearchBar with added margin for better spacing */}
      <div className="mt-6 w-full max-w-xl">
        <SearchBar />
      </div>
    </div>
  );
};

export default Hero;
