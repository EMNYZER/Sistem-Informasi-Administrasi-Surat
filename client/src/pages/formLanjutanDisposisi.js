import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Menu from "../components/Menu";
import axios from "axios";

function FormLanjutanDisposisi() {
  const navigate = useNavigate();
  const { id_disposisi } = useParams();
  const [loading, setLoading] = useState(true);
  const [disposisi, setDisposisi] = useState(null);
  const [pegawaiList, setPegawaiList] = useState([]);
  const [formData, setFormData] = useState({
    instruksi_lanjutan: "",
    pegawai_penerima: "",
  });

  useEffect(() => {
    fetchDisposisi();
    fetchPegawaiTingkat3();
  }, []);

  const fetchDisposisi = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`http://localhost:3001/disposisi/${id_disposisi}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDisposisi(res.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      alert("Gagal mengambil data disposisi");
    }
  };

  const fetchPegawaiTingkat3 = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:3001/user", {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Filter pegawai yang jabatan.level_disposisi === 'tingkat 3'
      const filtered = res.data.filter(p => p.jabatan && p.jabatan.level_disposisi === "tingkat 3");
      setPegawaiList(filtered);
    } catch (error) {
      alert("Gagal mengambil data pegawai");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.pegawai_penerima) {
      alert("Pilih pegawai penerima terlebih dahulu");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      await axios.put(`http://localhost:3001/disposisi/${id_disposisi}`, {
          id: id_disposisi,
        instruksi_lanjutan: formData.instruksi_lanjutan,
        pegawai_penerima: [formData.pegawai_penerima],
        status_disposisi: 'Diteruskan',
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Instruksi lanjutan berhasil dikirim!");
      navigate("/daftar-disposisi");
    } catch (error) {
      alert("Gagal menyimpan instruksi lanjutan");
      console.log(error.message)
    }
  };

  if (loading || !disposisi) return <div className="p-8 text-center">Loading...</div>;

  const surat = disposisi.suratMasuk || {};

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Menu />
      <div className="flex flex-col flex-1 p-4 lg:ml-48 transition-all duration-200">
        <Header />
        <div className="bg-white shadow-sm rounded-lg p-5 mt-2 w-full overflow-x-auto">
          <h1 className="text-xl font-semibold text-gray-800 mb-6 text-center">Form Lanjutan Disposisi</h1>
          {/* Section 1 & 2 sejajar: Data Surat Masuk */}
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
                    <td className="font-medium text-gray-900">: {surat.tanggal_surat ? new Date(surat.tanggal_surat).toLocaleDateString("id-ID") : '-'}</td>
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
                    <td className="font-medium text-gray-900">: {surat.tanggal_terima ? new Date(surat.tanggal_terima).toLocaleDateString("id-ID") : '-'}</td>
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
          {/* Section 4: Info Disposisi Sebelumnya */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-gray-500 mb-1">Tanggal Disposisi</div>
              <div className="text-base font-semibold text-gray-900">{new Date(disposisi.tanggal_disposisi).toLocaleDateString("id-ID")}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Jabatan Penerima</div>
              <div className="text-base font-semibold text-gray-900">{disposisi.jabatan_penerima}</div>
            </div>
            <div>
              <div className="text-xs text-gray-500 mb-1">Instruksi</div>
              <div className="text-base font-semibold text-gray-900">{disposisi.instruksi}</div>
            </div>
          </div>
          {/* Section 5: Form Lanjutan */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">Instruksi Lanjutan</label>
              <textarea name="instruksi_lanjutan" value={formData.instruksi_lanjutan} onChange={handleChange} required placeholder="Tulis instruksi lanjutan di sini" className="mt-1 block w-full rounded-md border border-gray-400 shadow-sm "></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pilih Pegawai Penerima</label>
              <select
                name="pegawai_penerima"
                value={formData.pegawai_penerima}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md border border-gray-400 shadow-sm "
              >
                <option value="">--Pilih Pegawai--</option>
                {pegawaiList.map((p) => (
                  <option key={p.NIK} value={p.NIK}>
                    {p.nama} - {p.jabatan?.nama_jabatan}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => navigate("/daftar-disposisi")} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200">Batal</button>
              <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700">Teruskan</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default FormLanjutanDisposisi;