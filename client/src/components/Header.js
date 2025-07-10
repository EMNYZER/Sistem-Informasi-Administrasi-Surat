import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Untuk navigasi setelah logout
import { MdExitToApp } from "react-icons/md";

function Header() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("nik");
    navigate("/");
  };

  return (
    <>
      <header className="top-0 right-0 left-64 h-12 bg-white shadow-md flex items-center px-6 ">
        <button
          onClick={() => setShowLogoutModal(true)}
          className="flex items-center px-4 py-2 text-m font-medium text-black bg-white rounded-md hover:text-red-500 focus:text-red-500   ml-auto"
        >
          <MdExitToApp size={24} className="mr-2" />
          Keluar
        </button>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-xl w-[90%] max-w-md p-6">
            
            <div className="mb-6">
              <p className="text-sm text-gray-600">
                Apakah Anda yakin ingin keluar dari sistem? Anda akan diarahkan ke halaman utama.
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
