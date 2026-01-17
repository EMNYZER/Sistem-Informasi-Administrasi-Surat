import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../components/Menu";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

function PengaturanSurat() {
  const navigate = useNavigate();
  const [kategori, setKategori] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedKategori, setSelectedKategori] = useState(null);
  const [formData, setFormData] = useState({
    kode_kategori: "",
    nama_kategori: "",
    deskripsi: "",
  });
  const [editFormData, setEditFormData] = useState({
    kode_kategori: "",
    nama_kategori: "",
    deskripsi: "",
  });
  const [loading, setLoading] = useState(true);
  const [expandedKategori, setExpandedKategori] = useState(null);

  const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;

  const fetchKategori = useCallback(async () => {
    const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await axios.get(`${BACKEND_API_URL}/kategori`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setKategori(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching kategori surat:", error);
      setLoading(false);
    }
  },[navigate]);

  useEffect(() => {
    fetchKategori();
  }, [fetchKategori]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      await axios.post(`${BACKEND_API_URL}/kategori`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setShowModal(false);
      fetchKategori();
      // Reset form
      setFormData({
        kode_kategori: "",
        nama_kategori: "",
        deskripsi: "",
      });
    } catch (error) {
      console.error("Error adding kategori surat:", error);
    }
  };

  const handleEdit = (kategori) => {
    setSelectedKategori(kategori);
    setEditFormData({
      kode_kategori: kategori.kode_kategori,
      nama_kategori: kategori.nama_kategori,
      deskripsi: kategori.deskripsi || "",
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      await axios.put(
        `${BACKEND_API_URL}/kategori/${selectedKategori.kode_kategori}`,
        editFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setShowEditModal(false);
      fetchKategori();
    } catch (error) {
      console.error("Error updating kategori surat:", error);
    }
  };

  const handleDelete = async (kode) => {
    if (
      window.confirm("Apakah Anda yakin ingin menghapus kategori surat ini?")
    ) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        await axios.delete(`${BACKEND_API_URL}/kategori/${kode}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchKategori();
      } catch (error) {
        console.error("Error deleting kategori surat:", error);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Menu />
      <div className="flex flex-col flex-1 p-2 md:p-4 lg:ml-48 transition-all duration-200">
        <div className="bg-white shadow-sm rounded-lg p-3 md:p-5 mt-2">
          {/* Mobile Header */}
          <div className="md:hidden mb-4">
            <h1 className="text-lg font-semibold text-gray-800 mb-3">
              Kategori Surat
            </h1>
            <button
              onClick={() => setShowModal(true)}
              className="w-full bg-green-600 text-white px-3 py-2 rounded text-sm active:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <FaPlus /> Tambah Kategori
            </button>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex justify-between items-center mb-4">
            <h1 className="text-xl font-semibold text-gray-800">
              Kategori Surat
            </h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <FaPlus /> Tambah Kategori
            </button>
          </div>

          {loading ? (
            <div className="text-center py-4 text-sm md:text-base">Loading...</div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="md:hidden space-y-2">
                {kategori.map((item) => (
                  <div key={item.kategori_id} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className="flex justify-between items-center p-3 cursor-pointer"
                      onClick={() => setExpandedKategori(expandedKategori === item.kategori_id ? null : item.kategori_id)}
                    >
                      <h3 className="text-sm font-semibold text-gray-900 flex-1">{item.nama_kategori}</h3>
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(item);
                          }}
                          className="text-yellow-600 active:text-yellow-800 p-1"
                          title="Edit"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.kode_kategori);
                          }}
                          className="text-red-600 active:text-red-800 p-1"
                          title="Hapus"
                        >
                          <FaTrash size={16} />
                        </button>
                        <svg
                          className={`w-4 h-4 text-gray-500 transition-transform ${expandedKategori === item.kategori_id ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {expandedKategori === item.kategori_id && (
                      <div className="px-3 pb-3 pt-2 bg-white border-t border-gray-200 space-y-2 transition-all duration-200">
                        <div className="flex items-center text-xs text-gray-700">
                          <span className="font-medium w-20">Kode:</span>
                          <span>{item.kode_kategori}</span>
                        </div>
                        {item.deskripsi && (
                          <div className="text-xs text-gray-700">
                            <span className="font-medium">Deskripsi: </span>
                            <span>{item.deskripsi}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
                {kategori.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    Tidak ada data kategori
                  </div>
                )}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kode
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Kategori
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Deskripsi
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {kategori.map((item) => (
                      <tr key={item.kategori_id}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.kode_kategori}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.nama_kategori}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.deskripsi || "-"}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(item)}
                              className="text-yellow-600 hover:text-yellow-800"
                            >
                              <FaEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(item.kode_kategori)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modal Tambah Kategori */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md max-h-[95vh] md:max-h-auto overflow-y-auto">
            <h2 className="text-lg md:text-xl font-semibold mb-4">
              Tambah Kategori Surat
            </h2>
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Kode
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  value={formData.kode_kategori}
                  onChange={(e) =>
                    setFormData({ ...formData, kode_kategori: e.target.value })
                  }
                  placeholder="Masukkan kode kategori"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Kategori
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  value={formData.nama_kategori}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_kategori: e.target.value })
                  }
                  placeholder="Masukkan nama kategori"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Deskripsi
                </label>
                <textarea
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  value={formData.deskripsi}
                  onChange={(e) =>
                    setFormData({ ...formData, deskripsi: e.target.value })
                  }
                  placeholder="Masukkan deskripsi kategori (opsional)"
                />
              </div>
              <div className="mt-4 md:mt-6 flex flex-col md:flex-row justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="w-full md:w-auto px-4 py-2 text-xs md:text-sm font-medium text-gray-700 bg-gray-100 active:bg-gray-200 md:hover:bg-gray-200 rounded-md"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full md:w-auto px-4 py-2 text-xs md:text-sm font-medium text-white bg-green-600 active:bg-green-700 md:hover:bg-green-700 rounded-md"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Edit Kategori */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
          <div className="bg-white rounded-lg p-4 md:p-6 w-full max-w-md max-h-[95vh] md:max-h-auto overflow-y-auto">
            <h2 className="text-lg md:text-xl font-semibold mb-4">Edit Kategori Surat</h2>
            <form onSubmit={handleEditSubmit} className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Kode
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  value={editFormData.kode_kategori}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      kode_kategori: e.target.value,
                    })
                  }
                  placeholder="Masukkan kode kategori"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Kategori
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  value={editFormData.nama_kategori}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      nama_kategori: e.target.value,
                    })
                  }
                  placeholder="Masukkan nama kategori"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Deskripsi
                </label>
                <textarea
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  value={editFormData.deskripsi}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      deskripsi: e.target.value,
                    })
                  }
                  placeholder="Masukkan deskripsi kategori (opsional)"
                />
              </div>
              <div className="mt-4 md:mt-6 flex flex-col md:flex-row justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="w-full md:w-auto px-4 py-2 text-xs md:text-sm font-medium text-gray-700 bg-gray-100 active:bg-gray-200 md:hover:bg-gray-200 rounded-md"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="w-full md:w-auto px-4 py-2 text-xs md:text-sm font-medium text-white bg-green-600 active:bg-green-700 md:hover:bg-green-700 rounded-md"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PengaturanSurat;
