import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.png";
import { FiHash, FiCalendar } from "react-icons/fi";

function Validation() {
  const { id_surat } = useParams();
  const [surat, setSurat] = useState(null);
  const [kepalaSekolah, setKepalaSekolah] = useState(null);
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;
    const fetchData = async () => {
      try {
        // Ambil data surat keluar
        const suratRes = await axios.get(
          `${BACKEND_API_URL}/suratKeluar/valid/${id_surat}`,
        );
        setSurat(suratRes.data);
        // Ambil data kepala sekolah
        const kepalaRes = await axios.get(
          `${BACKEND_API_URL}/user/kepala-sekolah`,
        );
        setKepalaSekolah(kepalaRes.data.kepalaSekolah);
      } catch (error) {
        setSurat(null);
        setKepalaSekolah(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id_surat]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { day: "numeric", month: "long", year: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!surat || !kepalaSekolah)
    return (
      <div className="p-8 text-center text-red-500">Data tidak ditemukan</div>
    );

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center py-8 px-2 bg-gray-100">
      <div className="bg-white shadow-lg rounded-2xl px-4 py-8 sm:px-8 w-full max-w-sm md:max-w-lg text-center flex flex-col items-center">
        {/* Logo di dalam container */}
        <img
          src={logo}
          alt="Logo Sekolah"
          className="h-24 md:h-32 lg:h-40 mb-4 mx-auto object-contain"
        />
        {/* Teks Disetujui oleh */}
        <p className="text-gray-500 text-sm mb-2 tracking-wide">
          Disetujui oleh:
        </p>
        {/* Nama Kepala Sekolah */}
        <h2 className="text-lg md:text-xl font-bold mb-1 text-gray-800 tracking-wide">
          {kepalaSekolah.nama}
        </h2>
        {/* Tanda Tangan */}
        {kepalaSekolah.tanda_tangan && (
          <img
            src={kepalaSekolah.tanda_tangan}
            alt="Tanda Tangan"
            className="h-14 md:h-16 mx-auto my-3 object-contain"
          />
        )}
        {/* Nomor Surat & Tanggal Surat sejajar */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mt-4 w-full">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg py-2 px-3 w-full sm:w-auto justify-center">
            <FiHash className="text-blue-500 text-lg" />
            <span className="text-base font-medium text-gray-700 break-all">
              {surat.nomor_surat || "-"}
            </span>
          </div>
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg py-2 px-3 w-full sm:w-auto justify-center">
            <FiCalendar className="text-green-500 text-lg" />
            <span className="text-base font-medium text-gray-700">
              {formatDate(surat.tanggal_surat)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Validation;
