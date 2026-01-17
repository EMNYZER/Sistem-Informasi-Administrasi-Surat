import React, { useEffect, useState } from "react";
import Menu from "../components/Menu";
import axios from "axios";
import { FaTrash, FaEye } from "react-icons/fa";

const RiwayatDisposisi = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;
    const fetchData = async () => {
      try {
        const res = await axios.get(`${BACKEND_API_URL}/disposisi`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setData(res.data);
      } catch (err) {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePreview = (id) => {
    window.open(`/view-disposisi/${id}`, '_blank');
  };

  const handleDelete = async (id) => {
    const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;
    
    if (window.confirm('Apakah Anda yakin ingin menghapus disposisi ini?')) {
      try {
        await axios.delete(`${BACKEND_API_URL}/disposisi/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        
        // Refresh data setelah hapus
        const res = await axios.get(`${BACKEND_API_URL}/disposisi`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setData(res.data);
        
        alert('Disposisi berhasil dihapus');
      } catch (err) {
        console.error('Error deleting disposisi:', err);
        alert('Gagal menghapus disposisi');
      }
    }
  };

  // Fungsi badge status disposisi
  const getStatusBadge = (status) => {
    if (status === 'Selesai') {
      return <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-700">Selesai</span>;
    } else if (status === 'Diteruskan') {
      return <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-700">Diteruskan</span>;
    } else {
      return <span className="px-2 py-1 rounded text-xs font-semibold bg-yellow-100 text-yellow-700">Menunggu</span>;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Menu />
      <div className="flex flex-col flex-1 p-4 lg:ml-48 transition-all duration-200">
        <div className="bg-white shadow-sm rounded-lg p-5 mt-2">
          <h1 className="text-xl font-semibold text-gray-800 mb-4">Riwayat Disposisi</h1>
          {loading ? (
            <div className="text-center py-10 text-gray-400">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Tanggal Disposisi</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Nomor Surat</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Perihal</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Jabatan Penerima</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-gray-400">Tidak ada data disposisi</td>
                    </tr>
                  ) : (
                    data.map((item) => (
                      <tr key={item.id_disposisi}>
                        <td className="px-4 py-2 whitespace-nowrap">{formatDate(item.tanggal_disposisi)}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{item.suratMasuk?.nomor_surat || '-'}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{item.suratMasuk?.perihal || '-'}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{item.jabatan_penerima}</td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {getStatusBadge(item.status_disposisi)}
                        </td>
                        <td className="px-4 py-2 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handlePreview(item.id_disposisi)}
                                className="text-blue-600 hover:text-blue-800"
                              title="Preview"
                            >
                              <FaEye />
                            </button>
                            <button
                              onClick={() => handleDelete(item.id_disposisi)}
                              className="text-red-600 hover:text-red-800"
                              title="Hapus"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RiwayatDisposisi;