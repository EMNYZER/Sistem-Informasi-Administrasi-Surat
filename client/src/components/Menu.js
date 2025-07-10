import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import profile_pic from "../assets/profile.jpg";
import { MdDashboard, MdSettings, MdMail } from "react-icons/md";
import { FaFile, FaUser } from "react-icons/fa6";


function Menu() {
  const [userData, setUserData] = useState({
    name: "",
    nik: "",
    profileImage: "",
    role: "",
  });
  const [expandedMenu, setExpandedMenu] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  
  useEffect(() => {
    const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;
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

        const response = await axios.get(`${BACKEND_API_URL}/user/${nik}`, {
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
      { name: "Dashboard", path: "/dashboard", icon: <MdDashboard/> },
      {
        name: "Pengaturan",
        icon: <MdSettings/>,
        submenu: [
          { name: "Profile", path: "/profile" },
          { name: "Data Pegawai", path: "/pegawai" },
          { name: "Data Murid", path: "/murid" },
          { name: "Template Surat", path: "/template-surat" },
          { name: "Jabatan & Disposisi", path: "/jabatan" },
          { name: "Kategori Surat", path: "/pengaturan-surat" },
        ],
      },
      {
        name: "Surat",
        icon: <MdMail/>,
        submenu: [
          { name: "Surat Keluar", path: "/surat-keluar" },
          { name: "Surat Masuk", path: "/surat-masuk" },
          { name: "Disposisi Saya", path: "/daftar-disposisi" },
          { name: "Verifikasi Surat", path: "/verifikasi" },
        ],
      },
      { name: "Laporan", path: "/laporan", icon: <FaFile/> },
    ],
    User: [
      { name: "Dashboard", path: "/dashboard", icon: <MdDashboard/> },
      {
        name: "Profile",
        path: "/profile",
        icon: <FaUser/>
      },
      {
        name: "Surat",
        icon: <MdMail/>,
        submenu: [
          { name: "Surat Keluar", path: "/surat-keluar" },
          { name: "Disposisi Saya", path: "/daftar-disposisi" },
        ],
      },
    ],
    Approval: [
      { name: "Dashboard", path: "/dashboard", icon: <MdDashboard/> },
      {
        name: "Profile",
        path: "/profile",
        icon: <FaUser/>
      },
      {
        name: "Surat",
        icon: <MdMail/>,
        submenu: [
          { name: "Buat Surat Keluar", path: "/surat-keluar" },
          { name: "Surat Masuk", path: "/surat-masuk" },
          { name: "Pengesahan Surat", path: "/pengesahan" },
        ],
      },
      { name: "Laporan", path: "/laporan", icon: <FaFile/> },
    ],
  };

  const toggleSubmenu = (menuName) => {
    setExpandedMenu(expandedMenu === menuName ? null : menuName);
  };

  const Hamburger = () => (
    <button
      className="lg:hidden fixed top-4 left-4 z-50 bg-gray-900 p-2 rounded-md shadow-md focus:outline-none"
      onClick={() => setMobileOpen(true)}
      aria-label="Open menu"
    >
      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  );

  const Overlay = () => (
    <div
      className={`fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity duration-300 ${mobileOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      onClick={() => setMobileOpen(false)}
    />
  );

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b border-green-700/30">
        <div className="flex flex-col items-center">
          <div className="relative">
            <img
              src={userData.profileImage}
              alt="Profile"
              className="w-24 h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 object-cover mb-2 rounded-full border-2 border-green-700/40"
            />
          </div>
          <h2 className="text-base font-bold text-white mt-2 text-center">
            {userData.name}
          </h2>
          <p className="text-xs text-green-100 mt-2 text-center">
            {userData.nik}
          </p>
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
                            onClick={() => {
                              navigate(subItem.path);
                              setMobileOpen(false);
                            }}
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
                  onClick={() => {
                    navigate(item.path);
                    setMobileOpen(false);
                  }}
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
    </>
  );

  return (
    <>
      <Hamburger />
      {mobileOpen && <Overlay />}
      <div className="hidden lg:block bg-gray-900 h-screen w-48 shadow-xl text-white fixed z-30">
        <SidebarContent />
      </div>
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-gray-900 shadow-xl text-white z-50 transform transition-transform duration-300 lg:hidden ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
        style={{ maxWidth: "80vw" }}
      >
        <button
          className="absolute top-4 right-4 text-white text-2xl focus:outline-none"
          onClick={() => setMobileOpen(false)}
          aria-label="Close menu"
        >
          &times;
        </button>
        <SidebarContent />
      </div>
    </>
  );
}

export default Menu;
