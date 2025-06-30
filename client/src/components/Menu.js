import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import profile_pic from "../assets/profile.jpg";

function Menu() {
  const [userData, setUserData] = useState({
    name: "",
    nik: "",
    profileImage: "",
    role: "",
  });
  const [expandedMenu, setExpandedMenu] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }

        const nik = localStorage.getItem("nik");
        if (!nik) {
          navigate("/login");
          return;
        }

        const response = await axios.get(`http://localhost:3001/user/${nik}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserData({
          name: response.data.profileData.nama,
          nik: response.data.profileData.NIK,
          profileImage:
            response.data.profileData.profile_picture ||
            profile_pic,
          role: response.data.profileData.role,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
        navigate("/login");
      }
    };

    fetchUserData();
  }, [navigate]);

  const menuItems = {
    Admin: [
      { name: "Dashboard", path: "/dashboard", icon: "📊" },
      {
        name: "Pengaturan",
        icon: "⚙️",
        submenu: [
          { name: "Profile", path: "/profile" },
          { name: "Pegawai", path: "/pegawai" },
          { name: "Murid", path: "/murid" },
          { name: "Template", path: "/template-surat" },
          { name: "Jabatan", path: "/jabatan" },
          { name: "Surat", path: "/pengaturan-surat" },
        ],
      },
      {
        name: "Surat",
        icon: "📝",
        submenu: [
          { name: "Surat Keluar", path: "/surat-keluar" },
          { name: "Disposisi", path: "/disposisi" },
          { name: "Surat Masuk", path: "/surat-masuk" },
          { name: "Verifikasi", path: "/verifikasi" },
        ],
      },
      { name: "Laporan", path: "/laporan", icon: "📋" },
    ],
    User: [
      { name: "Dashboard", path: "/dashboard", icon: "📊" },
      {
        name: "Pengaturan",
        icon: "⚙️",
        submenu: [{ name: "Profile", path: "/profile" }],
      },
      {
        name: "Surat",
        icon: "📝",
        submenu: [
          { name: "Surat Keluar", path: "/surat-keluar" },
          { name: "Disposisi", path: "/disposisi" },
        ],
      },
    ],
    Approval: [
      { name: "Dashboard", path: "/dashboard", icon: "📊" },
      {
        name: "Pengaturan",
        icon: "⚙️",
        submenu: [
          { name: "Profile", path: "/profile" },
          { name: "Tanda tangan", path: "/sign" },
        ],
      },
      {
        name: "Surat",
        icon: "📝",
        submenu: [
          { name: "Surat Keluar", path: "/surat-keluar" },
          { name: "Disposisi", path: "/disposisi" },
          { name: "Pengesahan", path: "/pengesahan" },
        ],
      },
      { name: "Laporan", path: "/laporan", icon: "📋" },
    ],
    Deputi: [
      { name: "Dashboard", path: "/dashboard", icon: "📊" },
      {
        name: "Pengaturan",
        icon: "⚙️",
        submenu: [{ name: "Profile", path: "/profile" }],
      },
      {
        name: "Surat",
        icon: "📝",
        submenu: [
          { name: "Surat Keluar", path: "/surat-keluar" },
          { name: "Disposisi", path: "/disposisi" },
        ],
      },
    ],
  };

  const toggleSubmenu = (menuName) => {
    setExpandedMenu(expandedMenu === menuName ? null : menuName);
  };

  return (
    <div className="bg-gray-900 h-screen w-48 shadow-xl text-white">
      <div className="p-4 border-b border-green-700/30">
        <div className="flex flex-col items-center">
          <div className="relative">
            <img
              src={userData.profileImage}
              alt="Profile"
              className="w-32 h-32 object-cover mb-2 "
            />
            {/* <div className="absolute bottom-2 right-2 w-3 h-3 bg-green-500 rounded-full ring-2 ring-green-900"></div> */}
          </div>
          <h2 className="text-s font-bold text-white mt-2 text-center">
            {userData.name}
          </h2>
          <p className="text-xs text-green-100 mt-2 text-center">
            {userData.nik}
          </p>
          {/* <p className="text-xs text-green-400/90 capitalize mt-3 px-3 py-1 rounded-full bg-green-800/50">
            {userData.role}
          </p> */}
        </div>
      </div>

      <nav className="p-3">
        <ul className="space-y-1">
          {menuItems[userData.role]?.map((item, index) => (
            <li key={index}>
              {item.submenu ? (
                <div>
                  <button
                    onClick={() => toggleSubmenu(item.name)}
                    className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-green-700/50 transition-all duration-200 text-sm group"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-small group-hover:scale-110 transition-transform">
                        {item.icon}
                      </span>
                      <span className="font-medium">{item.name}</span>
                    </div>
                  </button>
                  {expandedMenu === item.name && (
                    <ul className="ml-6 mt-1 space-y-1 animate-fadeIn">
                      {item.submenu.map((subItem, subIndex) => (
                        <li key={subIndex}>
                          <button
                            onClick={() => navigate(subItem.path)}
                            className="w-full text-left p-2 rounded-lg hover:bg-green-700/30 transition-all duration-200 text-xs text-green-100/90 hover:text-white"
                          >
                            {subItem.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => navigate(item.path)}
                  className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-green-700/50 transition-all duration-200 text-sm group"
                >
                  <span className="text-small group-hover:scale-110 transition-transform">
                    {item.icon}
                  </span>
                  <span className="font-medium">{item.name}</span>
                </button>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default Menu;
