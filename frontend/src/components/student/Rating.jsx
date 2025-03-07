import React, { useEffect, useState } from "react";

const Rating = ({ initialRating, onRate }) => {
  const [rating, setRating] = useState(initialRating || 0);

  // Handle the rating change
  const handleRating = (value) => {
    setRating(value);
    if (onRate) onRate(value); // Notify the parent about the new rating
  };

  // Update the rating when the initialRating changes
  useEffect(() => {
    if (initialRating !== undefined) {
      setRating(initialRating);
    }
  }, [initialRating]);

  return (
    <div>
      {Array.from({ length: 5 }, (_, index) => {
        const starValue = index + 1;
        return (
          <span
            key={index}
            className={`text-xl sm:text-2xl cursor-pointer transition-colors ${
              starValue <= rating ? "text-yellow-500" : "text-gray-400"
            }`}
            onClick={() => handleRating(starValue)} // Handle star click
          >
            &#9733;
          </span>
        );
      })}
    </div>
  );
};

export default Rating;
