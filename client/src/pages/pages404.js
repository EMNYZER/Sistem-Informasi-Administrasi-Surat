import React from 'react';
import { useNavigate } from 'react-router-dom';

function Pages404() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 flex flex-col items-center max-w-md w-full">
        <div className="text-6xl mb-2">🚫</div>
        <h1 className="text-3xl font-bold text-blue-700 mb-2">404</h1>
        <p className="text-lg text-gray-700 mb-4">Halaman tidak ditemukan</p>
        <p className="text-sm text-gray-500 mb-6 text-center">Maaf, halaman yang Anda cari tidak tersedia atau sudah dipindahkan.</p>
        <button
          onClick={() => navigate('/dashboard')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Kembali ke Dashboard
        </button>
      </div>
    </div>
  );
}

export default Pages404;