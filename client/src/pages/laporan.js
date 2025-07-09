import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Menu from "../components/Menu";
import Header from "../components/Header";

function Laporan() {
  const [laporans, setLaporans] = useState([]);
  const [selectedJenis, setSelectedJenis] = useState('all');
  const [isAdmin, setIsAdmin] = useState(false);
  const [formData, setFormData] = useState({
    mulai_tanggal: '',
    sampai_tanggal: '',
    Judul: '',
    jenis_laporan: ''
  });
  const [loading, setLoading] = useState(false);

  const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;

  // Fetch user profile untuk mendapatkan role
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const nik = localStorage.getItem("nik");
      const response = await axios.get(`${BACKEND_API_URL}/user/${nik}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userData = response.data.profileData;
      // Set admin status berdasarkan role
      setIsAdmin(userData.role === "Admin");
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Fetch data laporan
  const fetchLaporans = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${BACKEND_API_URL}/laporan`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLaporans(response.data.data);
    } catch (error) {
      console.error('Error fetching laporans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchLaporans();
  }, []);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      await axios.post(`${BACKEND_API_URL}/laporan`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Laporan berhasil dibuat!');
      setFormData({
        mulai_tanggal: '',
        sampai_tanggal: '',
        Judul: '',
        jenis_laporan: ''
      });
      fetchLaporans(); // Refresh data
    } catch (error) {
      console.error('Error creating laporan:', error);
      alert('Gagal membuat laporan');
    } finally {
      setLoading(false);
    }
  };

  // Filter laporan berdasarkan jenis
  const filteredLaporans = selectedJenis === 'all' 
    ? laporans 
    : laporans.filter(laporan => laporan.jenis_laporan === selectedJenis);

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Navigate to preview
  const handlePreview = (id_laporan) => {
    window.open(`/view-laporan/${id_laporan}`, '_blank');
  };

  // Handle delete laporan
  const handleDelete = async (id_laporan) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus laporan ini?')) {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        await axios.delete(`${BACKEND_API_URL}/laporan/${id_laporan}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert('Laporan berhasil dihapus!');
        fetchLaporans(); // Refresh data
      } catch (error) {
        console.error('Error deleting laporan:', error);
        alert('Gagal menghapus laporan');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Menu />
      <div className="flex flex-col flex-1 p-4 lg:ml-48 transition-all duration-200">
        <Header />
        <div className="">
          {/* Component 1: Form Admin */}
          {isAdmin && (
            <div className="bg-white shadow-md rounded-lg p-6 mt-2">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Buat Laporan Baru</h2>
                          <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Mulai
                  </label>
                  <input
                    type="date"
                    name="mulai_tanggal"
                    value={formData.mulai_tanggal}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hingga Tanggal
                  </label>
                  <input
                    type="date"
                    name="sampai_tanggal"
                    value={formData.sampai_tanggal}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jenis Laporan
                  </label>
                  <select
                    name="jenis_laporan"
                    value={formData.jenis_laporan}
                    onChange={handleInputChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="">Pilih jenis laporan</option>
                    <option value="Surat Masuk">Surat Masuk</option>
                    <option value="Surat Keluar">Surat Keluar</option>
                    <option value="Disposisi">Disposisi</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Judul Laporan
                  </label>
                  <input
                    type="text"
                    name="Judul"
                    value={formData.Judul}
                    onChange={handleInputChange}
                    required
                    placeholder="Masukkan judul laporan"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {loading ? 'Mengirim...' : 'Kirim Laporan'}
                  </button>
                </div>
              </div>
            </form>
            </div>
          )}

          {/* Component 2: Daftar Laporan */}
          <div className="bg-white shadow-md rounded-lg p-6 mt-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4 sm:mb-0">Daftar Laporan</h2>
              <div className="flex items-center space-x-4">
                <label className="text-sm font-medium text-gray-700">Filter Jenis:</label>
                <select
                  value={selectedJenis}
                  onChange={(e) => setSelectedJenis(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">Semua Jenis</option>
                  <option value="Surat Masuk">Surat Masuk</option>
                  <option value="Surat Keluar">Surat Keluar</option>
                  <option value="Disposisi">Disposisi</option>
                </select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                <p className="mt-2 text-gray-600">Memuat data...</p>
              </div>
            ) : filteredLaporans.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Tidak ada laporan ditemukan</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tanggal Mulai
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hingga Tanggal
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Judul
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jenis
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredLaporans.map((laporan) => (
                      <tr key={laporan.id_laporan} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(laporan.mulai_tanggal)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(laporan.sampai_tanggal)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {laporan.Judul}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            laporan.jenis_laporan === 'Surat Masuk' ? 'bg-blue-100 text-blue-800' :
                            laporan.jenis_laporan === 'Surat Keluar' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {laporan.jenis_laporan}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handlePreview(laporan.id_laporan)}
                              className="text-green-600 hover:text-green-900 bg-green-100 hover:bg-green-200 px-3 py-1 rounded-md transition-colors"
                            >
                              Preview
                            </button>
                            <button
                              onClick={() => handleDelete(laporan.id_laporan)}
                              className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-md transition-colors"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Laporan;