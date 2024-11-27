import { Outlet } from "react-router-dom";
import Navbar from "@/components/Navbar/Navbar";

export default function RootLayout() {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  console.log("isLoggedIn", isLoggedIn);

  return (
    <div className="relative px-4">
      <Navbar />
      <div className="flex h-screen max-w-[1344px] mx-auto">
        <div className="w-full">
          <main className="flex-1 bg-background py-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
