import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Menu from "../components/Menu";
import SearchData from "../components/SearchData";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function FormSuratKeluar() {
  const navigate = useNavigate();
  const { id_surat, id_template } = useParams();
  const [kategori, setKategori] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showKepada, setShowKepada] = useState(false);
  const [lampiranFile, setLampiranFile] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [formData, setFormData] = useState({
    kode_kategori: "",
    perihal: "",
    sifat: "Biasa",
    lampiran: "",
    kepada: "",
    tujuan: "",
    catatan: "",
    nomor_surat: "",
    tanggal_surat: new Date().toISOString().split("T")[0],
    isi_surat: "",
  });
  const [isReadOnly, setIsReadOnly] = useState(false);

  useEffect(() => {
    fetchKategori();
    if (id_surat) {
      fetchSuratData();
    } else if (id_template) {
      fetchTemplateData();
    }
  }, [id_surat, id_template]);

  const fetchKategori = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await axios.get("http://localhost:3001/kategori", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setKategori(response.data);
    } catch (error) {
      console.error("Error fetching kategori:", error);
    }
  };

  const fetchSuratData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(
        `http://localhost:3001/suratKeluar/${id_surat}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const suratData = response.data;
      setFormData({
        kode_kategori: suratData.kode_kategori || "",
        perihal: suratData.perihal || "",
        sifat: suratData.sifat || "Biasa",
        lampiran: suratData.lampiran || "",
        kepada: suratData.kepada || "",
        tujuan: suratData.tujuan || "",
        catatan: suratData.catatan || "",
        nomor_surat: suratData.nomor_surat || "",
        tanggal_surat: suratData.tanggal_surat
          ? new Date(suratData.tanggal_surat).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
        isi_surat: suratData.isi_surat || "",
      });

      // Set showKepada if kepada field has value
      if (suratData.kepada) {
        setShowKepada(true);
      }

      setIsEditing(true);
      // Set isReadOnly jika status bukan draft/revisi
      setIsReadOnly(
        suratData.status !== "draft" && suratData.status !== "revisi",
      );
    } catch (error) {
      console.error("Error fetching surat data:", error);
      alert("Gagal mengambil data surat");
    }
  };

  const fetchTemplateData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await axios.get(
        `http://localhost:3001/template/${id_template}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      const templateData = response.data;
      setFormData((prev) => ({
        ...prev,
        kode_kategori:
          templateData.kode_kategori ||
          templateData.kategori?.kode_kategori ||
          "",
        perihal: templateData.perihal || "",
        isi_surat: templateData.isi_surat || "",
        // deskripsi: templateData.deskripsi || '', // jika ingin menambah field deskripsi
      }));
    } catch (error) {
      console.error("Error fetching template data:", error);
      alert("Gagal mengambil data template");
    }
  };

  const uploadLampiranPDF = async (id) => {
    if (!lampiranFile) return;

    const formDataPDF = new FormData();
    formDataPDF.append("file", lampiranFile);

    const token = localStorage.getItem("token");
    await axios.post(
      `http://localhost:3001/suratKeluar/upload-lampiran/${id}`,
      formDataPDF,
      {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      },
    );
  };

  const handleSubmit = async (e, action) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      // Get NIK from localStorage or user context
      const nik = localStorage.getItem("nik");

      const submitData = {
        ...formData,
        NIK: nik,
        tanggal_surat: new Date(formData.tanggal_surat).toISOString(),
        status: action === "ajukan" ? "diajukan" : "draft",
      };

      if (isEditing) {
        if (lampiranFile) {
          submitData.ganti_lampiran = "true";
        }
        // Update existing surat
        await axios.put(
          `http://localhost:3001/suratKeluar/${id_surat}`,
          submitData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (lampiranFile) {
          await uploadLampiranPDF(id_surat);
        }
        alert(
          `Surat keluar berhasil ${action === "ajukan" ? "diajukan" : "diperbarui"}!`,
        );
        navigate("/surat-keluar");
      } else {
        // Create new surat
        const createRes = await axios.post(
          "http://localhost:3001/suratKeluar",
          submitData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        // Upload lampiran jika ada
        if (lampiranFile && createRes.data.id_surat) {
          await uploadLampiranPDF(createRes.data.id_surat);
        }
        alert(
          `Surat keluar berhasil ${action === "ajukan" ? "diajukan" : "disimpan"}!`,
        );
      }

      navigate("/surat-keluar");
    } catch (error) {
      console.error("Error creating/updating surat keluar:", error);
      alert(error.response?.data?.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditorChange = (content) => {
    setFormData((prev) => ({
      ...prev,
      isi_surat: content,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        alert("Lampiran hanya boleh berupa file PDF");
        return;
      }

      setLampiranFile(file);
      setSelectedFiles([file]);
      // setFormData(prev => ({
      //   ...prev,
      //   lampiran: '1 lampiran'
      // }));
    }
  };

  const removeFile = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);

    const fileNames = newFiles.map((file) => file.name).join(", ");
    setFormData((prev) => ({
      ...prev,
      lampiran: fileNames,
    }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Menu />
      <div className="flex-1 p-3">
        <Header />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 max-w-7xl mx-auto mt-4">
          {/* Form Section */}
          <div className="col-span-2">
            <div className="bg-white shadow-sm rounded-lg p-3 mt-2">
              <div className="mb-3 flex justify-between items-center">
                <h2 className={`text-lg font-semibold text-gray-800`}>
                  {isReadOnly
                    ? "Info Surat Keluar"
                    : isEditing
                      ? "Edit Surat Keluar"
                      : "Buat Surat Keluar Baru"}
                </h2>
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium text-gray-700">
                    Nomor Surat:
                  </label>
                  <input
                    type="text"
                    name="nomor_surat"
                    value={formData.nomor_surat}
                    readOnly
                    className={`px-2 py-1 text-sm border border-gray-200 bg-gray-100 rounded focus:outline-none cursor-not-allowed ${isReadOnly ? "bg-gray-100" : ""}`}
                    placeholder="Diisi oleh admin"
                  />
                </div>
              </div>

              <form
                onSubmit={(e) => handleSubmit(e, "simpan")}
                className="space-y-3"
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  {/* Kategori */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="kode_kategori"
                      value={formData.kode_kategori}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${isReadOnly ? "bg-gray-100" : ""}`}
                      disabled={isReadOnly}
                      modules={{
                        keyboard: {
                          bindings: {
                            tab: {
                              key: 9,
                              handler: function (range, context) {
                                this.quill.insertText(range.index, "\t"); // Tab karakter
                                this.quill.setSelection(range.index + 1);
                                return false;
                              },
                            },
                          },
                        },
                      }}
                    >
                      <option value="">Pilih Kategori</option>
                      {kategori.map((kat) => (
                        <option
                          key={kat.kode_kategori}
                          value={kat.kode_kategori}
                        >
                          {kat.nama_kategori}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Sifat */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Sifat <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="sifat"
                      value={formData.sifat}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${isReadOnly ? "bg-gray-100" : ""}`}
                      disabled={isReadOnly}
                    >
                      <option value="Biasa">Biasa</option>
                      <option value="Segera">Segera</option>
                      <option value="Sangat Segera">Sangat Segera</option>
                      <option value="Rahasia">Rahasia</option>
                    </select>
                  </div>

                  {/* Perihal */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Perihal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="perihal"
                      value={formData.perihal}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${isReadOnly ? "bg-gray-100" : ""}`}
                      placeholder="Perihal surat"
                      readOnly={isReadOnly}
                    />
                  </div>

                  {/* Tanggal Surat */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="tanggal_surat"
                      value={formData.tanggal_surat}
                      readOnly
                      disabled={isReadOnly}
                      className={`w-full px-2 py-1 text-sm border border-gray-300 rounded ${isReadOnly ? "bg-gray-100" : "bg-gray-50"} cursor-not-allowed`}
                    />
                  </div>

                  {/* Toggle Kepada */}
                  <div className="md:col-span-2">
                    <div className="flex items-center space-x-2 mb-1">
                      <input
                        type="checkbox"
                        id="showKepada"
                        checked={showKepada}
                        onChange={(e) => setShowKepada(e.target.checked)}
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        disabled={isReadOnly}
                      />
                      <label
                        htmlFor="showKepada"
                        className="text-sm text-gray-700 font-medium"
                      >
                        Yth Kepada:
                      </label>
                    </div>
                    <input
                      type="text"
                      name="kepada"
                      value={formData.kepada}
                      onChange={handleInputChange}
                      disabled={!showKepada || isReadOnly}
                      className={`w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${isReadOnly || !showKepada ? "bg-gray-100" : ""}`}
                      placeholder="contoh: Kepala A; Ketua Umum B; Direktur C"
                    />
                  </div>

                  {/* Tujuan */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tujuan <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="tujuan"
                      value={formData.tujuan}
                      onChange={handleInputChange}
                      required
                      className={`w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${isReadOnly ? "bg-gray-100" : ""}`}
                      placeholder="Tujuan surat"
                      readOnly={isReadOnly}
                    />
                  </div>

                  {/* Lampiran */}
                  <div className="md:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lampiran
                    </label>
                    <input
                      type="text"
                      name="lampiran"
                      value={formData.lampiran}
                      onChange={handleInputChange}
                      className={`w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500 ${isReadOnly ? "bg-gray-100" : ""}`}
                      placeholder="contoh: 1 lembar"
                      readOnly={isReadOnly}
                    />
                  </div>

                  {/* File Upload Section */}
                  <div className="md:col-span-1">
                    {selectedFiles.length === 0 ? (
                      <div className="w-full max-w-md border border-dashed border-gray-300 rounded px-3 py-2 bg-white">
                        <input
                          type="file"
                          onChange={handleFileChange}
                          className="hidden"
                          id="file-upload"
                          accept=".pdf"
                          disabled={isReadOnly}
                        />
                        <label
                          htmlFor="file-upload"
                          className={`cursor-pointer text-blue-500 text-sm hover:underline hover:text-gray-900 ${isReadOnly ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          Upload Lampiran disini
                        </label>
                        <p className="text-xs text-gray-500">(Hanya PDF)</p>
                      </div>
                    ) : (
                      <div className="space-y-1 text-sm text-gray-700 max-w-md">
                        {selectedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center border rounded px-2 py-1 bg-gray-50"
                          >
                            <div className="flex flex-col">
                              <label className="text-sm font-medium text-gray-700 mb-1">
                                lampiran:
                              </label>
                              <span className="truncate max-w-[200px]">
                                {file.name}
                              </span>
                            </div>
                            {!isReadOnly && (
                              <button
                                type="button"
                                onClick={() => removeFile(index)}
                                className="text-red-500 hover:text-red-700 text-xs"
                              >
                                Hapus
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Catatan (Read Only) */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Catatan
                    </label>
                    <input
                      type="text"
                      name="catatan"
                      value={formData.catatan}
                      readOnly
                      className={`w-full px-2 py-1 text-sm border border-gray-200 bg-gray-100 rounded focus:outline-none cursor-not-allowed ${isReadOnly ? "bg-gray-100" : ""}`}
                      placeholder="Diisi oleh admin"
                      disabled={isReadOnly}
                    />
                  </div>
                </div>
                {/* Isi Surat - Text Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Isi Surat <span className="text-red-500">*</span>
                  </label>
                  <div className="max-h-[300px] overflow-y-auto">
                    <ReactQuill
                      theme="snow"
                      value={formData.isi_surat}
                      onChange={(value) => handleEditorChange(value)}
                      className={`h-[250px] w-full text-sm border-0 focus:outline-none ${isReadOnly ? "bg-gray-100" : ""}`}
                      readOnly={isReadOnly}
                      placeholder="Masukkan isi surat... "
                    />
                  </div>
                </div>
                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => navigate("/surat-keluar")}
                    className="px-3 py-1 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded"
                  >
                    Kembali
                  </button>
                  {!isReadOnly && (
                    <>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-3 py-1 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
                      >
                        {loading
                          ? "Menyimpan..."
                          : isEditing
                            ? "Update"
                            : "Simpan"}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleSubmit(e, "ajukan")}
                        disabled={loading}
                        className="px-3 py-1 text-sm text-white bg-green-600 hover:bg-green-700 rounded disabled:opacity-50"
                      >
                        {loading ? "Mengajukan..." : "Ajukan"}
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>
          </div>
          {/* SearchData Component */}
          <div className="col-span-1">
            <div className="bg-white shadow-sm rounded-lg p-3 mt-2">
              <SearchData />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormSuratKeluar;
