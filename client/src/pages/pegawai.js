import React, { useState, useEffect, useCallback } from "react";
import Menu from "../components/Menu";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { FaFileImport, FaDownload } from "react-icons/fa";
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
  const [expandedPegawai, setExpandedPegawai] = useState(null);

  const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;

  const fetchPegawai = useCallback(async () => {
    const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;
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
  },[navigate]);

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
    } catch (error) {
      console.error("Error fetching jabatan:", error);
    }
  },[navigate]);

  useEffect(() => {
    fetchPegawai();
    fetchJabatan();
  }, [fetchJabatan, fetchPegawai]);

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

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = `${BACKEND_API_URL}/public/template_import_murid_pegawai_final.xlsx`;
    link.download = 'template_import_pegawai.xlsx';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    // Reset form validation
    const form = document.querySelector('form');
    if (form) {
      form.reset();
      // Clear all custom validity messages
      const inputs = form.querySelectorAll('input, select, textarea');
      inputs.forEach(input => input.setCustomValidity(''));
    }
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

  // Handler untuk validasi menggunakan browser native validation
  const handleInvalid = (e) => {
    const field = e.target;
    const value = field.value;
    
    // Check if field is empty or only whitespace
    if (!value || value === '' || (typeof value === 'string' && value.trim() === '')) {
      field.setCustomValidity('Please fill up this field');
    } else {
      field.setCustomValidity('');
    }
  };

  // Handler untuk clear custom validity saat user mulai mengetik
  const handleInput = (e) => {
    e.target.setCustomValidity('');
    handleInputChange(e);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    // Let browser handle validation
    const form = e.target;
    if (!form.checkValidity()) {
      // Find first invalid field and focus it
      const firstInvalid = form.querySelector(':invalid');
      if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Trim all string values before sending
      const cleanedData = { ...currentPegawai };
      Object.keys(cleanedData).forEach((key) => {
        if (typeof cleanedData[key] === 'string') {
          cleanedData[key] = cleanedData[key].trim();
        }
      });

      if (isEditing) {
        await axios.put(
          `${BACKEND_API_URL}/user/${currentPegawai.NIK}`,
          cleanedData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      } else {
        await axios.post(`${BACKEND_API_URL}/user`, cleanedData);
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
      <div className="flex flex-col flex-1 p-2 md:p-4 lg:ml-48 transition-all duration-200">
        <div className="bg-white shadow-sm rounded-lg p-3 md:p-5 mt-2">
          {/* Mobile Header */}
          <div className="md:hidden mb-4">
            <h1 className="text-lg font-semibold text-gray-800 mb-3">
              Data Pegawai
            </h1>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleOpenImportModal}
                className="w-full bg-blue-600 text-white px-3 py-2 rounded text-sm active:bg-blue-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaFileImport /> Import Data
              </button>
              <button
                onClick={handleOpenAddModal}
                className="w-full bg-green-600 text-white px-3 py-2 rounded text-sm active:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaPlus /> Tambah Pegawai
              </button>
            </div>
          </div>

          {/* Desktop Header */}
          <div className="hidden md:flex justify-between items-center mb-4">
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
            <div className="text-center py-4 text-sm md:text-base">Loading...</div>
          ) : (
            <>
              {/* Mobile Card Layout */}
              <div className="md:hidden space-y-2">
                {pegawai.map((item) => (
                  <div key={item.NIK} className="bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                    <div 
                      className="flex justify-between items-center p-3 cursor-pointer"
                      onClick={() => setExpandedPegawai(expandedPegawai === item.NIK ? null : item.NIK)}
                    >
                      <h3 className="text-sm font-semibold text-gray-900 flex-1">{item.nama}</h3>
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
                            handleDelete(item.NIK);
                          }}
                          className="text-red-600 active:text-red-800 p-1"
                          title="Hapus"
                        >
                          <FaTrash size={16} />
                        </button>
                        <svg
                          className={`w-4 h-4 text-gray-500 transition-transform ${expandedPegawai === item.NIK ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {expandedPegawai === item.NIK && (
                      <div className="px-3 pb-3 pt-2 bg-white border-t border-gray-200 space-y-2 transition-all duration-200">
                        <div className="flex items-center text-xs text-gray-700">
                          <span className="font-medium w-20">NIK:</span>
                          <span>{item.NIK}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-700">
                          <span className="font-medium w-20">Role:</span>
                          <span>{item.role}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-700">
                          <span className="font-medium w-20">Jabatan:</span>
                          <span>{item.jabatan?.nama_jabatan || "-"}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                {pegawai.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    Tidak ada data pegawai
                  </div>
                )}
              </div>

              {/* Desktop Table Layout */}
              <div className="hidden md:block overflow-x-auto">
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
            </>
          )}
        </div>
      </div>

      {/* Unified Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
          <div className="bg-gray-200 border-2 border-gray-700 rounded-lg md:rounded-2xl w-full max-w-4xl max-h-[95vh] md:max-h-[90vh] flex flex-col shadow-xl">
            <h2 className="sticky top-0 z-10 bg-gray-700 text-white p-3 md:p-4 text-center uppercase text-sm md:text-xl font-semibold rounded-t-lg md:rounded-t-2xl border-b-2 border-gray-800">
              {isEditing ? "Edit Pegawai" : "Tambah Pegawai"}
            </h2>
            <div className="overflow-y-auto p-3 md:p-6">
              <form onSubmit={handleFormSubmit} className="space-y-3 md:space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
                  <h3 className="md:col-span-4 text-sm md:text-md font-semibold text-gray-700 border-b pb-2">
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
                      pattern=".*\S+.*"
                      disabled={isEditing}
                      className={`mt-1 block w-full rounded-md border border-gray-600 shadow-sm  ${isEditing ? "bg-gray-200 cursor-not-allowed" : "bg-white"}`}
                      value={currentPegawai.NIK}
                      onChange={handleInput}
                      onInvalid={handleInvalid}
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
                      pattern=".*\S+.*"
                      className="mt-1 block w-full rounded-md border border-gray-600 shadow-sm bg-white"
                      value={currentPegawai.nama}
                      onChange={handleInput}
                      onInvalid={handleInvalid}
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
                      pattern=".*\S+.*"
                      className="mt-1 block w-full rounded-md border border-gray-600 shadow-sm bg-white"
                      value={currentPegawai.tempat_lahir}
                      onChange={handleInput}
                      onInvalid={handleInvalid}
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
                      className="mt-1 block w-full rounded-md border border-gray-600 shadow-sm bg-white"
                      value={currentPegawai.tanggal_lahir}
                      onChange={handleInputChange}
                      onInvalid={handleInvalid}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Jenis Kelamin
                    </label>
                    <select
                      name="jenis_kelamin"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-600 shadow-sm bg-white"
                      value={currentPegawai.jenis_kelamin}
                      onChange={handleInputChange}
                      onInvalid={handleInvalid}
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
                      className="mt-1 block w-full rounded-md border border-gray-600 shadow-sm bg-white"
                      value={currentPegawai.agama}
                      onChange={handleInputChange}
                      onInvalid={handleInvalid}
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
                      pattern=".*\S+.*"
                      className="mt-1 block w-full rounded-md border border-gray-600 shadow-sm bg-white"
                      value={currentPegawai.no_HP}
                      onChange={handleInput}
                      onInvalid={handleInvalid}
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
                      pattern=".*\S+.*"
                      className="mt-1 block w-full rounded-md border border-gray-600 shadow-sm bg-white"
                      value={currentPegawai.email}
                      onChange={handleInput}
                      onInvalid={handleInvalid}
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
                      className="mt-1 block w-full rounded-md border border-gray-600 shadow-sm bg-white"
                      value={currentPegawai.alamat}
                      onChange={handleInput}
                      onInvalid={handleInvalid}
                      placeholder="Masukkan alamat lengkap"
                    />
                  </div>

                  <h3 className="md:col-span-4 text-sm md:text-md font-semibold text-gray-700 border-b pb-2 mt-3 md:mt-4">
                    Informasi Kepegawaian & Jabatan
                  </h3>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Jabatan
                    </label>
                    <select
                      name="jabatan_id"
                      required
                      className="mt-1 block w-full rounded-md border border-gray-600 shadow-sm bg-white"
                      value={currentPegawai.jabatan_id}
                      onChange={handleInputChange}
                      onInvalid={handleInvalid}
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
                      className="mt-1 block w-full rounded-md border border-gray-600 shadow-sm bg-white"
                      value={currentPegawai.role}
                      onChange={handleInputChange}
                      onInvalid={handleInvalid}
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
                      className="mt-1 block w-full rounded-md border border-gray-600 shadow-sm bg-white"
                      value={currentPegawai.status}
                      onChange={handleInputChange}
                      onInvalid={handleInvalid}
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
                <div className="mt-4 md:mt-6 flex flex-col md:flex-row justify-end gap-2 pt-3 md:pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="w-full md:w-auto px-4 py-2 text-xs md:text-sm font-medium text-gray-700 bg-gray-100 active:bg-gray-200 md:hover:bg-gray-200 rounded-md"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="w-full md:w-auto px-4 py-2 text-xs md:text-sm font-medium text-white bg-green-600 active:bg-green-700 md:hover:bg-green-700 rounded-md"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
          <div className="bg-gray-200 border-2 border-gray-700 rounded-lg md:rounded-2xl w-full max-w-md flex flex-col shadow-xl max-h-[95vh] md:max-h-auto">
            <h2 className="bg-gray-700 text-white p-3 md:p-4 text-center uppercase text-sm md:text-xl font-semibold rounded-t-lg md:rounded-t-2xl border-b-2 border-gray-800">
              Import Data Pegawai
            </h2>
            <div className="p-4 md:p-6 flex flex-col gap-3 md:gap-4 overflow-y-auto">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">Panduan Import Data:</h3>
                <ol className="text-xs text-blue-700 space-y-1">
                  <li>1. Download template Excel terlebih dahulu</li>
                  <li>2. Buatkan file Excel tersendiri untuk sheet "Pegawai"</li>
                  <li>3. Isi data Pegawai sesuai format yang ada di template</li>
                  <li>4. Simpan file dan upload kembali</li>
                  <li>5. Pastikan format file adalah .xlsx atau .xls</li>
                </ol>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-700">Download template Excel:</span>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <FaDownload /> Download Template
                </button>
              </div>
              <form onSubmit={handleImportSubmit} className="flex flex-col gap-4">
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
        </div>
      )}
    </div>
  );
}

export default Pegawai;

