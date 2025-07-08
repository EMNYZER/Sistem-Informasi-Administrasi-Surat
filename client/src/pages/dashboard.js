import React, { useState, useEffect } from "react";
import Menu from "../components/Menu";
import Header from "../components/Header";
import { Outlet } from "react-router-dom";
import axios from "axios";

function Dashboard() {
  const [userProfile, setUserProfile] = useState({
    role: "",
    nama: "",
    jabatan: "",
  });
  const [adminStats, setAdminStats] = useState({
    pengajuanSaya: 0,
    verifikasiSurat: 0,
    disposisiSaya: 0,
    suratKeluar: 0,
    suratMasuk: 0,
    pegawai: 0,
    murid: 0,
  });
  const [stats, setStats] = useState({
    pengajuan: 0,
    verifikasi: 0,
    disposisi: 0,
    disetujui: 0,
    suratMasuk: 0,
    pengesahan: 0,
  });
  const [approvalStats, setApprovalStats] = useState({
    pengajuanSaya: 0,
    suratMasuk: 0,
    disposisi: 0,
    pengesahanSurat: 0,
  });
  const [userStats, setUserStats] = useState({
    pengajuanSaya: 0,
    disposisiSaya: 0,
    suratDisetujui: 0,
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const nik = localStorage.getItem("nik");
        const response = await axios.get(`http://localhost:3001/user/${nik}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserProfile({
          role: response.data.profileData.role,
          nama: response.data.profileData.nama,
          jabatan: response.data.profileData.jabatan,
        });
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    // Fetch all admin stats in parallel
    const fetchAdminStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const nik = localStorage.getItem("nik");
        const headers = { Authorization: `Bearer ${token}` };
        const [
          pengajuanSayaRes,
          verifikasiSuratRes,
          disposisiSayaRes,
          suratKeluarRes,
          suratMasukRes,
          pegawaiRes,
          muridRes
        ] = await Promise.all([
          axios.get(`http://localhost:3001/suratKeluar/nik/${nik}`, { headers }),
          axios.get(`http://localhost:3001/suratKeluar/status/diajukan`, { headers }),
          axios.get(`http://localhost:3001/disposisi/nik/${nik}`, { headers }),
          axios.get(`http://localhost:3001/suratKeluar/status/disetujui`, { headers }),
          axios.get(`http://localhost:3001/suratMasuk/`, { headers }),
          axios.get(`http://localhost:3001/user/`, { headers }),
          axios.get(`http://localhost:3001/murid/`, { headers }),
        ]);
        setAdminStats({
          pengajuanSaya: pengajuanSayaRes.data.length,
          verifikasiSurat: verifikasiSuratRes.data.length,
          disposisiSaya: disposisiSayaRes.data.length,
          suratKeluar: suratKeluarRes.data.length,
          suratMasuk: suratMasukRes.data.length,
          pegawai: pegawaiRes.data.length,
          murid: muridRes.data.length,
        });
      } catch (error) {
        setAdminStats({
          pengajuanSaya: 0,
          verifikasiSurat: 0,
          disposisiSaya: 0,
          suratKeluar: 0,
          suratMasuk: 0,
          pegawai: 0,
          murid: 0,
        });
        console.error("Error fetching admin stats:", error);
      }
    };

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(
          `http://localhost:3001/dashboard/stats`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    // Fetch all approval stats in parallel
    const fetchApprovalStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const nik = localStorage.getItem("nik");
        const headers = { Authorization: `Bearer ${token}` };
        const [
          pengajuanSayaRes,
          suratMasukBelumRes,
          suratMasukDisposisiRes,
          disposisiRes,
          pengesahanSuratRes
        ] = await Promise.all([
          axios.get(`http://localhost:3001/suratKeluar/nik/${nik}`, { headers }),
          axios.get(`http://localhost:3001/suratMasuk/status/Belum`, { headers }),
          axios.get(`http://localhost:3001/suratMasuk/status/Disposisi`, { headers }),
          axios.get(`http://localhost:3001/disposisi/`, { headers }),
          axios.get(`http://localhost:3001/suratKeluar/status/diproses`, { headers }),
        ]);
        setApprovalStats({
          pengajuanSaya: pengajuanSayaRes.data.length,
          suratMasuk: suratMasukBelumRes.data.length + suratMasukDisposisiRes.data.length,
          disposisi: disposisiRes.data.length,
          pengesahanSurat: pengesahanSuratRes.data.length,
        });
      } catch (error) {
        setApprovalStats({
          pengajuanSaya: 0,
          suratMasuk: 0,
          disposisi: 0,
          pengesahanSurat: 0,
        });
        console.error("Error fetching approval stats:", error);
      }
    };

    // Fetch all user stats in parallel
    const fetchUserStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const nik = localStorage.getItem("nik");
        const headers = { Authorization: `Bearer ${token}` };
        const [
          pengajuanSayaRes,
          disposisiSayaRes
        ] = await Promise.all([
          axios.get(`http://localhost:3001/suratKeluar/nik/${nik}`, { headers }),
          axios.get(`http://localhost:3001/disposisi/nik/${nik}`, { headers }),
        ]);
        const pengajuanSaya = pengajuanSayaRes.data.length;
        const suratDisetujui = pengajuanSayaRes.data.filter(surat => surat.status === "disetujui").length;
        setUserStats({
          pengajuanSaya,
          disposisiSaya: disposisiSayaRes.data.length,
          suratDisetujui,
        });
      } catch (error) {
        setUserStats({
          pengajuanSaya: 0,
          disposisiSaya: 0,
          suratDisetujui: 0,
        });
        console.error("Error fetching user stats:", error);
      }
    };

    fetchUserProfile();
    fetchAdminStats();
    fetchStats();
    fetchApprovalStats();
    fetchUserStats();
  }, []);

  const Card = ({ title, value, icon, color, bgColor }) => (
    <div
      className={`rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border-l-4 ${color} ${bgColor}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <h3 className="text-2xl font-bold mt-1 text-gray-800">{value}</h3>
        </div>
        <div className={`p-3 rounded-lg bg-opacity-10 ${color}`}>
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  const renderCards = () => {
    switch (userProfile.role) {
      case "Admin":
        return (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-6 mb-6">
              <Card
                title="Surat Keluar"
                value={adminStats.suratKeluar}
                icon="📤"
                color="border-green-500"
                bgColor="bg-green-100"
              />
              <Card
                title="Surat Masuk"
                value={adminStats.suratMasuk}
                icon="📥"
                color="border-orange-500"
                bgColor="bg-orange-100"
              />
              <Card
                title="Pegawai"
                value={adminStats.pegawai}
                icon="👨‍💼"
                color="border-cyan-500"
                bgColor="bg-cyan-100"
              />
              <Card
                title="Murid"
                value={adminStats.murid}
                icon="👦"
                color="border-pink-500"
                bgColor="bg-pink-100"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
              <Card
                title="Pengajuan Saya"
                value={adminStats.pengajuanSaya}
                icon="📝"
                color="border-blue-500"
                bgColor="bg-blue-100"
              />
              <Card
                title="Verifikasi Surat"
                value={adminStats.verifikasiSurat}
                icon="🔎"
                color="border-yellow-500"
                bgColor="bg-yellow-100"
              />
              <Card
                title="Disposisi Saya"
                value={adminStats.disposisiSaya}
                icon="↪️"
                color="border-purple-500"
                bgColor="bg-purple-100"
              />
            </div>
          </div>
        );
      case "Approval":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card
              title="Pengajuan Saya"
              value={approvalStats.pengajuanSaya}
              icon="📝"
              color="border-blue-500"
              bgColor="bg-blue-100"
            />
            <Card
              title="Surat Masuk"
              value={approvalStats.suratMasuk}
              icon="📨"
              color="border-orange-500"
              bgColor="bg-orange-200"
            />
            <Card
              title="Disposisi"
              value={approvalStats.disposisi}
              icon="↪️"
              color="border-purple-500"
              bgColor="bg-purple-200"
            />
            <Card
              title="Pengesahan Surat"
              value={approvalStats.pengesahanSurat}
              icon="✍️"
              color="border-green-500"
              bgColor="bg-green-200"
            />
          </div>
        );
      case "User":
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card
              title="Pengajuan Saya"
              value={userStats.pengajuanSaya}
              icon="📝"
              color="border-blue-500"
              bgColor="bg-blue-200"
            />
            <Card
              title="Disposisi Saya"
              value={userStats.disposisiSaya}
              icon="↪️"
              color="border-purple-500"
              bgColor="bg-purple-200"
            />
            <Card
              title="Surat Disetujui"
              value={userStats.suratDisetujui}
              icon="✅"
              color="border-green-500"
              bgColor="bg-green-200"
            />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Menu />
      <div className="flex flex-col flex-1 p-4 lg:ml-48 transition-all duration-200">
        <Header />
        <div className="bg-white shadow-md rounded-lg p-6 mt-2">
          {renderCards()}
          <div className="mt-6">
            <p className="text-gray-500 text-sm">
              Selamat datang <strong>{userProfile.nama}</strong>, Anda login sebagai <strong>{userProfile.role}</strong> - <strong>{userProfile.jabatan?.nama_jabatan || "-"}</strong>
            </p>
          </div>
          <div className="mt-6">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
