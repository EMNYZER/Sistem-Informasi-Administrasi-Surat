import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Menu from "../components/Menu";
import axios from "axios";
import { FaAngleDoubleRight, FaCheck, FaFile } from "react-icons/fa";


function DaftarDisposisi() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLevel, setUserLevel] = useState("");
  const navigate = useNavigate();

  const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;

  useEffect(() => {
    const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;
    const fetchData = async () => {
      try {
        const nik = localStorage.getItem("nik");
        // Fetch user profile to get jabatan.level_disposisi
        const userRes = await axios.get(`${BACKEND_API_URL}/user/${nik}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUserLevel(userRes.data.profileData.jabatan?.level_disposisi || "");
        // Fetch disposisi data
        const res = await axios.get(`${BACKEND_API_URL}/disposisi/nik/${nik}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        // Filter disposisi yang statusnya bukan 'Selesai'
        setData(res.data.filter(item => item.disposisi.status_disposisi !== "Selesai"));
      } catch (err) {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePreview = (id) => {
    window.open(`/view-disposisi/${id}`, '_blank');
  };

  const handleTandaiSelesai = async (id_disposisi) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${BACKEND_API_URL}/disposisi/${id_disposisi}`, {
        status_disposisi: "Selesai",
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Refresh data
      setData(data.filter(item => item.id_disposisi !== id_disposisi));
      alert("Disposisi ditandai selesai.");
    } catch (error) {
      alert("Gagal menandai selesai");
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Menu />
      <div className="flex flex-col flex-1 p-4 lg:ml-48 transition-all duration-200">
        <Header />
        <div className="bg-white shadow-sm rounded-lg p-5 mt-2">
          <h1 className="text-xl font-semibold text-gray-800 mb-4">Daftar Disposisi Saya</h1>
          {loading ? (
            <div className="text-center py-10 text-gray-400">Loading...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Tanggal Disposisi</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Nomor Surat</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 uppercase">Perihal</th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-gray-600 uppercase">Aksi</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {data.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-gray-400">Tidak ada data disposisi</td>
                    </tr>
                  ) : (
                    data.map((item) => (
                      <tr key={item.id_disposisi}>
                        <td className="px-4 py-2 whitespace-nowrap">{new Date(item.disposisi.tanggal_disposisi).toLocaleDateString()}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{item.disposisi.suratMasuk?.nomor_surat || '-'}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{item.disposisi.suratMasuk?.perihal || '-'}</td>
                        <td className="px-4 py-2 text-center">
                          <button
                            onClick={() => handlePreview(item.id_disposisi)}
                            className="inline-flex items-center px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-medium rounded shadow mr-2"
                            title="Preview"
                          >
                            <FaFile/>
                          </button>
                          {userLevel === "tingkat 2" && (
                            <>
                              <button
                                onClick={() => navigate(`/teruskan-disposisi/${item.id_disposisi}`)}
                                className="inline-flex items-center px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-medium rounded shadow mr-2"
                                title="Teruskan"
                              >
                                <FaAngleDoubleRight/>
                              </button>
                              <button
                                onClick={() => handleTandaiSelesai(item.id_disposisi)}
                                className="inline-flex items-center px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded shadow"
                                title="Tandai Selesai"
                              >
                                <FaCheck/>
                              </button>
                            </>
                          )}
                          {/* {userLevel === "tingkat 3" && (
                          )} */}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DaftarDisposisi;