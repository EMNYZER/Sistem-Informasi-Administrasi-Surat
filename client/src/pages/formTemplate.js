import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Menu from "../components/Menu";
import axios from "axios";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

function FormTemplate() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [kategori, setKategori] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    kode_kategori: "",
    perihal: "",
    deskripsi: "",
    isi_surat: "",
  });

  const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;

  useEffect(() => {
    fetchKategori();
    console.log(id);
    if (id) {
      fetchTemplateData();
    }
  }, [id]);

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
    } catch (error) {
      console.error("Error fetching kategori:", error);
    }
  };

  const fetchTemplateData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(`${BACKEND_API_URL}/template/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const templateData = response.data;
      setFormData({
        kode_kategori:
          templateData.kode_kategori ||
          templateData.kategori?.kode_kategori ||
          "",
        perihal: templateData.perihal || "",
        deskripsi: templateData.deskripsi || "",
        isi_surat: templateData.isi_surat || "",
      });

      setIsEditing(true);
    } catch (error) {
      console.error("Error fetching template data:", error);
      alert("Gagal mengambil data template");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const submitData = {
        kode_kategori: formData.kode_kategori,
        perihal: formData.perihal,
        deskripsi: formData.deskripsi,
        isi_surat: formData.isi_surat,
      };

      if (isEditing) {
        // Update existing template
        await axios.put(`${BACKEND_API_URL}/template/${id}`, submitData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert("Template berhasil diperbarui!");
      } else {
        // Create new template
        await axios.post(`${BACKEND_API_URL}/template`, submitData, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert("Template berhasil disimpan!");
      }

      navigate("/template-surat");
    } catch (error) {
      console.error("Error creating/updating template:", error);
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Menu />
      <div className="flex flex-col flex-1 p-4 lg:ml-48 transition-all duration-200">
        <Header />
        <div className="mt-4">
          {/* Form Section */}
          <div className="bg-white shadow-sm rounded-lg p-3 mt-2 px-0 sm:px-2 md:px-4">
            <div className="mb-3">
              <h2 className="text-lg font-semibold text-gray-800">
                {isEditing ? "Edit Template Surat" : "Buat Template Surat Baru"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Left Column - Form Fields (1/3 width) */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 gap-3">
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
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
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

                    {/* Perihal */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Perihal/Judul <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="perihal"
                        value={formData.perihal}
                        onChange={handleInputChange}
                        required
                        className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                        placeholder="Perihal template"
                      />
                    </div>
                  </div>

                  {/* Deskripsi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Deskripsi <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="deskripsi"
                      value={formData.deskripsi}
                      onChange={handleInputChange}
                      required
                      rows="3"
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
                      placeholder="Deskripsi template surat"
                    />
                  </div>
                </div>

                {/* Right Column - Isi Surat (2/3 width) */}
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Isi Surat <span className="text-red-500">*</span>
                  </label>
                  <div className="h-[450px]">
                    <ReactQuill
                      theme="snow"
                      value={formData.isi_surat}
                      onChange={(value) => handleEditorChange(value)}
                      className="h-[400px] w-full text-sm border-0 focus:outline-none"
                      placeholder="Masukkan isi template surat..."
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => navigate("/template-surat")}
                  className="px-3 py-1 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-3 py-1 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50"
                >
                  {loading ? "Menyimpan..." : isEditing ? "Update" : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FormTemplate;
