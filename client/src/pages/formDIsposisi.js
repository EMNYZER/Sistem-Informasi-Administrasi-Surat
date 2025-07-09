import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Menu from "../components/Menu";
import axios from "axios";

function FormDisposisi() {
  const navigate = useNavigate();
  const { id_surat } = useParams();
  const [loading, setLoading] = useState(true);
  const [surat, setSurat] = useState(null);
  const [pegawaiList, setPegawaiList] = useState([]);
  const [formData, setFormData] = useState({
    tanggal_disposisi: new Date().toISOString().split("T")[0],
    instruksi: "",
    jabatan_penerima: "",
    catatan: "",
  });

  const fetchSurat = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:3001/suratMasuk/${id_surat}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSurat(res.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      alert("Gagal mengambil data surat");
    }
  };

  const fetchPegawaiTingkat2 = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3001/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter pegawai yang jabatan.level_disposisi === 'tingkat 2'
      const filtered = res.data.filter(p => p.jabatan && p.jabatan.level_disposisi === "tingkat 2");
      setPegawaiList(filtered);
    } catch (error) {
      alert("Gagal mengambil data pegawai");
    }
  };

  useEffect(() => {
    fetchSurat();
    fetchPegawaiTingkat2();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const pegawai = pegawaiList.find(p => p.NIK === formData.jabatan_penerima);
    if (!pegawai) {
      alert("Pegawai penerima tidak ditemukan");
      return;
    }
    const nama_jabatan = pegawai.jabatan?.nama_jabatan || "";
    const payload = {
      ...formData,
      id_surat,
      jabatan_penerima: nama_jabatan,
      pegawai_penerima: [pegawai.NIK],
    };
    try {
      const token = localStorage.getItem("token");
      await axios.post("http://localhost:3001/disposisi", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Disposisi berhasil dibuat!");
      navigate("/surat-masuk");
    } catch (error) {
      alert("Gagal menyimpan disposisi");
    }
  };
  

  if (loading || !surat) return <div className="p-8 text-center">Loading...</div>;


  return (
    <div className="flex min-h-screen bg-gray-50">
      <Menu />
      <div className="flex flex-col flex-1 p-4 lg:ml-48 transition-all duration-200">
        <Header />
        <div className="bg-white shadow-sm rounded-lg p-5 mt-2 w-full max-w-4xl mx-auto overflow-x-auto">
          <h1 className="text-xl font-semibold text-gray-800 mb-6 text-center">Form Disposisi Surat Masuk</h1>
          {/* Section 1 & 2 sejajar */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {/* Informasi Surat */}
            <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-md font-semibold text-gray-700 mb-3">Informasi Surat</h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="pr-2 py-1 text-gray-500 whitespace-nowrap">Nomor Surat</td>
                    <td className="font-medium text-gray-900">: {surat.nomor_surat}</td>
                  </tr>
                  <tr>
                    <td className="pr-2 py-1 text-gray-500 whitespace-nowrap">Tanggal Surat</td>
                    <td className="font-medium text-gray-900">: {new Date(surat.tanggal_surat).toLocaleDateString("id-ID")}</td>
                  </tr>
                  <tr>
                    <td className="pr-2 py-1 text-gray-500 whitespace-nowrap">Asal Surat</td>
                    <td className="font-medium text-gray-900">: {surat.asal}</td>
                  </tr>
                  <tr>
                    <td className="pr-2 py-1 text-gray-500 whitespace-nowrap">Lampiran</td>
                    <td className="font-medium text-gray-900">: {surat.lampiran || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            {/* Pendataan Surat */}
            <div className="flex-1 bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-md font-semibold text-gray-700 mb-3">Pendataan Surat</h3>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="pr-2 py-1 text-gray-500 whitespace-nowrap">Nomor Agenda</td>
                    <td className="font-medium text-gray-900">: {surat.nomor_agenda}</td>
                  </tr>
                  <tr>
                    <td className="pr-2 py-1 text-gray-500 whitespace-nowrap">Tanggal Terima</td>
                    <td className="font-medium text-gray-900">: {new Date(surat.tanggal_terima).toLocaleDateString("id-ID")}</td>
                  </tr>
                  <tr>
                    <td className="pr-2 py-1 text-gray-500 whitespace-nowrap">Sifat Surat</td>
                    <td className="font-medium text-gray-900">: {surat.sifat}</td>
                  </tr>
                  <tr>
                    <td className="pr-2 py-1 text-gray-500 whitespace-nowrap">Status Surat</td>
                    <td className="font-medium text-gray-900">: {surat.status_surat}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          {/* Section 3: Perihal */}
          <div className="mb-6 text-center">
            <div className="text-xs text-gray-500 mb-1">Perihal</div>
            <div className="text-base font-semibold text-gray-900">{surat.perihal}</div>
          </div>
          {/* Section 4: Form Input */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Tanggal Disposisi</label>
                <input type="date" name="tanggal_disposisi" value={formData.tanggal_disposisi} onChange={handleChange} required className="mt-1 block w-full rounded-md border border-gray-400 shadow-sm bg-gray-100" readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Divisi</label>
                <select
                  name="jabatan_penerima"
                  value={formData.jabatan_penerima}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-400 shadow-sm "
                >
                  <option value="">--Pilih Divisi--</option>
                  {pegawaiList.map((p) => (
                    <option key={p.NIK} value={p.NIK}>
                      {p.nama} - {p.jabatan?.nama_jabatan}
                    </option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Tindakan</label>
                <textarea name="instruksi" value={formData.instruksi} onChange={handleChange} required placeholder="Tindakan/Instruksi" className="mt-1 block w-full rounded-md border border-gray-400 shadow-sm "></textarea>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Catatan </label>
              <input type="text" name="catatan" value={formData.catatan} onChange={handleChange} placeholder="Catatan (opsional)" className="mt-1 block w-full rounded-md border border-gray-400 shadow-sm " />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => navigate("/surat-masuk")} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200">Batal</button>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700">Kirim Disposisi</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FormDisposisi;