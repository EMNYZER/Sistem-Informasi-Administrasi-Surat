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
  const [role, setRole] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSurat, setSelectedSurat] = useState(null);

  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const token = localStorage.getItem("token");
        const nik = localStorage.getItem("nik");
        if (!token || !nik) return;
        const response = await axios.get(`http://localhost:3001/user/${nik}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRole(response.data.profileData.role);
      } catch (error) {
        setRole("");
      }
    };
    fetchUserRole();
  }, []);

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

  const handleDelete = async (id_surat) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus surat masuk ini?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:3001/suratMasuk/${id_surat}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchSuratMasuk(); // Refresh data after delete
      } catch (error) {
        console.error("Error deleting surat masuk:", error);
        alert("Gagal menghapus surat.");
      }
    }
  };

  const handleEdit = (id_surat) => {
    // Navigate to a form page, assuming the route is something like this
    navigate(`/catat-surat/${id_surat}`);
  };

  const handleViewDocument = (fileUrl) => {
    if (fileUrl) {
      const filename = fileUrl.split("/").pop();
      const fullUrl = `http://localhost:3001/view-pdf/${filename}`;
      window.open(fullUrl, "_blank", "noopener,noreferrer");
    } else {
      alert("File dokumen tidak tersedia.");
    }
  };
  

  const handleDetail = (id) => {
    const surat = suratMasuk.find(item => item.id_surat === id);
    setSelectedSurat(surat);
    setShowDetailModal(true);
  };

  const handleTambahDisposisi = (id_surat) => {
    setShowDetailModal(false);
    navigate(`/disposisi/${id_surat}`);
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
        text: "Belum",
      },
      disposisi: {
        color: "bg-blue-100 text-blue-800",
        text: "Disposisi",
      },
      Revisi: {
        color: "bg-orange-100 text-orange-800",
        text: "Revisi",
      },
      Selesai: {
        color: "bg-green-100 text-green-800",
        text: "Selesai",
      },
    };
  
    const config =
      statusConfig[status] || {
        color: "bg-gray-100 text-gray-800",
        text: status || "Tidak Diketahui",
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
            {role !== "Approval" && (
              <button
                onClick={() => navigate("/catat-surat")}
                className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <FaPlus /> Tambah Surat
              </button>
            )}
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
                  {(role === "Approval"
                    ? suratMasuk.filter(
                        (item) =>
                          item.status_disposisi === "Belum" ||
                          item.status_disposisi === "disposisi"
                      )
                    : suratMasuk
                  ).map((item) => (
                    <tr key={item.id_surat}>
                      <td className="px-4 py-2 text-sm text-gray-900 whitespace-nowrap">
                        {formatDate(item.tanggal_terima)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        <div>{item.nomor_agenda}</div>
                        {!item.file_surat && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">
                            ⚠ File Surat Tidak Tersedia
                          </span>
                        )}
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
                        {role !== "Approval" && (
                          <button
                            onClick={() => handleEdit(item.id_surat)}
                            className="text-yellow-600 hover:text-yellow-800"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                        )}
                        {item.file_surat ? (
                          <button
                            onClick={() => handleViewDocument(item.file_surat)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Lihat Dokumen"
                          >
                            <FaFilePdf />
                          </button>
                        ) : (
                          <span
                            className="text-gray-400 cursor-not-allowed"
                            title="Belum ada file"
                          >
                            <FaFilePdf />
                          </span>
                        )}
                        <button
                          onClick={() => handleDetail(item.id_surat)}
                          className="text-indigo-600 hover:text-indigo-800"
                          title="Detail"
                        >
                          <FaEye />
                        </button>
                        {role !== "Approval" && (
                          <button
                            onClick={() => handleDelete(item.id_surat)}
                            className="text-red-600 hover:text-red-800"
                            title="Hapus"
                          >
                            <FaTrash />
                          </button>
                        )}
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

        {/* Detail Modal */}
        {showDetailModal && selectedSurat && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Detail Surat Masuk
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Terima
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                    {formatDate(selectedSurat.tanggal_terima)}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nomor Agenda
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                    {selectedSurat.nomor_agenda}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asal Surat
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                    {selectedSurat.asal}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status Disposisi
                  </label>
                  <div className="px-3 py-2">
                    {getStatusBadge(selectedSurat.status_disposisi)}
                  </div>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Perihal
                  </label>
                  <p className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded">
                    {selectedSurat.perihal}
                  </p>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    File Surat
                  </label>
                  <div className="px-3 py-2">
                    {selectedSurat.file_surat ? (
                      <button
                        onClick={() => handleViewDocument(selectedSurat.file_surat)}
                        className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-2"
                      >
                        <FaFilePdf />
                        Lihat Dokumen
                      </button>
                    ) : (
                      <span className="text-red-500 text-sm">
                        File Surat Tidak Tersedia
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-2">
                {role === "Approval" && (
                  <button
                    onClick={() => handleTambahDisposisi(selectedSurat.id_surat)}
                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
                  >
                    Tambah Disposisi
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SuratMasuk;