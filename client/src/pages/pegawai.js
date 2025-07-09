import React, { useState, useEffect } from "react";
import Menu from "../components/Menu";
import Header from "../components/Header";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { FaFileImport } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const initialFormState = {
  NIK: "",
  nama: "",
  jenis_kelamin: "",
  tempat_lahir: "",
  tanggal_lahir: "",
  alamat: "",
  agama: "",
  jabatan_id: "",
  status: "Aktif",
  NRG: "",
  UKG: "",
  NUPTK: "",
  No_induk_yayasan: "",
  no_HP: "",
  email: "",
  role: "User",
};

function Pegawai() {
  const navigate = useNavigate();
  const [pegawai, setPegawai] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentPegawai, setCurrentPegawai] = useState(initialFormState);
  const [jabatan, setJabatan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);

  const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;

  useEffect(() => {
    fetchPegawai();
    fetchJabatan();
  }, []);


  const fetchPegawai = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await axios.get(`${BACKEND_API_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPegawai(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching pegawai:", error);
      setLoading(false);
    }
  };

  const fetchJabatan = async () => {
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
    } catch (error) {
      console.error("Error fetching jabatan:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentPegawai((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentPegawai(initialFormState);
    setShowModal(true);
  };

  const handleOpenImportModal = () => {
    setShowImportModal(true);
    setImportFile(null);
  };

  const handleCloseImportModal = () => {
    setShowImportModal(false);
    setImportFile(null);
  };

  const handleImportFileChange = (e) => {
    setImportFile(e.target.files[0]);
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) return;
    setImportLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const formData = new FormData();
      formData.append("file", importFile);
      await axios.post(`${BACKEND_API_URL}/user/import`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setShowImportModal(false);
      fetchPegawai();
      alert("Import data pegawai berhasil");
    } catch (error) {
      alert(error.response?.data?.message || "Gagal import data pegawai");
      console.log(error.message)
    } finally {
      setImportLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleDelete = async (nik) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus pegawai ini?")) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        await axios.delete(`${BACKEND_API_URL}/user/${nik}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchPegawai();
      } catch (error) {
        console.error("Error deleting pegawai:", error);
      }
    }
  };

  const handleEdit = (pegawai) => {
    setIsEditing(true);
    setCurrentPegawai({
      ...pegawai,
      tanggal_lahir: pegawai.tanggal_lahir
        ? new Date(pegawai.tanggal_lahir).toISOString().split("T")[0]
        : "",
      No_induk_yayasan: pegawai.No_induk_yayasan || "",
    });
    setShowModal(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      if (isEditing) {
        await axios.put(
          `${BACKEND_API_URL}/user/${currentPegawai.NIK}`,
          currentPegawai,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      } else {
        await axios.post(`${BACKEND_API_URL}/user`, currentPegawai);
      }
      setShowModal(false);
      fetchPegawai();
    } catch (error) {
      console.error("Error saving pegawai:", error);
      alert(error.response?.data?.message || "Gagal menyimpan data");
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
              Data Pegawai
            </h1>
            <div className="flex gap-2">
              <button
                onClick={handleOpenImportModal}
                className="bg-blue-600 text-white px-3 py-1.5 rounded text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
              >
                <FaFileImport /> Import Data
              </button>
              <button
                onClick={handleOpenAddModal}
                className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <FaPlus /> Tambah Pegawai
              </button>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      NIK
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jabatan
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pegawai.map((item) => (
                    <tr key={item.NIK}>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {item.nama}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {item.NIK}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {item.role}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {item.jabatan?.nama_jabatan || "-"}
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
                            onClick={() => handleDelete(item.NIK)}
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

      {/* Unified Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-200 border-2 border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl">
            <h2 className="sticky top-0 z-10 bg-gray-700 text-white p-4 text-center uppercase text-xl font-semibold rounded-t-2xl border-b-2 border-gray-800">
              {isEditing ? "Edit Pegawai" : "Tambah Pegawai"}
            </h2>
            <div className="overflow-y-auto p-6">
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <h3 className="md:col-span-4 text-md font-semibold text-gray-700 border-b pb-2">
                    Informasi Pribadi
                  </h3>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      NIK
                    </label>
                    <input
                      name="NIK"
                      type="text"
                      required
                      disabled={isEditing}
                      className={`mt-1 block w-full rounded-md border border-gray-600 shadow-sm  ${isEditing ? "bg-gray-200 cursor-not-allowed" : "bg-white"}`}
                      value={currentPegawai.NIK}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Nama Lengkap
                    </label>
                    <input
                      name="nama"
                      type="text"
                      required
                      className={`mt-1 block w-full rounded-md border border-gray-600 shadow-sm  bg-white`}
                      value={currentPegawai.nama}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tempat Lahir
                    </label>
                    <input
                      name="tempat_lahir"
                      type="text"
                      required
                      className={`mt-1 block w-full rounded-md border border-gray-600 shadow-sm  bg-white`}
                      value={currentPegawai.tempat_lahir}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Tanggal Lahir
                    </label>
                    <input
                      name="tanggal_lahir"
                      type="date"
                      required
                      className={`mt-1 block w-full rounded-md border border-gray-600 shadow-sm  bg-white`}
                      value={currentPegawai.tanggal_lahir}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Jenis Kelamin
                    </label>
                    <select
                      name="jenis_kelamin"
                      required
                      className={`mt-1 block w-full rounded-md border border-gray-600 shadow-sm  bg-white`}
                      value={currentPegawai.jenis_kelamin}
                      onChange={handleInputChange}
                    >
                      <option value="">Pilih</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Perempuan">Perempuan</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Agama
                    </label>
                    <select
                      name="agama"
                      required
                      className={`mt-1 block w-full rounded-md border border-gray-600 shadow-sm  bg-white`}
                      value={currentPegawai.agama}
                      onChange={handleInputChange}
                    >
                      <option value="">Pilih</option>
                      <option value="Islam">Islam</option>
                      <option value="Kristen">Kristen</option>
                      <option value="Katolik">Katolik</option>
                      <option value="Hindu">Hindu</option>
                      <option value="Budha">Budha</option>
                      <option value="Konghucu">Konghucu</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      No. HP
                    </label>
                    <input
                      name="no_HP"
                      type="text"
                      required
                      className={`mt-1 block w-full rounded-md border border-gray-600 shadow-sm  bg-white`}
                      value={currentPegawai.no_HP}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      name="email"
                      type="email"
                      required
                      className={`mt-1 block w-full rounded-md border border-gray-600 shadow-sm  bg-white`}
                      value={currentPegawai.email}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-gray-700">
                      Alamat
                    </label>
                    <textarea
                      name="alamat"
                      required
                      rows="3"
                      className={`mt-1 block w-full rounded-md border border-gray-600 shadow-sm  bg-white`}
                      value={currentPegawai.alamat}
                      onChange={handleInputChange}
                      placeholder="Masukkan alamat lengkap"
                    />
                  </div>

                  <h3 className="md:col-span-4 text-md font-semibold text-gray-700 border-b pb-2 mt-4">
                    Informasi Kepegawaian & Jabatan
                  </h3>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Jabatan
                    </label>
                    <select
                      name="jabatan_id"
                      required
                      className={`mt-1 block w-full rounded-md border border-gray-600 shadow-sm  bg-white`}
                      value={currentPegawai.jabatan_id}
                      onChange={handleInputChange}
                    >
                      <option value="">Pilih Jabatan</option>
                      {jabatan.map((j) => (
                        <option key={j.jabatan_id} value={j.jabatan_id}>
                          {j.nama_jabatan}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Role
                    </label>
                    <select
                      name="role"
                      required
                      className={`mt-1 block w-full rounded-md border border-gray-600 shadow-sm  bg-white`}
                      value={currentPegawai.role}
                      onChange={handleInputChange}
                    >
                      <option value="Admin">Admin</option>
                      <option value="User">User</option>
                      <option value="Approval">Approval</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Status Kepegawaian
                    </label>
                    <select
                      name="status"
                      required
                      className={`mt-1 block w-full rounded-md border border-gray-600 shadow-sm  bg-white`}
                      value={currentPegawai.status}
                      onChange={handleInputChange}
                    >
                      <option value="Aktif">Aktif</option>
                      <option value="Tidak Aktif">Tidak Aktif</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Nomor Induk Yayasan
                    </label>
                    <input
                      name="No_induk_yayasan"
                      type="text"
                      className={`mt-1 block w-full rounded-md border border-gray-600 shadow-sm  bg-white`}
                      value={currentPegawai.No_induk_yayasan}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      NRG
                    </label>
                    <input
                      name="NRG"
                      type="text"
                      className={`mt-1 block w-full rounded-md border border-gray-600 shadow-sm  bg-white`}
                      value={currentPegawai.NRG}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      UKG
                    </label>
                    <input
                      name="UKG"
                      type="text"
                      className={`mt-1 block w-full rounded-md border border-gray-600 shadow-sm  bg-white`}
                      value={currentPegawai.UKG}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      NUPTK
                    </label>
                    <input
                      name="NUPTK"
                      type="text"
                      className={`mt-1 block w-full rounded-md border border-gray-600 shadow-sm  bg-white`}
                      value={currentPegawai.NUPTK}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                <div className="mt-6 flex justify-end gap-2 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md"
                  >
                    {isEditing ? "Simpan Perubahan" : "Simpan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-200 border-2 border-gray-700 rounded-2xl w-full max-w-md flex flex-col shadow-xl">
            <h2 className="bg-gray-700 text-white p-4 text-center uppercase text-xl font-semibold rounded-t-2xl border-b-2 border-gray-800">
              Import Data Pegawai
            </h2>
            <form onSubmit={handleImportSubmit} className="p-6 flex flex-col gap-4">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleImportFileChange}
                required
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={handleCloseImportModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  disabled={importLoading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                  disabled={importLoading}
                >
                  {importLoading ? "Mengimpor..." : "Import"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pegawai;
