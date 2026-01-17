import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../components/Menu";
import axios from "axios";
import { FaEdit, FaTrash, FaEye, FaFilePdf, FaPlus, FaHistory, FaCheck } from "react-icons/fa";

function SuratMasuk() {
  const navigate = useNavigate();
  const [suratMasuk, setSuratMasuk] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSurat, setSelectedSurat] = useState(null);

  const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;

  useEffect(() => {
    const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;
    const fetchUserRole = async () => {
      try {
        const token = localStorage.getItem("token");
        const nik = localStorage.getItem("nik");
        if (!token || !nik) return;
        const response = await axios.get(`${BACKEND_API_URL}/user/${nik}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setRole(response.data.profileData.role);
      } catch (error) {
        setRole("");
      }
    };
    fetchUserRole();
  }, []);

  const fetchSuratMasuk = useCallback(async () => {
    const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await axios.get(`${BACKEND_API_URL}/suratMasuk`, {
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
  }, [navigate]);

  useEffect(() => {
    fetchSuratMasuk();
  }, [fetchSuratMasuk]);

  const handleDelete = async (id_surat) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus surat masuk ini?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`${BACKEND_API_URL}/suratMasuk/${id_surat}`, {
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

  const handleViewDocument = async (fileUrl) => {
    if (fileUrl) {
      try {
        let fullUrl;
        const filename = fileUrl.split("/").pop();
        
        // Jika fileUrl sudah lengkap dengan http/https, gunakan langsung
        if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
          fullUrl = fileUrl;
        } else if (fileUrl.startsWith("/")) {
          // Jika sudah dimulai dengan /, tambahkan BACKEND_API_URL
          fullUrl = `${BACKEND_API_URL}${fileUrl}`;
        } else {
          // Jika path relatif (uploads/surat-masuk/filename.pdf), tambahkan BACKEND_API_URL
          fullUrl = `${BACKEND_API_URL}/${fileUrl}`;
        }
        
        // Buka file di tab baru untuk preview
        window.open(fullUrl, "_blank", "noopener,noreferrer");
        
        // Konfirmasi download
        const confirmDownload = window.confirm(`Apakah Anda ingin mengunduh file "${filename}"?`);
        
        if (confirmDownload) {
          // Download file setelah konfirmasi
          const token = localStorage.getItem("token");
          const response = await fetch(fullUrl, {
            method: 'GET',
            headers: token ? {
              'Authorization': `Bearer ${token}`,
            } : {},
          });
          
          if (response.ok) {
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
          } else {
            console.error("Gagal mengunduh file");
            alert("Gagal mengunduh file. Silakan coba lagi.");
          }
        }
      } catch (error) {
        console.error("Error saat membuka/mengunduh dokumen:", error);
        alert("Terjadi kesalahan saat membuka dokumen.");
      }
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

  const handleTandaiSelesai = async (id_surat) => {
    if (window.confirm("Apakah Anda yakin ingin menandai surat ini sebagai selesai?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.put(`${BACKEND_API_URL}/suratMasuk/${id_surat}/status`, {
          status_disposisi: "Selesai"
        }, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Surat berhasil ditandai sebagai selesai!");
        fetchSuratMasuk(); // Refresh data
      } catch (error) {
        console.error("Error updating surat status:", error);
        alert("Gagal mengubah status surat.");
      }
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      Belum: {
        color: "bg-yellow-100 text-yellow-800",
        text: "Diteruskan",
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
  
  // Tambahkan fungsi badge untuk sifat surat
  const getSifatBadge = (sifat) => {
    let color = "bg-gray-200 text-gray-700";
    if (sifat === "Segera") color = "bg-yellow-200 text-yellow-800";
    else if (sifat === "Sangat Segera") color = "bg-red-200 text-red-800";
    else if (sifat === "Rahasia") color = "bg-purple-200 text-purple-800";
    else if (sifat === "Biasa") color = "bg-green-100 text-green-800";
    return (
      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>{sifat}</span>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Menu />
      <div className="flex flex-col flex-1 p-4 lg:ml-48 transition-all duration-200">
        <div className="bg-white shadow-sm rounded-lg p-5 mt-2">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-semibold text-gray-800">
              Data Surat Masuk
            </h1>
            {role === "Admin" && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => navigate("/catat-surat")}
                  className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <FaPlus /> Tambah Surat
                </button>
                <button
                  onClick={() => navigate("/riwayat-disposisi")}
                  className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <FaHistory /> Riwayat Disposisi
                </button>
            </div>
            )}
            {role === "Approval" && (
              <button
                onClick={() => navigate("/riwayat-disposisi")}
                className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FaHistory /> Riwayat Disposisi
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
                          item.status_disposisi === "Disposisi"
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
                        {role !== "Approval" && item.status_disposisi === "Belum" && (
                          <button
                            onClick={() => handleEdit(item.id_surat)}
                            className="text-yellow-600 hover:text-yellow-800"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                        )}
                        <button
                          onClick={() => handleDetail(item.id_surat)}
                          className="text-indigo-600 hover:text-indigo-800"
                          title="Detail"
                        >
                          <FaEye />
                        </button>
                        {role === "Approval" && item.status_disposisi !== "Selesai" && (
                          <button
                            onClick={() => handleTandaiSelesai(item.id_surat)}
                            className="text-green-600 hover:text-green-800"
                            title="Tandai Selesai"
                          >
                            <FaCheck />
                          </button>
                        )}
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

              {/* Section 1 & 2 sejajar */}
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                {/* Section 1: Informasi Surat */}
                <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-md font-semibold text-gray-700 mb-3">Informasi Surat</h3>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr>
                        <td className="pr-2 py-1 text-gray-500 whitespace-nowrap">Nomor Surat</td>
                        <td className="font-medium text-gray-900">: {selectedSurat.nomor_surat}</td>
                      </tr>
                      <tr>
                        <td className="pr-2 py-1 text-gray-500 whitespace-nowrap">Tanggal Surat</td>
                        <td className="font-medium text-gray-900">: {formatDate(selectedSurat.tanggal_surat)}</td>
                      </tr>
                      <tr>
                        <td className="pr-2 py-1 text-gray-500 whitespace-nowrap">Asal Surat</td>
                        <td className="font-medium text-gray-900">: {selectedSurat.asal}</td>
                      </tr>
                      <tr>
                        <td className="pr-2 py-1 text-gray-500 whitespace-nowrap">Lampiran</td>
                        <td className="font-medium text-gray-900">: {selectedSurat.lampiran || '-'}</td>
                      </tr>
                      <tr>
                        <td className="pr-2 py-1 text-gray-500 whitespace-nowrap">Status Disposisi</td>
                        <td>: {getStatusBadge(selectedSurat.status_disposisi)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                {/* Section 2: Pendataan Surat */}
                <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-md font-semibold text-gray-700 mb-3">Pendataan Surat</h3>
                  <table className="w-full text-sm">
                    <tbody>
                      <tr>
                        <td className="pr-2 py-1 text-gray-500 whitespace-nowrap">Nomor Agenda</td>
                        <td className="font-medium text-gray-900">: {selectedSurat.nomor_agenda}</td>
                      </tr>
                      <tr>
                        <td className="pr-2 py-1 text-gray-500 whitespace-nowrap">Tanggal Terima</td>
                        <td className="font-medium text-gray-900">: {formatDate(selectedSurat.tanggal_terima)}</td>
                      </tr>
                      <tr>
                        <td className="pr-2 py-1 text-gray-500 whitespace-nowrap">Sifat Surat</td>
                        <td>: {getSifatBadge(selectedSurat.sifat)}</td>
                      </tr>
                      <tr>
                        <td className="pr-2 py-1 text-gray-500 whitespace-nowrap">Status Surat</td>
                        <td className="font-medium text-gray-900">: {selectedSurat.status_surat}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 3: Perihal, File Surat, Catatan */}
              <div className="mb-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-md font-semibold text-gray-700 mb-3">Perihal & Dokumen</h3>
                <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4">
                  <div className="flex-[4]">
                    <div className="text-xs text-gray-500 mb-1">Perihal</div>
                    <div className="text-sm font-medium text-gray-900 min-h-[32px] py-1">{selectedSurat.perihal}</div>
                  </div>
                  <div className="flex-[1] md:w-44">
                    <div className="text-xs text-gray-500 mb-1">File Surat</div>
                    {selectedSurat.file_surat ? (
                      <button
                        onClick={() => handleViewDocument(selectedSurat.file_surat)}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 text-xs font-medium bg-blue-50 px-3 py-2 rounded shadow-sm border border-blue-200 w-full justify-center"
                      >
                        <FaFilePdf className="text-lg" />
                        Lihat Dokumen
                      </button>
                    ) : (
                      <span className="text-red-500 text-xs">File Surat Tidak Tersedia</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Catatan</div>
                  <div className="text-sm text-gray-900 bg-whie border border-gray-400 rounded px-3 py-2 min-h-[28px]">{selectedSurat.catatan || '-'}</div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                {role === "Approval" &&(
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