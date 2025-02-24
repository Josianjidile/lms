import React from "react";
import { assets, dummyTestimonial } from "../../assets/assets";

const TestimonialsSection = () => {
  return (
    <div className="pb-14 px-8 md:px-0 flex justify-center">
      <div className="max-w-6xl w-full text-center">
        <h1 className="text-3xl font-medium text-gray-800">Testimonials</h1>
        <p className="md:text-base text-gray-500 mt-4">
          Lorem ipsum dolor sit amet consectetur adipisicing elit. A iure corrupti
          possimus nam ex <br />
          officiis, commodi voluptas repellendus sed ipsa autem aut cum rem nihil
          sit quos unde vel. Culpa?
        </p>

        {/* Corrected Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-14 justify-items-center">
          {dummyTestimonial.map((testimonial, index) => (
            <div key={index} className="text-sm text-left border border-gray-500/30 rounded-lg shadow-md p-5 w-full max-w-sm">
              {/* User Info */}
              <div className="flex items-center gap-4 px-5 py-4 bg-gray-500/10 rounded-t-lg">
                <img className="h-12 w-12 rounded-full" src={testimonial.image} alt="testimonial" />
                <div>
                  <h1 className="text-lg font-semibold">{testimonial.name}</h1>
                  <p className="text-gray-500">{testimonial.role}</p>
                </div>
              </div>

              {/* Rating */}
              <div className="p-5 pb-7">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <img
                      className="h-5"
                      key={i}
                      src={i < Math.floor(testimonial.rating) ? assets.star : assets.star_blank}
                      alt="star"
                    />
                  ))}
                </div>
              </div>

              {/* Feedback */}
              <p className="text-gray-500 mt-2">{testimonial.feedback}</p>

              {/* Read More Link (Fixed Placement) */}
              <a href="#" className="text-blue-500 underline block text-right mt-3">
                Read More
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;
