import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center bg-gray-100 p-4">
      <h1 className="text-5xl font-bold text-red-500 mb-4">404</h1>
      <p className="text-xl mb-6 text-gray-700">Oops! The page you’re looking for doesn’t exist.</p>
      <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300">
        Go to Home
      </Link>
    </div>
  );
};

export default NotFound;
