import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Menu from "../components/Menu";
import axios from "axios";
import { FaEdit, FaTrash, FaPlus } from "react-icons/fa";

function TemplateSurat() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [kategori, setKategori] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKategori();
    fetchTemplates();
  }, []);

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

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.get(`http://localhost:3001/template`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const mockTemplates = response.data;

      setTemplates(mockTemplates);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching templates:", error);
      setLoading(false);
    }
  };

  const handleEdit = (template) => {
    navigate(`/template-form/${template.id}`);
  };

  const handleDelete = async (template) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus template ini?")) {
      try {
        const token = localStorage.getItem("token");
        await axios.delete(`http://localhost:3001/template/${template.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        // Refresh daftar template setelah dihapus
        fetchTemplates();
      } catch (error) {
        console.error("Gagal menghapus template:", error);
        alert("Terjadi kesalahan saat menghapus template.");
      }
    }
  };

  const getKategoriName = (kodeKategori) => {
    const kat = kategori.find((k) => k.kode_kategori === kodeKategori);
    return kat ? kat.nama_kategori : "Kategori Tidak Diketahui";
  };

  // Group templates by category
  const groupedTemplates = templates.reduce((acc, template) => {
    const kategoriName =
      template.kategori?.nama_kategori || "Kategori Tidak Diketahui";

    if (!acc[kategoriName]) {
      acc[kategoriName] = [];
    }

    acc[kategoriName].push(template);
    return acc;
  }, {});

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Menu />
      <div className="flex-1 p-4">
        <Header />
        <div className="bg-white shadow-sm rounded-lg p-5 mt-2 h-[calc(100vh-100px)] overflow-hidden">
          <div className="flex justify-end items-center mb-6">
            <button
              onClick={() => navigate("/template-form")}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors flex items-center gap-2 shadow-sm"
            >
              <FaPlus /> Tambah Template
            </button>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          ) : (
            <div className="h-[calc(100%-80px)] overflow-y-auto">
              <div className="space-y-6">
                {Object.keys(groupedTemplates).length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <svg
                        className="mx-auto h-12 w-12"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Tidak ada template surat
                    </h3>
                    <p className="text-gray-500">
                      Mulai dengan menambahkan template surat pertama Anda.
                    </p>
                  </div>
                ) : (
                  Object.entries(groupedTemplates).map(
                    ([kategoriName, templatesInKategori]) => (
                      <div key={kategoriName}>
                        <h2 className="text-lg font-semibold text-gray-800 mb-3 border-b border-gray-200 pb-2">
                          {kategoriName}
                        </h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                          {templatesInKategori.map((template) => (
                            <div
                              key={template.id}
                              className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                            >
                              <div className="p-3">
                                {/* Template title */}
                                <h3 className="font-semibold text-gray-900 text-xs mb-2 line-clamp-2 leading-tight">
                                  {template.perihal}
                                </h3>

                                {/* Description */}
                                <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">
                                  {template.deskripsi}
                                </p>

                                {/* Action buttons */}
                                <div className="flex justify-end gap-1 pt-2 border-t border-gray-100">
                                  <button
                                    onClick={() => handleEdit(template)}
                                    className="p-1.5 text-yellow-600 hover:text-yellow-800 hover:bg-yellow-50 rounded transition-colors"
                                    title="Edit Template"
                                  >
                                    <FaEdit size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(template)}
                                    className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                                    title="Hapus Template"
                                  >
                                    <FaTrash size={12} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ),
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TemplateSurat;
