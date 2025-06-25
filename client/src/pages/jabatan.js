import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Menu from "../components/Menu";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

function Jabatan() {
  const navigate = useNavigate();
  const [jabatan, setJabatan] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedJabatan, setSelectedJabatan] = useState(null);
  const [formData, setFormData] = useState({
    nama_jabatan: '',
    deskripsi: ''
  });
  const [editFormData, setEditFormData] = useState({
     jabatan_id: '',
     nama_jabatan: '',
     deskripsi: ''
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJabatan();
  }, []);

  const fetchJabatan = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await axios.get('http://localhost:3001/jabatan', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setJabatan(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jabatan:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      await axios.post('http://localhost:3001/jabatan', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setShowModal(false);
      fetchJabatan();
      // Reset form
      setFormData({
        nama_jabatan: '',
        deskripsi: ''
      });
    } catch (error) {
      console.error('Error adding jabatan:', error);
    }
  };

  const handleEdit = (jabatan) => {
    setSelectedJabatan(jabatan);
    setEditFormData({
          jabatan_id: jabatan.jabatan_id,
          nama_jabatan: jabatan.nama_jabatan,
          deskripsi: jabatan.deskripsi || ''
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      await axios.put(`http://localhost:3001/jabatan/${selectedJabatan.jabatan_id}`, editFormData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setShowEditModal(false);
      fetchJabatan();
    } catch (error) {
      console.error('Error updating jabatan:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus jabatan ini?')) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }
        await axios.delete(`http://localhost:3001/jabatan/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        fetchJabatan();
      } catch (error) {
        console.error('Error deleting jabatan:', error);
      }
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Menu />
      <div className="flex-1 p-4">
        <Header />
        <div className="bg-white shadow-sm rounded-lg p-5 mt-2">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-semibold text-gray-800">Data Jabatan</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <FaPlus /> Tambah Jabatan
            </button>
          </div>

          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Jabatan</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {jabatan.map((item) => (
                    <tr key={item.jabatan_id}>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.jabatan_id}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.nama_jabatan}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.deskripsi || '-'}</td>
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
          )}
        </div>
      </div>

      {/* Modal Tambah Jabatan */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Tambah Jabatan</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Jabatan</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  value={formData.nama_jabatan}
                  onChange={(e) => setFormData({...formData, nama_jabatan: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                <textarea
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  value={formData.deskripsi}
                  onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
                  placeholder="Masukkan deskripsi jabatan (opsional)"
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

      {/* Modal Edit Jabatan */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Edit Jabatan</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nama Jabatan</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  value={editFormData.nama_jabatan}
                  onChange={(e) => setEditFormData({...editFormData, nama_jabatan: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
                <textarea
                  rows="3"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                  value={editFormData.deskripsi}
                  onChange={(e) => setEditFormData({...editFormData, deskripsi: e.target.value})}
                  placeholder="Masukkan deskripsi jabatan (opsional)"
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

export default Jabatan;