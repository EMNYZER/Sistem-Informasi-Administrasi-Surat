import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../components/Menu";
import axios from "axios";
import { FaEdit, FaTrash, FaEye, FaPlus } from "react-icons/fa";

function SuratKeluar() {
  const navigate = useNavigate();
  const [suratKeluar, setSuratKeluar] = useState([]);
  const [loading, setLoading] = useState(true);

  const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;

  const fetchSuratKeluar = useCallback(async () => {
    const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;
    try {
      const nik = localStorage.getItem("nik");
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      const response = await axios.get(
        `${BACKEND_API_URL}/suratKeluar/nik/${nik}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setSuratKeluar(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching surat keluar:", error);
      setLoading(false);
    }
  },[navigate]);

  useEffect(() => {
    fetchSuratKeluar();
  }, [fetchSuratKeluar]);

  const handleDelete = async (id_surat) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus surat keluar ini?")) {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        await axios.delete(`${BACKEND_API_URL}/suratKeluar/${id_surat}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        fetchSuratKeluar();
      } catch (error) {
        console.error("Error deleting surat keluar:", error);
      }
    }
  };

  const handleEdit = (surat) => {
    navigate(`/buat-surat/${surat.id_surat}`);
  };

  const handlePreview = (surat) => {
    window.open(`/preview-surat/${surat.id_surat}`, "_blank");
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      draft: { color: "bg-gray-100 text-gray-900", text: "Draft" },
      revisi: { color: "bg-yellow-100 text-gray-900", text: "Revisi" },
      disetujui: { color: "bg-green-100 text-gray-900", text: "Disetujui" },
      ditolak: { color: "bg-red-100 text-gray-900", text: "Ditolak" },
      diajukan: { color: "bg-orange-100 text-gray-900", text: "Diajukan" },
      diproses: { color: "bg-blue-100 text-gray-900", text: "Diproses" },
    };

    const config = statusConfig[status] || statusConfig["draft"];
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const renderActionButtons = (surat) => {
    const { status, id_surat } = surat;

    // Status draft atau revisi: tampilkan tombol edit dan hapus
    if (status === "draft" || status === "revisi") {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(surat)}
            className="text-yellow-600 hover:text-yellow-800"
            title="Edit"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => handlePreview(surat)}
            className="text-blue-600 hover:text-blue-800"
            title="Preview"
          >
            <FaEye />
          </button>
          <button
            onClick={() => handleDelete(id_surat)}
            className="text-red-600 hover:text-red-800"
            title="Delete"
          >
            <FaTrash />
          </button>
        </div>
      );
    }

    // Status diajukan, diproses, atau disetujui: tampilkan hanya tombol preview
    if (status === "diajukan" || status === "diproses") {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => handlePreview(surat)}
            className="text-blue-600 hover:text-blue-800"
            title="Preview"
          >
            <FaEye />
          </button>
        </div>
      );
    }

    if (status === "disetujui") {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => handlePreview(surat)}
            className="text-blue-600 hover:text-blue-800"
            title="Preview"
          >
            <FaEye />
          </button>
          <button
            onClick={() => handleDelete(id_surat)}
            className="text-red-600 hover:text-red-800"
            title="Delete"
          >
            <FaTrash />
          </button>
        </div>
      );
    }

    // Status ditolak: tampilkan hanya tombol hapus
    if (status === "ditolak") {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => handleEdit(surat)}
            className="text-yellow-600 hover:text-yellow-800"
            title="Detail"
          >
            <FaEdit />
          </button>
          <button
            onClick={() => handleDelete(id_surat)}
            className="text-red-600 hover:text-red-800"
            title="Delete"
          >
            <FaTrash />
          </button>
        </div>
      );
    }

    // Default: tidak tampilkan tombol apapun
    return null;
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Menu />
      <div className="flex flex-col flex-1 p-4 lg:ml-48 transition-all duration-200">
        <div className="bg-white shadow-sm rounded-lg p-5 mt-2">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-semibold text-gray-800">
              Data Surat Keluar
            </h1>
            <button
              onClick={() => navigate("/daftar-template")}
              className="bg-green-600 text-white px-3 py-1.5 rounded text-sm hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <FaPlus /> Tambah Surat
            </button>
          </div>

          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal Surat
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nomor Surat
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Perihal
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {suratKeluar.map((item) => (
                    <tr key={item.id_surat}>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {formatDate(item.tanggal_surat)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {item.nomor_surat ? (
                          item.nomor_surat
                        ) : (
                          <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-red-200 text-gray-500">
                            Nomor Surat Tidak Ada
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {item.kategori?.nama_kategori || "-"}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {item.perihal}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {renderActionButtons(item)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && suratKeluar.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Tidak ada data surat keluar
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default SuratKeluar;
