import React from "react";
import { assets } from "../../assets/assets";

const Companies = () => {
  return (
    <div className="pt-16">
      <p className="text-gray-600 text-base">
        Trusted by learners from
      </p>
      <div className="flex flex-wrap justify-center items-center md:gap-16 gap-10 md:mt-10 mt-4">
        <img src={assets.microsoft_logo} alt="Microsoft" className="w-24 md:w-32" />
        <img src={assets.walmart_logo} alt="Walmart" className="w-24 md:w-32" />
        <img src={assets.accenture_logo} alt="Accenture" className="w-24 md:w-32" />
        <img src={assets.adobe_logo} alt="Adobe" className="w-24 md:w-32" />
        <img src={assets.paypal_logo} alt="PayPal" className="w-24 md:w-32" />
      </div>
    </div>
  );
};

export default Companies;

