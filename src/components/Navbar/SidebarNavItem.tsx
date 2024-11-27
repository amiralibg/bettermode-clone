import { cn } from "@/lib/utils";
import { NavLink } from "react-router-dom";

function SidebarNavItem({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <li>
      <NavLink
        to={to}
        className={({ isActive }) =>
          cn(
            "flex items-center p-3 hover:bg-blue-50 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors duration-200 rounded-lg",
            {
              "bg-gray-300 text-black dark:bg-gray-800 dark:text-white":
                isActive,
            },
          )
        }
      >
        <span className="flex items-center">
          {icon}
          <span className="ml-3">{label}</span>
        </span>
      </NavLink>
    </li>
  );
}

export default SidebarNavItem;
