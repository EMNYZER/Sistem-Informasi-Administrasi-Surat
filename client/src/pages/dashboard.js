import React, { useState, useEffect } from 'react';
import Menu from '../components/Menu';
import Header from '../components/Header';
import { Outlet } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const [userProfile, setUserProfile] = useState({
    role: '',
    nama: '',
    jabatan: ''
  });
  const [stats, setStats] = useState({
    pengajuan: 0,
    verifikasi: 0,
    disposisi: 0,
    disetujui: 0,
    suratMasuk: 0,
    pengesahan: 0
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const nik = localStorage.getItem('nik');
        const response = await axios.get(`http://localhost:3001/user/${nik}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(response.data.profileData);
        setUserProfile({
          role: response.data.profileData.role,
          nama: response.data.profileData.nama,
          jabatan: response.data.profileData.jabatan
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`http://localhost:3001/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchUserProfile();
    fetchStats();
  }, []);

  const Card = ({ title, value, icon, color, bgColor}) => (
    <div className={`rounded-xl shadow-sm hover:shadow-md transition-all duration-300 p-6 border-l-4 ${color} ${bgColor}`}>
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
      case 'Admin':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card 
              title="Pengajuan" 
              value={stats.pengajuan} 
              icon="📝" 
              color="border-blue-500"
              bgColor="bg-blue-100"
            />
            <Card 
              title="Verifikasi" 
              value={stats.verifikasi} 
              icon="✓" 
              color="border-yellow-500"
              bgColor="bg-yellow-100"
            />
            <Card 
              title="Disposisi" 
              value={stats.disposisi} 
              icon="↪️" 
              color="border-purple-500"
              bgColor="bg-purple-100"
            />
            <Card 
              title="Disetujui" 
              value={stats.disetujui} 
              icon="✅" 
              color="border-green-500"
              bgColor="bg-green-100"
            />
          </div>
        );
      case 'Approval':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card 
              title="Pengajuan" 
              value={stats.pengajuan} 
              icon="📝" 
              color="border-blue-500"
              bgColor="bg-blue-100"
            />
            <Card 
              title="Surat Masuk" 
              value={stats.suratMasuk} 
              icon="📨" 
              color="border-orange-500"
              bgColor="bg-orange-200"
            />
            <Card 
              title="Pengesahan" 
              value={stats.pengesahan} 
              icon="✍️" 
              color="border-red-500"
              bgColor="bg-red-200"
            />
            <Card 
              title="Disetujui" 
              value={stats.disetujui} 
              icon="✅" 
              color="border-green-500"
              bgColor="bg-green-200"
            />
          </div>
        );
      case 'User':
      case 'Deputi':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card 
              title="Pengajuan" 
              value={stats.pengajuan} 
              icon="📝" 
              color="border-blue-500"
              bgColor="bg-blue-200"
            />
            <Card 
              title="Disposisi" 
              value={stats.disposisi} 
              icon="↪️" 
              color="border-purple-500"
              bgColor="bg-purple-200"
            />
            <Card 
              title="Disetujui" 
              value={stats.disetujui} 
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
      <div className="flex flex-col flex-1 p-4">
        <Header />
        <div className="bg-white shadow-md rounded-lg p-6 mt-2">
          {renderCards()}
          <div className="mt-6">
            <p className="text-gray-500 text-sm">
              Selamat datang {userProfile.nama}, Anda login sebagai {userProfile.role} - {userProfile.jabatan?.nama_jabatan || '-'}
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