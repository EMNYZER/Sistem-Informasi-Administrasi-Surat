import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Menu from "../components/Menu";
import axios from "axios";
import { FaEye, FaInfoCircle } from "react-icons/fa";

function VerifikasiSurat() {
  const navigate = useNavigate();
  const [suratKeluar, setSuratKeluar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSurat, setSelectedSurat] = useState(null);
  const [catatan, setCatatan] = useState("");

  useEffect(() => {
    fetchSuratKeluar();
  }, []);

  const fetchSuratKeluar = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await axios.get(
        "http://localhost:3001/suratKeluar/status/diajukan",
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
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const handlePreview = (surat) => {
    const url = `/preview-surat/${surat.id_surat}`;
    window.open(url, "_blank");
  };

  const handleDetail = (surat) => {
    setSelectedSurat(surat);
    setCatatan("");
    setShowModal(true);
  };

  const handleVerifikasi = async (status) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      if (status === "diproses") {
        try {
          await axios.post(
            `http://localhost:3001/suratKeluar/generate-nomor/${selectedSurat.id_surat}`,
            {},
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          );
        } catch (err) {
          alert("Gagal generate nomor surat!");
          return;
        }
      }

      await axios.put(
        `http://localhost:3001/suratKeluar/${selectedSurat.id_surat}`,
        {
          status,
          catatan,
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
        <Header />
        <div className="bg-white shadow-sm rounded-lg p-5 mt-2">
          <div className="mb-4">
            <h1 className="text-xl font-semibold text-gray-800">
              Verifikasi Surat Keluar
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
              Tidak ada surat yang perlu diverifikasi
            </div>
          )}
        </div>
      </div>

      {/* Modal Detail Surat */}
      {showModal && selectedSurat && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Detail Surat Keluar
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Nomor Surat
                    </label>
                    <div className="mt-1 text-sm text-gray-900">
                      {selectedSurat.nomor_surat || "-"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tanggal
                    </label>
                    <div className="mt-1 text-sm text-gray-900">
                      {formatDate(selectedSurat.tanggal_surat)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Kategori
                    </label>
                    <div className="mt-1 text-sm text-gray-900">
                      {selectedSurat.kategori?.nama_kategori || "-"}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Sifat
                    </label>
                    <div className="mt-1 text-sm text-gray-900">
                      {selectedSurat.sifat}
                    </div>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Perihal
                    </label>
                    <div className="mt-1 text-sm text-gray-900">
                      {selectedSurat.perihal}
                    </div>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-sm font-medium text-gray-700">
                      Tujuan
                    </label>
                    <div className="mt-1 text-sm text-gray-900">
                      {selectedSurat.tujuan}
                    </div>
                  </div>
                  {selectedSurat.kepada && (
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Kepada
                      </label>
                      <div className="mt-1 text-sm text-gray-900">
                        {selectedSurat.kepada}
                      </div>
                    </div>
                  )}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Catatan
                    </label>
                    <textarea
                      value={catatan}
                      onChange={(e) => setCatatan(e.target.value)}
                      className="mt-1 block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-green-500"
                      rows="3"
                      placeholder="Tambahkan catatan untuk surat ini..."
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-md transition-colors"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Apakah Anda yakin ingin merevisi surat ini? Pastikan catatan revisi sudah diisi.",
                      )
                    ) {
                      handleVerifikasi("revisi");
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 border border-gray-300 rounded-md transition-colors"
                >
                  Revisi
                </button>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Apakah Anda yakin ingin meneruskan surat ini untuk diproses?",
                      )
                    ) {
                      handleVerifikasi("diproses");
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 border border-gray-300 rounded-md transition-colors"
                >
                  Teruskan
                </button>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Apakah Anda yakin ingin menolak surat ini?",
                      )
                    ) {
                      handleVerifikasi("ditolak");
                    }
                  }}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 border gray-300 rounded-md transition-colors"
                >
                  Tolak
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VerifikasiSurat;
