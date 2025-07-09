import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import ProtectedRoute from "./config/ProtectedRoute";
import Loader from "./Components/Loader";

import Login from "./pages/Login";
import ErrorMaker from "./Components/ErrorMaker";
import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchCurrentUser } from "./redux/userSlice";

const UserDashboard = lazy(() => import("./pages/UserDashboard"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const NotFound = lazy(() => import("./pages/NotFound"));
const UserLayouts = lazy(() => import("./layouts/UserLayouts"));
const AdminLayouts = lazy(() => import("./layouts/AdminLayouts"));

const App = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    // Only fetch current user if tokens exist in localStorage
    const storedUser = localStorage.getItem("user");
    const accessToken = localStorage.getItem("accessToken");

    if (storedUser && accessToken) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]);

  return (
    <Suspense fallback={<Loader />}>
      {/* <ErrorMaker /> */}
      <Routes>
        <Route path="/" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<UserLayouts />}>
            <Route index element={<UserDashboard />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute adminOnly />}>
          <Route path="/admin" element={<AdminLayouts />}>
            <Route index element={<AdminDashboard />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default App;
