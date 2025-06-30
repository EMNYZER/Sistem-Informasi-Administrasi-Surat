import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Menu from "../components/Menu";
import axios from "axios";
import { FaEdit, FaTrash, FaEye, FaFilePdf, FaPlus } from "react-icons/fa";

function SuratMasuk() {
  const navigate = useNavigate();
  const [suratMasuk, setSuratMasuk] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuratMasuk();
  }, []);

  const fetchSuratMasuk = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await axios.get("http://localhost:3001/suratMasuk", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSuratMasuk(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching surat masuk:", error);
      if (error.response && error.response.status === 401) {
        navigate("/login");
      }
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus surat masuk ini?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:3001/suratMasuk/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchSuratMasuk(); // Refresh data after delete
      } catch (error) {
        console.error("Error deleting surat masuk:", error);
        alert("Gagal menghapus surat.");
      }
    }
  };

  const handleEdit = (id) => {
    // Navigate to a form page, assuming the route is something like this
    navigate(`/catat-surat/${id}`);
  };

  const handleViewDocument = (fileUrl) => {
    if (fileUrl) {
      // Construct the full URL if a relative path is stored
      const fullUrl = `http://localhost:3001/${fileUrl}`;
      window.open(fullUrl, "_blank");
    } else {
      alert("File dokumen tidak tersedia.");
    }
  };

  const handleDetail = (id) => {
    // Navigate to a detail page
    navigate(`/detail-surat-masuk/${id}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      Belum: {
        color: "bg-yellow-100 text-yellow-800",
        text: "Belum Didisposisi",
      },
      disposisi: { color: "bg-blue-100 text-blue-800", text: "Didisposisi" },
      Selesai: { color: "bg-green-100 text-green-800", text: "Selesai" },
      Revisi: { color: "bg-orange-100 text-orange-800", text: "Revisi" },
    };

    const config =
      statusConfig[status] || {
        color: "bg-gray-100 text-gray-800",
        text: "Unknown",
      };
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Menu />
      <div className="flex flex-col flex-1 p-4 lg:ml-48 transition-all duration-200">
        <Header />
        <div className="bg-white shadow-sm rounded-lg p-5 mt-2">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-semibold text-gray-800">
              Data Surat Masuk
            </h1>
            <button
              onClick={() => navigate("/catat-surat")}
              className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <FaPlus /> Tambah Surat
            </button>
          </div>

          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tgl. Terima
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nomor Agenda
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nomor Surat
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Asal Surat
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Perihal
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {suratMasuk.map((item) => (
                    <tr key={item.id_surat}>
                      <td className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
                        {formatDate(item.tanggal_terima)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {item.nomor_agenda}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {item.nomor_surat}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {item.asal}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {item.perihal}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {getStatusBadge(item.status_disposisi)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900 flex gap-2 items-center">
                        <button
                          onClick={() => handleEdit(item.id_surat)}
                          className="text-yellow-600 hover:text-yellow-800"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleViewDocument(item.file_surat)}
                          className="text-blue-600 hover:text-blue-800"
                          title="Lihat Dokumen"
                        >
                          <FaFilePdf />
                        </button>
                        <button
                          onClick={() => handleDetail(item.id_surat)}
                          className="text-indigo-600 hover:text-indigo-800"
                          title="Detail"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id_surat)}
                          className="text-red-600 hover:text-red-800"
                          title="Hapus"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && suratMasuk.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data surat masuk
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SuratMasuk;