import React, { useEffect, useState, useCallback} from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Menu from "../components/Menu";
import axios from "axios";
import { FaPlus } from "react-icons/fa";

function PilihTemplate() {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchTemplates = useCallback(async () => {
    const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await axios.get(`${BACKEND_API_URL}/template`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTemplates(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching templates:", error);
      setLoading(false);
    }
  },[navigate]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  // Group templates by category name
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
      <div className="flex flex-col flex-1 p-4 lg:ml-48 transition-all duration-200">
        <Header />
        <div className="bg-white shadow-sm rounded-lg p-5 mt-2 h-[calc(100vh-100px)] overflow-hidden">
          <div className="flex justify-end mb-4 gap-2">
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-300 transition-colors shadow-sm flex items-center gap-2"
            >
              Kembali
            </button>
            <button
              onClick={() => navigate("/buat-surat")}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <FaPlus /> Buat Surat Tanpa Template
            </button>
          </div>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              <p className="mt-2 text-gray-600">Loading...</p>
            </div>
          ) : (
            <div className="h-[calc(100%-40px)] overflow-y-auto">
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
                      Belum ada template surat yang tersedia.
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
                            <button
                              key={template.id}
                              onClick={() =>
                                navigate(`/buat-surat/template/${template.id}`)
                              }
                              className="bg-gray-100 border border-gray-700 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden text-left p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                              <h3 className="font-semibold text-gray-900 text-xs mb-2 line-clamp-2 leading-tight">
                                {template.perihal}
                              </h3>
                              <p className="text-xs text-gray-500 mb-3 line-clamp-2 leading-relaxed">
                                {template.deskripsi}
                              </p>
                              {/* <div className="text-[10px] text-green-700 font-medium bg-green-50 rounded px-2 py-0.5 inline-block">
                              {template.kategori?.nama_kategori || 'Kategori Tidak Diketahui'}
                            </div> */}
                            </button>
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

export default PilihTemplate;
