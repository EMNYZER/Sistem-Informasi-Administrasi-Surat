import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/logo.png";

function ViewDisposisi() {
  const { id_disposisi } = useParams();
  const navigate = useNavigate();
  const [disposisi, setDisposisi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [penerima, setPenerima] = useState(null)

  useEffect(() => {
    const fetchDisposisi = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/login");
          return;
        }
        const response = await axios.get(`http://localhost:3001/disposisi/${id_disposisi}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const resPenerima = await axios.get(`http://localhost:3001/disposisi/pegawai/${id_disposisi}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPenerima(resPenerima.data)
        setDisposisi(response.data);
        
      } catch (error) {
        alert("Gagal mengambil data disposisi");
      } finally {
        setLoading(false);
      }
    };
    fetchDisposisi();
  }, [id_disposisi, navigate]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const options = { day: "numeric", month: "long", year: "numeric" };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!disposisi)
    return (
      <div className="p-8 text-center text-red-500">
        Data disposisi tidak ditemukan
      </div>
    );

  const surat = disposisi.suratMasuk || {};
  const penerimaTingkat2 = penerima
    .filter(p => p.pegawai && p.pegawai.jabatan && p.pegawai.jabatan.level_disposisi === 'tingkat 2')
    .map(p => (
      <div key={p.NIK} className="text-sm font-medium text-gray-900 px-2">
       {p.pegawai.nama}<span className="font-normal"> selaku penanggung jawab</span> {p.pegawai.jabatan?.nama_jabatan}
      </div>
    ));
  const penerimaTingkat3 = penerima
    .filter(p => p.pegawai && p.pegawai.jabatan && p.pegawai.jabatan.level_disposisi === 'tingkat 3')
    .map(p => (
     <div key={p.NIK} className="text-sm font-medium text-gray-900">
       - {p.pegawai.nama}
     </div>
   ));
 

  return (
    <div className="bg-gray-200 min-h-screen py-8">
      <div
        className="bg-white mx-auto shadow-lg p-8 print-area "
        style={{ width: "210mm", minHeight: "297mm" }}
      >
        <div className="border-2 border-black">
          {/* KOP Surat */}
          <div className="text-center border-b-2 border-black pb-2">
            <div className="flex justify-center items-center gap-4 ">
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
            </div>
          </div>
          {/* Judul & Peringatan */}
          <div className="text-center border-b-2 border-black p-3">
            <div className="text-2xl font-bold ">LEMBAR DISPOSISI</div>
          </div>
          <div className="text-center border-b-2 border-black p-2">
            <div className="text-xs font-semibold">PERHATIAN: Dilarang memisahkan sehelai surat yang digabung dalam berkas ini</div>
          </div>
          {/* Tabel Info Surat */}
          <table className="w-full text-sm border border-black mb-2" style={{ borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td className="border border-black px-2 py-1" colSpan={2}><span className="inline-block w-36">Nomor Surat</span> : {surat.nomor_surat || "-"}</td>
                <td className="border border-black px-2 py-1" colSpan={2}><span className="inline-block w-36">Status</span> : {surat.status_surat || "-"}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1" colSpan={2}><span className="inline-block w-36">Tanggal Surat</span> : {formatDate(surat.tanggal_surat)}</td>
                <td className="border border-black px-2 py-1" colSpan={2}><span className="inline-block w-36">Sifat</span> : {surat.sifat || "-"}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1" colSpan={2}><span className="inline-block w-36">Lampiran</span> : {surat.lampiran || "-"}</td>
                <td className="border border-black px-2 py-1" colSpan={2}><span className="inline-block w-36">No. Agenda</span> : {surat.nomor_agenda || "-"}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1" colSpan={4}><span className="inline-block w-36">Diterima tanggal</span> : {formatDate(surat.tanggal_terima)}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1" colSpan={4}><span className="inline-block w-36">Dari Instansi</span> : {surat.asal || "-"}</td>
              </tr>
            </tbody>
          </table>
          {/* Perihal */}
          <div className="text-center p-1">
               <div className="text-center font-bold text-base text-sm ">Perihal: </div>
               <div className="text-center font-semibold text-base text-lg">{surat.perihal || "-"}</div>
          </div>
          {/* Tabel Disposisi */}
          <table className="w-full text-sm border border-black mb-2" style={{ borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td className="border border-black px-2 py-1" colSpan={2}><span className="inline-block">Disposisi Pada Tanggal</span> : {formatDate(disposisi.tanggal_disposisi)}</td>
              </tr>
              <tr>
                <td className="border border-black py-1 text-center font-semibold" colSpan={1}><span className="inline-block">Disposisi Kepada</span></td>
                <td className="border border-black py-1 text-center font-semibold" colSpan={1}><span className="inline-block">Instruksi Kepala</span></td>
              </tr>
              <tr>
                <td className="border border-black py-4 text-center" rowSpan={3} ><span className=""></span>{disposisi.jabatan_penerima || "-"}</td>
                <td className="border border-black px-2 py-4" colSpan={1}><span className="inline-block"></span>{disposisi.instruksi || "-"}</td>
              </tr>
              <tr>
                <td className="border border-black py-1 text-center font-semibold" colSpan={1}><span className="inline-block">Instruksi Lanjut</span></td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-4" colSpan={1}><span className="inline-block"></span>{disposisi.instruksi_lanjutan || "-"}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1" colSpan={2}><span className="inline-block">Disposisi Kepada</span> : {penerimaTingkat2.length > 0 ? penerimaTingkat2 : "-"}</td>
              </tr>
              <tr>
                <td className="border border-black px-2 py-1" colSpan={2}><span className="inline-block">Diteruskan Kepada</span> : {penerimaTingkat3.length > 0 ? penerimaTingkat3 : "-"}</td>
              </tr>
            </tbody>
          </table>
          {/* Catatan */}
          <div className="mt-2 text-xs">
            <div className="font-semibold px-2">Catatan Kepala :</div>
            <div className="mb-1 px-4">{disposisi.catatan || '-'}</div>
            <div className="font-semibold px-2">Catatan Admin :</div>
            <div className="mb-1 px-4">{surat.catatan || '-'}</div>
          </div>
          {/* Tanda Tangan */}
          {/* <div className="flex justify-end mt-12">
            <div className="w-80 text-center">
              <p className="mb-12">Penerima Disposisi</p>
              <div className="mt-2">
                <p className="font-bold underline">(.............................................)</p>
                <p>NIK. ....................................</p>
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default ViewDisposisi;