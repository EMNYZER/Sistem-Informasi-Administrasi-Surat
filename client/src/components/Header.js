import React from "react";
import { useNavigate } from "react-router-dom"; // Untuk navigasi setelah logout
import { MdExitToApp } from "react-icons/md";
function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm("Apakah Anda yakin ingin keluar?")) {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      navigate("/");
    }
  };

  return (
    <header className="top-0 right-0 left-64 h-12 bg-white shadow-md flex items-center px-6 ">
      <button
        onClick={handleLogout}
        className="flex items-center px-4 py-2 text-m font-medium text-black bg-white rounded-md hover:text-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ml-auto"
      >
        <MdExitToApp size={24} className="mr-2" />
        Keluar
      </button>
    </header>
  );
}

export default Header;
