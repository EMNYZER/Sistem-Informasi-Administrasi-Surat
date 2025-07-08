// formSuratmasuk.js
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Menu from "../components/Menu";
import axios from "axios";

function FormSuratMasuk() {
  const navigate = useNavigate();
  const { id_surat } = useParams();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nomor_surat: "",
    tanggal_surat: "",
    tanggal_terima: new Date().toISOString().split("T")[0],
    asal: "",
    perihal: "",
    lampiran: "",
    status_disposisi: "Belum",
    status_surat: "Asli",
    sifat: "Biasa",
    catatan: "",
    file_surat: null,
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFileWarning, setShowFileWarning] = useState(false);
  const [showFileWarningModal, setShowFileWarningModal] = useState(false);
  const [deferSubmit, setDeferSubmit] = useState(false);
  const [submitAction, setSubmitAction] = useState("");


  useEffect(() => {
    if (id_surat) {
      setIsEditing(true);
      fetchSuratData();
    }
  }, [id_surat]);

  const fetchSuratData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `http://localhost:3001/suratMasuk/${id_surat}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const data = response.data;
      setFormData({
        nomor_surat: data.nomor_surat,
        tanggal_surat: new Date(data.tanggal_surat)
          .toISOString()
          .split("T")[0],
        tanggal_terima: new Date(data.tanggal_terima)
          .toISOString()
          .split("T")[0],
        asal: data.asal,
        perihal: data.perihal,
        lampiran: data.lampiran,
        status_disposisi: data.status_disposisi,
        status_surat: data.status_surat,
        sifat: data.sifat,
        catatan: data.catatan || "",
        file_surat: data.file_surat, // keep track of existing file
      });
    } catch (error) {
      console.error("Gagal mengambil data surat:", error);
      alert("Gagal mengambil data surat.");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setFormData({ ...formData, file_surat: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const token = localStorage.getItem("token");
    const nik = localStorage.getItem("nik");
    if (!token || !nik) {
      navigate("/login");
      return;
    }
  
    // Tampilkan modal jika file kosong, dan belum mengonfirmasi lanjut
    if (!formData.file_surat && !selectedFile && !deferSubmit) {
      setShowFileWarningModal(true);
      setLoading(false);
      return;
    }
  
    const data = new FormData();
    formData.NIK = nik;
    // Set status_disposisi sesuai aksi
    if (submitAction === "draft") {
      formData.status_disposisi = "Draft";
    } else if (submitAction === "belum") {
      formData.status_disposisi = "Belum";
    }
  
    for (const key in formData) {
      data.append(key, formData[key]);
    }
  
    if (selectedFile) {
      data.set("file_surat", selectedFile);
    } else {
      data.delete("file_surat");
    }
  
    try {
      if (isEditing) {
        await axios.put(`http://localhost:3001/suratMasuk/${id_surat}`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        alert("Surat masuk berhasil diperbarui!");
      } else {
        await axios.post("http://localhost:3001/suratMasuk", data, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        alert("Surat masuk berhasil dicatat!");
      }
      navigate("/surat-masuk");
    } catch (error) {
      console.error("Gagal menyimpan surat masuk:", error);
      alert("Terjadi kesalahan saat menyimpan surat.");
    } finally {
      setLoading(false);
      setDeferSubmit(false); // reset untuk next submit
    }
  };
  

  const removeFile = () => {
    setSelectedFile(null);
    setFormData({ ...formData, file_surat: null });
    document.getElementById("file-upload").value = "";
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Menu />
      <div className="flex-1 flex flex-col lg:ml-48 transition-all duration-200">
        <Header />
        <main className="flex-1 p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="max-w-7xl mx-auto">
            <div className="bg-white shadow-sm rounded-lg">
              {/* <div className="px-6 py-4 border-b">
                <h1 className="text-xl font-semibold text-gray-800">
                  {isEditing
                    ? "Edit Surat Masuk"
                    : "Formulir Surat Masuk"}
                </h1>
              </div> */}

              <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-8">
                {/* Kolom Kiri */}
                <div className="space-y-5">
                  <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">
                    Informasi Utama
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nomor Surat <span className="text-red-500">*</span>
                      </label>
                      <input type="text" name="nomor_surat" value={formData.nomor_surat} onChange={handleChange} required placeholder="Contoh: 123/ABC/XX/2023" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Asal Surat <span className="text-red-500">*</span>
                      </label>
                      <input type="text" name="asal" value={formData.asal} onChange={handleChange} required placeholder="Instansi/Perusahaan Pengirim" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tanggal Surat <span className="text-red-500">*</span>
                      </label>
                      <input type="date" name="tanggal_surat" value={formData.tanggal_surat} onChange={handleChange} required className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Perihal <span className="text-red-500">*</span>
                      </label>
                      <textarea name="perihal" value={formData.perihal} onChange={handleChange} required rows="3" placeholder="Perihal singkat surat" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500" />
                    </div>
                  </div>
                </div>

                {/* Kolom Kanan */}
                <div className="space-y-5">
                  {/* Detail & Klasifikasi */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-700 border-b pb-2">
                      Detail & Klasifikasi
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Terima <span className="text-red-500">*</span></label>
                        <input 
                          type="date" 
                          name="tanggal_terima" 
                          value={formData.tanggal_terima} 
                          onChange={handleChange} 
                          required 
                          readOnly
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 bg-gray-100 cursor-not-allowed" 
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Lampiran</label>
                        <input type="text" name="lampiran" value={formData.lampiran} onChange={handleChange} placeholder="Contoh: 1 Berkas" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sifat Surat <span className="text-red-500">*</span></label>
                        <select name="sifat" value={formData.sifat} onChange={handleChange} required className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 bg-white">
                          <option value="Biasa">Biasa</option>
                          <option value="Segera">Segera</option>
                          <option value="Sangat Segera">Sangat Segera</option>
                          <option value="Rahasia">Rahasia</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status Surat <span className="text-red-500">*</span></label>
                        <select name="status_surat" value={formData.status_surat} onChange={handleChange} required className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500 bg-white">
                          <option value="Asli">Asli</option>
                          <option value="Tembusan">Tembusan</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Dokumen & Catatan */}
                  <div>
                    <h2 className="text-lg font-semibold text-gray-700 border-b pb-2 mt-4">
                      Dokumen & Catatan
                    </h2>
                    <div className="space-y-5 mt-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Upload Scan Surat</label>
                        <div className="flex items-center space-x-2">
                          <label htmlFor="file-upload" className="cursor-pointer text-sm bg-white border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-50">Pilih File</label>
                          <input id="file-upload" name="file_surat" type="file" className="hidden" onChange={handleFileChange} accept=".pdf,.doc,.docx,.jpg,.png" />
                          {selectedFile ? (
                            <div className="flex items-center space-x-2 text-sm">
                              <span className="truncate max-w-xs">{selectedFile.name}</span>
                              <button type="button" onClick={removeFile} className="text-red-500 hover:text-red-700">&times;</button>
                            </div>
                          ) : formData.file_surat && isEditing && (
                            <div className="text-sm text-gray-600">
                              File sebelumnya: <a href={`http://localhost:3001/${formData.file_surat}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Lihat Dokumen</a>
                            </div>
                          )}
                        </div>
                        {showFileWarning && (
                          <p className="text-sm text-yellow-600 mt-1">
                            ⚠ Anda belum mengunggah file scan surat. Surat tetap bisa disimpan, tetapi disarankan untuk melampirkan file.
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                        <textarea name="catatan" value={formData.catatan} onChange={handleChange} rows="3" placeholder="Catatan tambahan jika ada" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-green-500"></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
                <button type="button" onClick={() => navigate("/surat-masuk")} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-700 disabled:opacity-50"
                  onClick={() => setSubmitAction("draft")}
                >
                  {loading && submitAction === "draft" ? "Menyimpan..." : "Simpan Surat"}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                  onClick={() => setSubmitAction("belum")}
                >
                  {loading && submitAction === "belum" ? "Menyimpan..." : "Teruskan"}
                </button>
              </div>
            </div>
          </form>
          {showFileWarningModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
              <div className="bg-white rounded-lg shadow-lg w-[90%] max-w-md p-6">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">
                  File Surat Belum Diunggah
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  Anda belum mengunggah file scan surat. Apakah Anda ingin tetap menyimpan surat ini tanpa file?
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                    onClick={() => setShowFileWarningModal(false)}
                  >
                    Tambahkan File
                  </button>
                  <button
                    className="px-4 py-2 text-sm text-white bg-green-600 rounded hover:bg-green-700"
                    onClick={() => {
                      setShowFileWarningModal(false);
                      setDeferSubmit(true);
                      handleSubmit(new Event("submit")); // trigger ulang submit
                    }}
                  >
                    Simpan Tanpa File
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default FormSuratMasuk;
