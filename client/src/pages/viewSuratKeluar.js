import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
// import logo from "../assets/logo.png";
import kopSurat from "../assets/KOP_surat.jpg";

function ViewSuratKeluar() {
  const { id_surat } = useParams();
  const navigate = useNavigate();
  const [surat, setSurat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [kepalaSekolah, setKepalaSekolah] = useState(null);

  
  useEffect(() => {
    const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;
    const fetchSurat = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const response = await axios.get(
          `${BACKEND_API_URL}/suratKeluar/${id_surat}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        console.log(response.data.QR_code);
        console.log(response.data.status);
        setSurat(response.data);
      } catch (error) {
        console.error("Error fetching surat:", error);
        alert("Gagal mengambil data surat");
      } finally {
        setLoading(false);
      }
    };
    fetchSurat();
  }, [id_surat, navigate]);

  useEffect(() => {
    const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;
    const fetchKepalaSekolah = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;
        const response = await axios.get(
          `${BACKEND_API_URL}/user/kepala-sekolah`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setKepalaSekolah(response.data.kepalaSekolah);
      } catch (error) {
        setKepalaSekolah(null);
        console.log(error.message);
      }
    };
    fetchKepalaSekolah();
  }, []);

  // Otomatis print saat halaman dibuka dan data sudah dimuat
  useEffect(() => {
    if (!loading && surat) {
      setTimeout(() => {
        window.print();
      }, 1500);
    }
  }, [loading, surat]);

  const formatDate = (dateString) => {
    const options = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!surat)
    return (
      <div className="p-8 text-center text-red-500">
        Data surat tidak ditemukan
      </div>
    );

  return (
    <div className="bg-gray-200 min-h-screen py-8">
      {/* Dokumen Surat */}
      <div
        className="bg-white mx-auto shadow-lg p-8 print-area"
        style={{ width: "210mm", minHeight: "297mm" }}
      >
        {/* KOP Surat */}
        <div className="text-center border-b-2 border-black pb-2 mb-6">
         {/* <div className="flex justify-center items-center gap-4 ">
            <img src={logo} alt="Logo" className="h-24 w-auto" />
            <div>
              <h1 className="text-xl font-bold">SEKOLAH DASAR ISLAM TERPADU</h1>
              <h1 className="text-xl font-bold">ANAK SHOLEH MATARAM</h1>
              <p className="text-sm">
                Jl. Merdeka Raya Gang Merdeka XVII Pagesangan, Mataram, NTB
              </p>
              <p className="text-sm">
                Telp: 0370-7845207 | HP: 0877-4330-2002 | Email:
                anaksholehs989@gmail.com
              </p>
            </div>
          </div> */}
          <img src={kopSurat} alt="KOP Surat" className="w-full max-h-40 object-contain mx-auto" />
        </div>

        {/* Nomor Surat & Tanggal */}
        <div className="mb-6">
          <table className="w-full text-sm">
            <tbody>
              <tr>
                <td className="w-24">Nomor</td>
                <td className="w-2">:</td>
                <td>{surat.nomor_surat || "-"}</td>
                <td className="text-right">
                  {formatDate(surat.tanggal_surat)}
                </td>
              </tr>
              <tr>
                <td>Lampiran</td>
                <td>:</td>
                <td>{surat.lampiran || "-"}</td>
              </tr>
              <tr>
                <td>Perihal</td>
                <td>:</td>
                <td>{surat.perihal}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tujuan Surat */}
        <div className="mb-6">
          {surat.kepada ? (
            <>
              <p className="mb-1">Yth.</p>
              <p className="mb-1">{surat.kepada}</p>
              <p>di Tempat</p>
            </>
          ) : (
            <div style={{ minHeight: "48px" }}></div>
          )}
        </div>

        {/* Isi Surat */}
        <div
          className="whitespace-pre-wrap mb-8 text-justify px-6"
          dangerouslySetInnerHTML={{ __html: surat.isi_surat }}
        ></div>
        {/* <div className="mb-8 text-justify px-6">
          <pre 
            style={{
              fontFamily: 'Arial, sans-serif',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word'
            }}
          dangerouslySetInnerHTML={{ __html: surat.isi_surat }}></pre>
        </div> */}

        {/* Tanda Tangan */}
        <div className="flex justify-end mt-16">
          <div className="w-96 text-center">
            <p>Kepala Sekolah</p>
            <div className="flex justify-end items-center ">
              <div className="w-48">
                {surat.status === "disetujui" && kepalaSekolah?.tanda_tangan ? (
                  <img
                    src={kepalaSekolah.tanda_tangan}
                    alt="Tanda Tangan"
                    className="h-20 mx-auto "
                  />
                ) : (
                  <div className="h-20"></div>
                )}
              </div>
              <div className="w-24 h-24">
                {surat.status === "disetujui" && surat.QR_code && (
                  <img
                    src={surat.QR_code}
                    alt="QR Code"
                    className="w-full h-auto"
                  />
                )}
              </div>
              <div></div>
            </div>
            <div className="mt-2">
              <p className="font-bold underline">
                {kepalaSekolah ? kepalaSekolah.nama : "Nama Kepala Sekolah"}
              </p>
              <p>
                {kepalaSekolah
                  ? kepalaSekolah.No_induk_yayasan
                    ? `GTY: ${kepalaSekolah.No_induk_yayasan}`
                    : `NIK. ${kepalaSekolah.NIK}`
                  : "NIK. 123456789"}
              </p>
            </div>
          </div>
        </div>

        {/* Catatan (hanya tampil jika ada) */}
        {/* {surat.catatan && (
          <div className="mt-8 pt-4 border-t text-sm text-gray-600">
            <p className="font-semibold">Catatan Admin:</p>
            <p>{surat.catatan}</p>
          </div>
        )} */}
      </div>
    </div>
  );
}

export default ViewSuratKeluar;
