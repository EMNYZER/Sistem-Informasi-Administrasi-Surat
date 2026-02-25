import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../components/Menu";
import axios from "axios";
import { FaEye, FaInfoCircle } from "react-icons/fa";

function PengesahanSurat() {
  const navigate = useNavigate();
  const [suratKeluar, setSuratKeluar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSurat, setSelectedSurat] = useState(null);

  const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;

  const fetchSuratKeluar = useCallback(async () => {
    const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      // Ambil surat dengan status 'diproses' (siap disahkan)
      const response = await axios.get(
        `${BACKEND_API_URL}/suratKeluar/status/diproses`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setSuratKeluar(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching surat keluar:", error);
      setLoading(false);
    }
  },[navigate]);

  useEffect(() => {
    fetchSuratKeluar();
  }, [fetchSuratKeluar]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const handlePreview = (surat) => {
    const url = `/preview-surat/${surat.id_surat}`;
    window.open(url, "_blank");
  };

  const handleDetail = (surat) => {
    setSelectedSurat(surat);
    setShowModal(true);
  };

  const handlePengesahan = async (status) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      await axios.put(
        `${BACKEND_API_URL}/suratKeluar/${selectedSurat.id_surat}`,
        {
          status,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setShowModal(false);
      fetchSuratKeluar();
    } catch (error) {
      console.error("Error updating surat:", error);
      alert("Terjadi kesalahan saat memperbarui status surat");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Menu />
      <div className="flex flex-col flex-1 p-4 lg:ml-48 transition-all duration-200">
        <div className="bg-white shadow-sm rounded-lg p-5 mt-2">
          <div className="mb-4">
            <h1 className="text-xl font-semibold text-gray-800">
              Pengesahan Surat Keluar
            </h1>
          </div>

          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Surat
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pegawai
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Perihal
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sifat
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {suratKeluar.map((item) => (
                    <tr key={item.id_surat}>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {formatDate(item.tanggal_surat)}
                      </td>
                      <td className="px-4 py-2">
                        <div className="text-sm font-medium text-gray-900">
                          {item.pegawai?.nama || "-"}
                        </div>
                        <div className="text-xs text-gray-500">{item.NIK}</div>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {item.kategori?.nama_kategori || "-"}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {item.perihal}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold
                            ${item.sifat === "Biasa" ? "bg-gray-200 text-gray-700" : ""}
                            ${item.sifat === "Segera" ? "bg-yellow-200 text-yellow-800" : ""}
                            ${item.sifat === "Sangat Segera" ? "bg-red-200 text-red-700" : ""}
                            ${item.sifat === "Rahasia" ? "bg-blue-200 text-blue-700" : ""}
                          `}
                        >
                          {item.sifat}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handlePreview(item)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Preview"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => handleDetail(item)}
                            className="text-green-600 hover:text-green-800"
                            title="Detail"
                          >
                            <FaInfoCircle />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && suratKeluar.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Tidak ada surat yang perlu disahkan
            </div>
          )}
        </div>
      </div>

      {/* Modal Detail Surat */}
      {showModal && selectedSurat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-xl">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">
                Detail Surat Keluar
              </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-semibold leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Content Modal */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-6">
                {/* Grid 2 Kolom: Informasi Surat (Kiri) dan Informasi Pengirim & Penerima (Kanan) */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Kolom Kiri: Informasi Surat */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 uppercase mb-4 pb-2 border-b">
                      Informasi Surat
                    </h3>
              <div className="space-y-4">
                  <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                      Nomor Surat
                    </label>
                        <div className="text-sm text-gray-900 font-medium">
                          {selectedSurat.nomor_surat || (
                            <span className="text-gray-400 italic">Belum ada nomor surat</span>
                          )}
                    </div>
                  </div>
                  <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Tanggal Surat
                    </label>
                        <div className="text-sm text-gray-900">
                      {formatDate(selectedSurat.tanggal_surat)}
                    </div>
                  </div>
                  <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                      Kategori
                    </label>
                        <div className="text-sm text-gray-900">
                      {selectedSurat.kategori?.nama_kategori || "-"}
                    </div>
                  </div>
                  <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Sifat Surat
                    </label>
                        <span
                          className={`inline-block px-2.5 py-1 rounded text-xs font-semibold
                            ${selectedSurat.sifat === "Biasa" ? "bg-gray-200 text-gray-700" : ""}
                            ${selectedSurat.sifat === "Segera" ? "bg-yellow-200 text-yellow-800" : ""}
                            ${selectedSurat.sifat === "Sangat Segera" ? "bg-red-200 text-red-700" : ""}
                            ${selectedSurat.sifat === "Rahasia" ? "bg-blue-200 text-blue-700" : ""}
                          `}
                        >
                      {selectedSurat.sifat}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Kolom Kanan: Informasi Pengirim & Penerima */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    {/* Informasi Pengirim */}
                    <div className="mb-4">
                      <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3 pb-2 border-b">
                        Informasi Pengirim
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            Nama Pegawai
                          </label>
                          <div className="text-sm text-gray-900 font-medium">
                            {selectedSurat.pegawai?.nama || "-"}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                            NIK
                    </label>
                          <div className="text-sm text-gray-900">
                            {selectedSurat.NIK || "-"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Informasi Penerima */}
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3 pb-2 border-b">
                        Informasi Penerima
                      </h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">
                      Tujuan
                    </label>
                          <div className="text-sm text-gray-900">
                            {selectedSurat.tujuan || "-"}
                          </div>
                        </div>
                        {selectedSurat.kepada && (
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Kepada
                            </label>
                            <div className="text-sm text-gray-900">
                              {selectedSurat.kepada}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Perihal dan Isi Surat */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3 pb-2 border-b">
                    Isi Surat
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        Perihal
                      </label>
                      <div className="text-sm text-gray-900 font-medium">
                        {selectedSurat.perihal}
                      </div>
                    </div>
                    {selectedSurat.isi_surat && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">
                          Isi Surat
                        </label>
                        <div 
                          className="text-sm text-gray-700 bg-gray-50 p-3 rounded border max-h-40 overflow-y-auto"
                          dangerouslySetInnerHTML={{ __html: selectedSurat.isi_surat }}
                        />
                    </div>
                  )}
                  </div>
                </div>

                {/* Lampiran */}
                {selectedSurat.lampiran && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3 pb-2 border-b">
                      Lampiran
                    </h3>
                    <div className="text-sm text-gray-900">
                      {selectedSurat.lampiran}
                      {selectedSurat.lampiran_file && (
                        <a
                          href={selectedSurat.lampiran_file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-3 text-blue-600 hover:underline"
                        >
                          Lihat lampiran
                        </a>
                      )}
                    </div>
                  </div>
                )}

                {/* Catatan Sebelumnya */}
                {selectedSurat.catatan && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 uppercase mb-3 pb-2 border-b">
                      Catatan Sebelumnya
                    </h3>
                    <div className="text-sm text-gray-700 bg-yellow-50 p-3 rounded border border-yellow-200">
                      {selectedSurat.catatan}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Modal - Actions */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 rounded-md transition-colors"
                >
                  Batal
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "Apakah Anda yakin ingin menolak surat ini?",
                        )
                      ) {
                        handlePengesahan("ditolak");
                      }
                    }}
                    className="px-5 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors shadow-sm"
                  >
                    Tolak
                </button>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Apakah Anda yakin ingin menyetujui surat ini? Tindakan ini akan men-generate QR code dan tidak bisa dibatalkan.",
                      )
                    ) {
                      handlePengesahan("disetujui");
                    }
                  }}
                    className="px-5 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors shadow-sm"
                >
                  Setujui
                </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PengesahanSurat;
