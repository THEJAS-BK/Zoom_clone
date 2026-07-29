import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axios";

export default function NavBar({setMyImageInterfaceOpen,scrollToBoards}:{setMyImageInterfaceOpen: (open: boolean) => void, scrollToBoards: () => void}) {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);
  const [user, setUser] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 10) {
        setVisible(true);
      } else if (currentScrollY > lastScrollY.current) {
        setVisible(false);
      } else {
        setVisible(true);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    api.get("users/me").then((res) => setUser(res.data.name));
  }, []);

  // close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error(err);
    } finally {
      navigate("/login");
    }
  };

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 bg-gray-950 border-b border-gray-800 flex items-center justify-between py-4 px-8 md:px-22 transition-transform duration-300 ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="flex items-center gap-8">
        <h2 className="text-xl font-bold text-white tracking-tight">Syncvas</h2>
        <a
       onClick={scrollToBoards}
          className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
        >
          My boards
        </a>
      </div>
      <div className="flex items-center gap-3 relative" ref={dropdownRef}>
         <span className="text-sm font-medium text-gray-300">
                    {user}
                </span>
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="w-8 h-8 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center text-sm font-medium"
        >
          {user.charAt(0)}
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 top-10 w-44 bg-white border border-gray-200 rounded-lg shadow-lg py-2 text-sm">
            <button
              onClick={() => {
                setDropdownOpen(false);
                setMyImageInterfaceOpen(true);
              }}
              className="w-full text-left px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
            >
              My images
            </button>
            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 text-gray-600  hover:text-red-500 hover:bg-gray-50 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
