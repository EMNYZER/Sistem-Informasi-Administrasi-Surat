import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import logo from "../assets/logo.png";

function ViewLaporan() {
  const { id_laporan } = useParams();
  const [laporan, setLaporan] = useState(null);
  const [dataSurat, setDataSurat] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLaporanData();
  }, [id_laporan]);

  const fetchLaporanData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      
      // Fetch detail laporan
      const laporanResponse = await axios.get(`http://localhost:3001/laporan/${id_laporan}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setLaporan(laporanResponse.data.data);

      // Fetch data surat berdasarkan jenis laporan dan tanggal
      const { mulai_tanggal, sampai_tanggal, jenis_laporan } = laporanResponse.data.data;
      
      let endpoint = '';
      switch (jenis_laporan) {
        case 'Surat Masuk':
          endpoint = 'suratMasuk';
          break;
        case 'Surat Keluar':
          endpoint = 'suratKeluar';
          break;
        case 'Disposisi':
          endpoint = 'disposisi';
          break;
        default:
          endpoint = 'suratMasuk';
      }

      const suratResponse = await axios.get(`http://localhost:3001/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

             // Filter data berdasarkan tanggal dan status
       const filteredData = suratResponse.data.filter(item => {
         const itemDate = new Date(item.tanggal_surat || item.tanggal_disposisi || item.createdAt);
         const startDate = new Date(mulai_tanggal);
         const endDate = new Date(sampai_tanggal);
         const isInDateRange = itemDate >= startDate && itemDate <= endDate;
         
         // Filter berdasarkan status sesuai jenis laporan
         if (jenis_laporan === 'Surat Masuk') {
           return isInDateRange && (item.status_disposisi === 'Disposisi' || item.status_disposisi === 'Selesai');
         } else if (jenis_laporan === 'Surat Keluar') {
           return isInDateRange && item.status === 'disetujui';
         } else if (jenis_laporan === 'Disposisi') {
           return isInDateRange; // Tampilkan semua data disposisi
         }
         
         return isInDateRange;
       });

      setDataSurat(filteredData);
      console.log(filteredData)
    } catch (error) {
      console.error('Error fetching laporan data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getTableHeaders = () => {
    switch (laporan?.jenis_laporan) {
      case 'Surat Masuk':
        return ['No', 'Tanggal Surat', 'Nomor Surat', 'Perihal', 'Pengirim'];
      case 'Surat Keluar':
        return ['No', 'Tanggal Surat', 'Nomor Surat', 'Perihal', 'Tujuan'];
      case 'Disposisi':
        return ['No', 'Tanggal Disposisi', 'Nomor Surat', 'Perihal', 'Disposisi Kepada'];
      default:
        return ['No', 'Tanggal', 'Nomor', 'Perihal'];
    }
  };

  const getTableData = (item, index) => {
    switch (laporan?.jenis_laporan) {
      case 'Surat Masuk':
        return [
          index + 1,
          formatDate(item.tanggal_surat),
          item.nomor_surat,
          item.perihal,
          item.asal
        ];
      case 'Surat Keluar':
        return [
          index + 1,
          formatDate(item.tanggal_surat),
          item.nomor_surat,
          item.perihal,
          item.tujuan
        ];
      case 'Disposisi':
        return [
          index + 1,
          formatDate(item.tanggal_disposisi),
          item.nomor_surat,
          item.perihal,
          item.disposisi_kepada
        ];
      default:
        return [index + 1, '-', '-', '-', '-'];
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-gray-600">Memuat laporan...</p>
        </div>
      </div>
    );
  }

  if (!laporan) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Laporan tidak ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* A4 Paper Container */}
      <div className="max-w-[210mm] mx-auto bg-white shadow-lg p-8" style={{ minHeight: '297mm' }}>
        {/* KOP */}
        <div className="text-center border-b-2 border-black pb-2 mb-4 ">
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

        {/* Header Laporan */}
        <div className="">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-black mb-4 text-center">
              {laporan.Judul}
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p><strong>Periode:</strong> {formatDate(laporan.mulai_tanggal)} - {formatDate(laporan.sampai_tanggal)}</p>
                <p><strong>Jenis Laporan:</strong> {laporan.jenis_laporan}</p>
              </div>
              <div>
                <p><strong>Tanggal Dibuat:</strong> {formatDate(laporan.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Tabel Data */}
          <div className="mb-6">
            {dataSurat.length === 0 ? (
              <div className="text-center py-8 border border-gray-300 rounded">
                <p className="text-gray-600">Tidak ada data {laporan.jenis_laporan} untuk periode ini</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-300 text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      {getTableHeaders().map((header, index) => (
                        <th key={index} className="border border-gray-300 px-3 py-2 text-left font-semibold">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {dataSurat.map((item, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        {getTableData(item, index).map((cell, cellIndex) => (
                          <td key={cellIndex} className="border border-gray-300 px-3 py-2">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-8 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p><strong>Total Data:</strong> {dataSurat.length} {laporan.jenis_laporan}</p>
              </div>
              <div className="text-right">
                <p>Mataram, {formatDate(new Date())}</p>
                <p className="mt-8">Yang bertanda tangan,</p>
                <p className="mt-12">Administrator</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Button */}
      <div className="max-w-[210mm] mx-auto mt-4 text-center">
        <button
          onClick={() => window.print()}
          className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 transition-colors"
        >
          Cetak Laporan
        </button>
      </div>
    </div>
  );
}

export default ViewLaporan;
