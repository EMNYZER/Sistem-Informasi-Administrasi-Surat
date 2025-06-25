import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Menu from "../components/Menu";
import axios from "axios";

function TandaTangan() {
  const [kepalaSekolah, setKepalaSekolah] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchKepalaSekolah = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3001/user/kepala-sekolah', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setKepalaSekolah(res.data.kepalaSekolah);
        setPreview(res.data.kepalaSekolah?.tanda_tangan || null);
      } catch (err) {
        setKepalaSekolah(null);
        setPreview(null);
      }
    };
    fetchKepalaSekolah();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('tanda_tangan', selectedFile);
      await axios.post('http://localhost:3001/user/upload-tanda-tangan', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setSuccess("Tanda tangan berhasil diupload.");
      setSelectedFile(null);
      // Refresh preview
      const res = await axios.get('http://localhost:3001/user/kepala-sekolah', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setKepalaSekolah(res.data.kepalaSekolah);
      setPreview(res.data.kepalaSekolah?.tanda_tangan || null);
    } catch (err) {
      setError("Gagal upload tanda tangan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Menu />
      <div className="flex-1 p-4">
        <Header />
        <div className="bg-white shadow-sm rounded-lg p-5 mt-2 max-w-lg mx-auto">
          <h2 className="text-xl font-bold mb-4 text-center">Upload Tanda Tangan Kepala Sekolah</h2>
          <form onSubmit={handleUpload} className="flex flex-col sm:flex-row items-center gap-6 w-full">
            {/* Preview di kiri */}
            <div className="w-full sm:w-1/2 flex flex-col items-center">
              <span className="text-gray-600 text-sm mb-1">Preview Tanda Tangan:</span>
              <div className="border rounded-lg bg-gray-100 flex items-center justify-center w-48 h-28 mb-2">
                {preview ? (
                  <img src={preview} alt="Tanda Tangan" className="max-h-24 object-contain" />
                ) : (
                  <span className="text-gray-400">Belum ada tanda tangan</span>
                )}
              </div>
            </div>
            {/* Form upload di kanan */}
            <div className="w-full sm:w-1/2 flex flex-col items-center gap-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-700 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <button
                type="submit"
                disabled={loading || !selectedFile}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg shadow disabled:opacity-50 disabled:cursor-not-allowed transition w-full"
              >
                {loading ? 'Menyimpan...' : 'Simpan Tanda Tangan'}
              </button>
              {/* Pesan sukses/gagal */}
              {success && <div className="text-green-600 text-sm mt-1">{success}</div>}
              {error && <div className="text-red-600 text-sm mt-1">{error}</div>}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default TandaTangan;