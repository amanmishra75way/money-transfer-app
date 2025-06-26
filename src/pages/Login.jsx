import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { login, logout } from "../redux/userSlice";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [credentials, setCredentials] = useState({ id: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const { error, currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser) {
      navigate(currentUser.isAdmin ? "/admin" : "/dashboard");
    }
  }, [currentUser, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      dispatch(login(credentials));
      setIsLoading(false);
    }, 500);
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const quickLogin = (id, password) => {
    dispatch(login({ id, password }));
  };

  if (currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome, {currentUser.name}!</h2>
          <p className="text-gray-600 mb-6">You are logged in as {currentUser.isAdmin ? "Administrator" : "User"}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate(currentUser.isAdmin ? "/admin" : "/dashboard")}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition duration-200"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => dispatch(logout())}
              className="w-full py-3 px-4 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition duration-200"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              ></path>
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">MoneyTransfer</h2>
          <p className="text-gray-600">Secure Money Transfer Platform</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              ></path>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
            <input
              type="text"
              name="id"
              value={credentials.id}
              onChange={handleChange}
              placeholder="Enter your user ID"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Signing In...
              </div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-800 mb-3">Trial User Credentials:</h3>
          <ul className="space-y-2">
            <li className="px-3 py-2 bg-white rounded border">
              <div className="font-medium text-blue-600">Alice (User)</div>
              <div className="text-sm text-gray-500">
                ID: <span className="font-mono">u1</span> | Password: <span className="font-mono">alice123</span>
              </div>
            </li>
            <li className="px-3 py-2 bg-white rounded border">
              <div className="font-medium text-blue-600">Bob (User)</div>
              <div className="text-sm text-gray-500">
                ID: <span className="font-mono">u2</span> | Password: <span className="font-mono">bob123</span>
              </div>
            </li>
            <li className="px-3 py-2 bg-white rounded border">
              <div className="font-medium text-green-600">Administrator</div>
              <div className="text-sm text-gray-500">
                ID: <span className="font-mono">admin</span> | Password: <span className="font-mono">admin123</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Login;
