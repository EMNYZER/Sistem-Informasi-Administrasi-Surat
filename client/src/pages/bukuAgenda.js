import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Menu from "../components/Menu";
import axios from "axios";

function BukuAgenda() {
  const navigate = useNavigate();

  const [jenis, setJenis] = useState("masuk");
  const [bulanAktif, setBulanAktif] = useState("");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;

  const getMonthKey = (date) => date.getFullYear() + "-" + String(date.getMonth() + 1).padStart(2, "0");

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      let endpoint = "";
      if (jenis === "masuk") endpoint = "/suratMasuk";
      if (jenis === "keluar") endpoint = "/suratKeluar";
      if (jenis === "disposisi") endpoint = "/disposisi";

      const response = await axios.get(`${BACKEND_API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const result = response.data.sort(
        (a, b) => new Date(b.createdAt || b.tanggal_terima || b.tanggal_surat) - new Date(a.createdAt || a.tanggal_terima || a.tanggal_surat)
      );

      setData(result);

      if (result.length > 0 && !bulanAktif) {
        const firstDate = new Date(result[0].createdAt || result[0].tanggal_terima || result[0].tanggal_surat);
        setBulanAktif(getMonthKey(firstDate));
      }

      setLoading(false);
    } catch (error) {
      console.error("Error fetching buku agenda:", error);
      setLoading(false);
    }
  }, [jenis, navigate, BACKEND_API_URL, bulanAktif]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const months = [...new Set(
    data.map((item) => {
      const d = new Date(item.createdAt || item.tanggal_terima || item.tanggal_surat);
      return getMonthKey(d);
    })
  )];

  const filteredData = data.filter((item) => {
    const d = new Date(item.createdAt || item.tanggal_terima || item.tanggal_surat);
    return getMonthKey(d) === bulanAktif;
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Menu />

      <div className="flex flex-col flex-1 p-4 lg:ml-48">
        <div className="bg-white shadow-sm rounded-lg p-5 mt-2">
          <h1 className="text-xl font-semibold text-gray-800 mb-4">Buku Agenda</h1>

          {/* FILTER JENIS */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setJenis("masuk")}
              className={`px-4 py-1.5 rounded text-sm ${jenis === "masuk" ? "bg-blue-600 text-white" : "bg-gray-100"}`}
            >
              Surat Masuk
            </button>
            <button
              onClick={() => setJenis("keluar")}
              className={`px-4 py-1.5 rounded text-sm ${jenis === "keluar" ? "bg-green-600 text-white" : "bg-gray-100"}`}
            >
              Surat Keluar
            </button>
            <button
              onClick={() => setJenis("disposisi")}
              className={`px-4 py-1.5 rounded text-sm ${jenis === "disposisi" ? "bg-purple-600 text-white" : "bg-gray-100"}`}
            >
              Disposisi
            </button>
          </div>

          {/* FILTER BULAN */}
          <div className="flex gap-2 flex-wrap mb-4">
            {months.map((m) => (
              <button
                key={m}
                onClick={() => setBulanAktif(m)}
                className={`px-3 py-1 rounded-full text-sm border ${bulanAktif === m ? "bg-black text-white" : "bg-white"}`}
              >
                {m}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : (
            <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nomor</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Perihal</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((item) => (
                    <tr key={item.id_surat || item.id}>
                      <td className="px-4 py-2 text-sm">
                        {formatDate(item.createdAt || item.tanggal_terima || item.tanggal_surat)}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        {item.nomor_surat || item.nomor_agenda || "-"}
                      </td>
                      <td className="px-4 py-2 text-sm">{item.perihal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && filteredData.length === 0 && (
            <div className="text-center py-6 text-gray-500">
              Tidak ada data pada bulan ini
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BukuAgenda;