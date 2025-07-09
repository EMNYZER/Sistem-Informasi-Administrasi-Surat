import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Menu from "../components/Menu";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";
import { FaFileImport, FaDownload } from "react-icons/fa";

const initialFormState = {
  NIS: "",
  NISN: "",
  NIK: "",
  nama: "",
  jenis_kelamin: "",
  tempat_lahir: "",
  tanggal_lahir: "",
  alamat: "",
  rombel: "",
  tahun_ajaran: "",
  status_siswa: "Aktif",
  status_registrasi: "Siswa Baru",
  nama_ayah: "",
  nama_ibu: "",
  pekerjaan_ayah: "",
  pekerjaan_ibu: "",
  no_hp_ayah: "",
  no_hp_ibu: "",
};

function Murid() {
  const navigate = useNavigate();
  const [murid, setMurid] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentMurid, setCurrentMurid] = useState(initialFormState);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);

  const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;

  useEffect(() => {
    fetchMurid();
  }, []);

  const fetchMurid = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await axios.get(`${BACKEND_API_URL}/murid`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setMurid(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching murid:", error);
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentMurid((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenAddModal = () => {
    setIsEditing(false);
    setCurrentMurid(initialFormState);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleOpenImportModal = () => setShowImportModal(true);
  const handleCloseImportModal = () => {
    setShowImportModal(false);
    setImportFile(null);
  };

  const handleImportFileChange = (e) => setImportFile(e.target.files[0]);

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) return alert("Pilih file terlebih dahulu!");
    setImportLoading(true);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", importFile);
      await axios.post(`${BACKEND_API_URL}/murid/import`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });
      setShowImportModal(false);
      setImportFile(null);
      fetchMurid();
      alert("Import data murid berhasil!");
    } catch (err) {
      alert("Gagal import: " + (err.response?.data?.message || err.message));
    }
    setImportLoading(false);
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = `${BACKEND_API_URL}/public/template_import_murid_pegawai_final.xlsx`;
    link.download = 'template_import_murid.xlsx';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (nis) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus murid ini?")) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        await axios.delete(`${BACKEND_API_URL}/murid/${nis}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchMurid();
      } catch (error) {
        console.error("Error deleting murid:", error);
      }
    }
  };

  const handleEdit = (murid) => {
    setIsEditing(true);
    setCurrentMurid({
      ...murid,
      tanggal_lahir: murid.tanggal_lahir ? new Date(murid.tanggal_lahir).toISOString().split("T")[0] : "",
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
          `${BACKEND_API_URL}/murid/${currentMurid.NIS}`,
          currentMurid,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      } else {
        await axios.post(`${BACKEND_API_URL}/murid`, currentMurid, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
      setShowModal(false);
      fetchMurid();
    } catch (error) {
      console.error("Error saving murid:", error);
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
              Data Murid
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
                <FaPlus /> Tambah Murid
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
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NIS</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jenis Kelamin</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tahun Ajaran</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rombel</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {murid.map((item) => (
                    <tr key={item.NIS}>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.NIS}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.nama}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.jenis_kelamin}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.tahun_ajaran}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">{item.rombel}</td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="text-yellow-600 hover:text-yellow-800"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(item.NIS)}
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

      {/* Modal Tambah/Edit Murid */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-200 border-2 border-gray-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-xl">
            <h2 className="sticky top-0 z-10 bg-gray-700 text-white p-4 text-center uppercase text-xl font-semibold rounded-t-2xl border-b-2 border-gray-800">
              {isEditing ? "Edit Murid" : "Tambah Murid"}
            </h2>
            <div className="overflow-y-auto p-6">
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <h3 className="md:col-span-4 text-md font-semibold text-gray-700 border-b pb-2">
                    Data Siswa
                  </h3>
                  <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">NIS</label>
                      <input name="NIS" type="text" required disabled={isEditing} className={`mt-1 block w-full rounded-md border border-gray-600 shadow-sm  ${isEditing ? "bg-gray-200 cursor-not-allowed" : "bg-white"}`} value={currentMurid.NIS} onChange={handleInputChange} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">NIK</label>
                      <input name="NIK" type="text" className="mt-1 block w-full rounded-md border border-gray-600 shadow-sm " value={currentMurid.NIK} onChange={handleInputChange} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">NISN</label>
                      <input name="NISN" type="text" required className="mt-1 block w-full rounded-md border border-gray-600 shadow-sm " value={currentMurid.NISN} onChange={handleInputChange} />
                    </div>
                  </div>
                  <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700">Nama</label>
                      <input name="nama" type="text" required className="mt-1 block w-full rounded-md border border-gray-600 shadow-sm " value={currentMurid.nama} onChange={handleInputChange} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Jenis Kelamin</label>
                      <select name="jenis_kelamin" required className="mt-1 block w-full rounded-md border border-gray-600 shadow-sm " value={currentMurid.jenis_kelamin} onChange={handleInputChange}>
                        <option value="">Pilih</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                  </div>
                  <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700">Tempat Lahir</label>
                      <input name="tempat_lahir" type="text" required className="mt-1 block w-full rounded-md border border-gray-600 shadow-sm " value={currentMurid.tempat_lahir} onChange={handleInputChange} />
                    </div>
                    <div className="md:col-span-1">
                      <label className="block text-sm font-medium text-gray-700">Tanggal Lahir</label>
                      <input name="tanggal_lahir" type="date" required className="mt-1 block w-full rounded-md border border-gray-600 shadow-sm " value={currentMurid.tanggal_lahir} onChange={handleInputChange} />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">Alamat</label>
                      <textarea name="alamat" rows="2" className="mt-1 block w-full rounded-md border border-gray-600 shadow-sm " value={currentMurid.alamat} onChange={handleInputChange} placeholder="Masukkan alamat lengkap" />
                    </div>
                  </div>
                  <h3 className="md:col-span-4 text-md font-semibold text-gray-700 border-b pb-2 mt-4">Status dan Tahun Ajaran</h3>
                  <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Rombel</label>
                      <input name="rombel" type="text" required className="mt-1 block w-full rounded-md border border-gray-600 shadow-sm " value={currentMurid.rombel} onChange={handleInputChange} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Tahun Ajaran</label>
                      <input name="tahun_ajaran" type="text" required className="mt-1 block w-full rounded-md border border-gray-600 shadow-sm " value={currentMurid.tahun_ajaran} onChange={handleInputChange} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status Registrasi</label>
                      <select name="status_registrasi" required className="mt-1 block w-full rounded-md border border-gray-600 shadow-sm " value={currentMurid.status_registrasi} onChange={handleInputChange}>
                        <option value="Siswa Baru">Siswa Baru</option>
                        <option value="Pindahan">Pindahan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status Siswa</label>
                      <select name="status_siswa" required className="mt-1 block w-full rounded-md border border-gray-600 shadow-sm " value={currentMurid.status_siswa} onChange={handleInputChange}>
                        <option value="Aktif">Aktif</option>
                        <option value="Pindah">Pindah</option>
                        <option value="Lulus">Lulus</option>
                      </select>
                    </div>
                  </div>
                  <h3 className="md:col-span-4 text-md font-semibold text-gray-700 border-b pb-2 mt-4">
                    Data Orang Tua
                  </h3>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Nama Ayah</label>
                    <input
                      name="nama_ayah"
                      type="text"
                      required
                      className={`mt-1 block w-full rounded-md border border-gray-600 shadow-sm `}
                      value={currentMurid.nama_ayah}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Nama Ibu</label>
                    <input
                      name="nama_ibu"
                      type="text"
                      required
                      className={`mt-1 block w-full rounded-md border border-gray-600 shadow-sm `}
                      value={currentMurid.nama_ibu}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Pekerjaan Ayah</label>
                    <input
                      name="pekerjaan_ayah"
                      type="text"
                      className={`mt-1 block w-full rounded-md border border-gray-600 shadow-sm `}
                      value={currentMurid.pekerjaan_ayah}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Pekerjaan Ibu</label>
                    <input
                      name="pekerjaan_ibu"
                      type="text"
                      className={`mt-1 block w-full rounded-md border border-gray-600 shadow-sm `}
                      value={currentMurid.pekerjaan_ibu}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">No HP Ayah</label>
                    <input
                      name="no_hp_ayah"
                      type="text"
                      className={`mt-1 block w-full rounded-md border border-gray-600 shadow-sm `}
                      value={currentMurid.no_hp_ayah}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">No HP Ibu</label>
                    <input
                      name="no_hp_ibu"
                      type="text"
                      className={`mt-1 block w-full rounded-md border border-gray-600 shadow-sm `}
                      value={currentMurid.no_hp_ibu}
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

      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-200 border-2 border-gray-700 rounded-2xl w-full max-w-md flex flex-col shadow-xl">
            <h2 className="bg-gray-700 text-white p-4 text-center uppercase text-xl font-semibold rounded-t-2xl border-b-2 border-gray-800">
              Import Data Murid
            </h2>
            <div className="p-6 flex flex-col gap-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <h3 className="text-sm font-semibold text-blue-800 mb-2">Panduan Import Data:</h3>
                <ol className="text-xs text-blue-700 space-y-1">
                  <li>1. Download template Excel terlebih dahulu</li>
                  <li>2. Buatkan file Excel tersendiri untuk sheet "Murid"</li>
                  <li>3. Isi data Murid sesuai format yang ada di template</li>
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
                    {importLoading ? "Mengupload..." : "Import"}
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

export default Murid;