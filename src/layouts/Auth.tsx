import { Navigate, Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar/Navbar";

export default function AuthLayout() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (isLoggedIn) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Navbar />
      <div className="flex justify-center items-center h-[calc(100vh-66px)] w-full">
        <Outlet />
      </div>
    </>
  );
}
