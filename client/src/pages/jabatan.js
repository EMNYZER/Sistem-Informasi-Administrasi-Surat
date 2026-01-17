import React, { useEffect, useState, useCallback} from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../components/Menu";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

function Jabatan() {
  const navigate = useNavigate();
  const [jabatan, setJabatan] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedJabatan, setSelectedJabatan] = useState(null);
  const [formData, setFormData] = useState({
    nama_jabatan: "",
    level_disposisi: "tingkat 2",
    deskripsi: "",
  });
  const [editFormData, setEditFormData] = useState({
    jabatan_id: "",
    nama_jabatan: "",
    level_disposisi: "tingkat 2",
    deskripsi: "",
  });
  const [loading, setLoading] = useState(true);
  const [formError, setFormError] = useState("");
  const [expandedJabatan, setExpandedJabatan] = useState(null);

  const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;

  const fetchJabatan = useCallback(async () => {
    const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await axios.get(`${BACKEND_API_URL}/jabatan`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setJabatan(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching jabatan:", error);
      setLoading(false);
    }
  },[navigate]);

  useEffect(() => {
    fetchJabatan();
  }, [fetchJabatan]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      setFormError("");
      await axios.post(`${BACKEND_API_URL}/jabatan`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setShowModal(false);
      fetchJabatan();
      setFormData({
        nama_jabatan: "",
        level_disposisi: "tingkat 2",
        deskripsi: "",
      });
    } catch (error) {
      if (error.response && error.response.data && error.response.data.error) {
        setFormError(error.response.data.error);
      } else {
        setFormError("Gagal menambah jabatan.");
      }
      console.error("Error adding jabatan:", error);
    }
  };

  const handleEdit = (jabatan) => {
    setSelectedJabatan(jabatan);
    setEditFormData({
      jabatan_id: jabatan.jabatan_id,
      nama_jabatan: jabatan.nama_jabatan,
      level_disposisi: jabatan.level_disposisi,
      deskripsi: jabatan.deskripsi || "",
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
        `${BACKEND_API_URL}/jabatan/${selectedJabatan.jabatan_id}`,
        editFormData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setShowEditModal(false);
      fetchJabatan();
    } catch (error) {
      console.error("Error updating jabatan:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus jabatan ini?")) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        await axios.delete(`${BACKEND_API_URL}/jabatan/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchJabatan();
      } catch (error) {
        console.error("Error deleting jabatan:", error);
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
              Data Jabatan
            </h1>
            <button
              onClick={() => setShowModal(true)}
              className="w-full bg-green-600 text-white px-3 py-2 rounded text-sm active:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <FaPlus /> Tambah Jabatan
            </button>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex justify-between items-center mb-4">
            <h1 className="text-xl font-semibold text-gray-800">
              Data Jabatan
            </h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <FaPlus /> Tambah Jabatan
            </button>
          </div>

          {loading ? (
            <div className="text-center py-4 text-sm md:text-base">Loading...</div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="md:hidden space-y-2">
                {jabatan.map((item) => (
                  <div key={item.jabatan_id} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className="flex justify-between items-center p-3 cursor-pointer"
                      onClick={() => setExpandedJabatan(expandedJabatan === item.jabatan_id ? null : item.jabatan_id)}
                    >
                      <h3 className="text-sm font-semibold text-gray-900 flex-1">{item.nama_jabatan}</h3>
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
                            handleDelete(item.jabatan_id);
                          }}
                          className="text-red-600 active:text-red-800 p-1"
                          title="Hapus"
                        >
                          <FaTrash size={16} />
                        </button>
                        <svg
                          className={`w-4 h-4 text-gray-500 transition-transform ${expandedJabatan === item.jabatan_id ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {expandedJabatan === item.jabatan_id && (
                      <div className="px-3 pb-3 pt-2 bg-white border-t border-gray-200 space-y-2 transition-all duration-200">
                        <div className="flex items-center text-xs text-gray-700">
                          <span className="font-medium w-24">ID:</span>
                          <span>{item.jabatan_id}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-700">
                          <span className="font-medium w-24">Level:</span>
                          <span>{item.level_disposisi}</span>
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
                {jabatan.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    Tidak ada data jabatan
                  </div>
                )}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama Jabatan
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Level Disposisi
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
                    {jabatan.map((item) => (
                      <tr key={item.jabatan_id}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.jabatan_id}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.nama_jabatan}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.level_disposisi}
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
                              onClick={() => handleDelete(item.jabatan_id)}
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

      {/* Modal Tambah Jabatan */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
          <div className="bg-gray-200 border-2 border-gray-700 rounded-lg md:rounded-2xl w-full max-w-md flex flex-col shadow-xl max-h-[95vh] md:max-h-auto">
            <h2 className="sticky top-0 z-10 bg-gray-700 text-white p-3 md:p-4 text-center uppercase text-sm md:text-xl font-semibold rounded-t-lg md:rounded-t-2xl border-b-2 border-gray-800">
              Tambah Jabatan
            </h2>
            {formError && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded text-sm">
                {formError}
              </div>
            )}
            <div className="overflow-y-auto p-3 md:p-4">
            <form onSubmit={handleSubmit} className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nama Jabatan
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500"
                  value={formData.nama_jabatan}
                  onChange={(e) =>
                    setFormData({ ...formData, nama_jabatan: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Level Disposisi
                </label>
                <select
                  required
                  className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500"
                  value={formData.level_disposisi}
                  onChange={(e) =>
                    setFormData({ ...formData, level_disposisi: e.target.value })
                  }
                >
                  <option value="tingkat 1">Tingkat 1</option>
                  <option value="tingkat 2">Tingkat 2</option>
                  <option value="tingkat 3">Tingkat 3</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Deskripsi
                </label>
                <textarea
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500"
                  value={formData.deskripsi}
                  onChange={(e) =>
                    setFormData({ ...formData, deskripsi: e.target.value })
                  }
                  placeholder="Masukkan deskripsi jabatan (opsional)"
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
        </div>
      )}

      {/* Modal Edit Jabatan */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
          <div className="bg-gray-200 border-2 border-gray-700 rounded-lg md:rounded-2xl w-full max-w-md flex flex-col shadow-xl max-h-[95vh] md:max-h-auto">
            <h2 className="sticky top-0 z-10 bg-gray-700 text-white p-3 md:p-4 text-center uppercase text-sm md:text-xl font-semibold rounded-t-lg md:rounded-t-2xl border-b-2 border-gray-800">
              Edit Jabatan
            </h2>
            <div className="overflow-y-auto p-3 md:p-4">
            <form onSubmit={handleEditSubmit} className="space-y-3 md:space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nama Jabatan
                </label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-green-500 focus:ring-green-500"
                  value={editFormData.nama_jabatan}
                  onChange={(e) =>
                    setEditFormData({
                      ...editFormData,
                      nama_jabatan: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Level Disposisi
                </label>
                <select
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  value={editFormData.level_disposisi}
                  onChange={(e) =>
                    setEditFormData({ ...editFormData, level_disposisi: e.target.value })
                  }
                >
                  <option value="tingkat 1">Tingkat 1</option>
                  <option value="tingkat 2">Tingkat 2</option>
                  <option value="tingkat 3">Tingkat 3</option>
                </select>
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
                  placeholder="Masukkan deskripsi jabatan (opsional)"
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
        </div>
      )}
    </div>
  );
}

export default Jabatan;

