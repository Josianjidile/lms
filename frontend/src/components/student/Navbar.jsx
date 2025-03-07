import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { useClerk, UserButton, useUser } from "@clerk/clerk-react";
import { AppContext } from "../../context/AppContext";
import { assets } from "../../assets/assets";
import axios from "axios";
import { toast } from "react-toastify";

const Navbar = () => {
  const location = useLocation();
  const isCourseListPage = location.pathname.includes("/course-list");

  const { isEducator, navigate, backendUrl, setIsEducator, getToken } = useContext(AppContext);
  const { openSignIn } = useClerk();
  const { user } = useUser();

  const becomeEducator = async () => {
    try {
      if (isEducator) {
        navigate("/educator");
        return;
      }

      const token = await getToken();
      const { data } = await axios.get(`${backendUrl}/api/educator/update-role`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (data.success) {
        setIsEducator(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleSignIn = () => {
    openSignIn({
      afterSignInUrl: "/",
      afterSignUpUrl: "/",
    });
  };

  return (
    <div
      className={`flex items-center justify-between px-4 sm:px-10 md:px-14 lg:px-36 border-b border-gray-500 py-4 ${
        isCourseListPage ? "bg-white" : "bg-cyan-100/70"
      }`}
    >
      <img
        onClick={() => navigate("/")}
        src={assets.logo}
        alt="logo"
        className="w-28 lg:w-32 cursor-pointer"
      />

      <div className="hidden md:flex text-gray-500 items-center gap-5">
        {user && (
          <>
            {isEducator && (
              <button onClick={() => navigate("/educator")}>Educator Dashboard</button>
            )}
            {!isEducator && (
              <button onClick={becomeEducator}>Become Educator</button>
            )}
            <Link to="/my-enrollments" aria-label="My Enrollments">
              My Enrollments
            </Link>
          </>
        )}
        {user ? (
          <UserButton />
        ) : (
          <button
            onClick={handleSignIn}
            className="bg-blue-600 text-white px-5 py-2 rounded-full"
            aria-label="Create Account"
          >
            Create Account
          </button>
        )}
      </div>

      <div className="md:hidden flex items-center gap-2 sm:gap-3">
        {user && (
          <>
            {isEducator && (
              <button onClick={() => navigate("/educator")}>Educator Dashboard</button>
            )}
            {!isEducator && (
              <button onClick={becomeEducator}>Become Educator</button>
            )}
            |
            <Link to="/my-enrollments" aria-label="My Enrollments">
              My Enrollments
            </Link>
          </>
        )}
        {user ? (
          <UserButton />
        ) : (
          <button
            onClick={handleSignIn}
            className="bg-blue-600 text-white px-3 py-1 rounded-full"
            aria-label="Create Account"
          >
            Create Account
          </button>
        )}
      </div>
    </div>
  );
};

export default Navbar;
