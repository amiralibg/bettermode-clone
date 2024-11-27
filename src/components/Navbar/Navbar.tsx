import { useState, useEffect } from "react";
import { Sun, Moon, User, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Link, useNavigate } from "react-router-dom";

// Custom hook for managing dark mode
function useDarkMode() {
  const [theme, setTheme] = useState(
    localStorage.getItem("theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"),
  );

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = theme === "dark";

    root.classList.remove(isDark ? "light" : "dark");
    root.classList.add(theme);

    localStorage.setItem("theme", theme);
  }, [theme]);

  return [theme, setTheme] as const;
}

export default function Navbar() {
  const navigate = useNavigate();
  const [theme, setTheme] = useDarkMode();

  const isLoggedIn = localStorage.getItem("authToken");

  const logoutHandler = async () => {
    localStorage.removeItem("userData");
    localStorage.removeItem("authToken");
    navigate("/auth/login");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav className="max-w-[1344px] mx-auto bg-transparent backdrop-blur-xl shadow-md border dark:border-gray-700 rounded-xl sticky top-4 z-40">
      <div className="px-4 ">
        <div className="flex items-center justify-between h-16">
          <Link to="/">
            <h2 className="text-2xl">Bettermode</h2>
          </Link>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="p-2 rounded-full"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? <Sun width={24} height={24} /> : <Moon />}
            </Button>
            {isLoggedIn ? (
              <>
                <Popover>
                  <PopoverTrigger>
                    <Button
                      variant="outline"
                      size="icon"
                      className="p-2 rounded-full"
                      aria-label="User menu"
                    >
                      <User width={24} height={24} />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent>
                    <div className="w-full h-full flex flex-col gap-2">
                      <Button
                        variant="ghost"
                        className="px-4 w-full flex items-center justify-center"
                        aria-label="Go to logout page"
                        onClick={logoutHandler}
                      >
                        <LogOut width={24} height={24} />
                        Log out
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>
              </>
            ) : (
              <>
                <a href="/auth/login">
                  <Button
                    variant="outline"
                    className="px-4 rounded-full"
                    aria-label="Go to login page"
                  >
                    Log in
                  </Button>
                </a>
                <a href="/auth/signup">
                  <Button
                    variant="default"
                    className="px-4 rounded-full"
                    aria-label="Go to signup page"
                  >
                    Sign up
                  </Button>
                </a>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
