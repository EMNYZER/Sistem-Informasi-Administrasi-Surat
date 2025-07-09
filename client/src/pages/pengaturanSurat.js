import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
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

  const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;

  useEffect(() => {
    fetchKategori();
  }, []);

  const fetchKategori = async () => {
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
  };

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
      <div className="flex flex-col flex-1 p-4 lg:ml-48 transition-all duration-200">
        <Header />
        <div className="bg-white shadow-sm rounded-lg p-5 mt-2">
          <div className="flex justify-between items-center mb-4">
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
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
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
          )}
        </div>
      </div>

      {/* Modal Tambah Kategori */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              Tambah Kategori Surat
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
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
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Kategori Surat</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
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
              <div className="mt-6 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
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
