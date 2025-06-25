import React, { useState } from "react";
import axios from "axios";

const SearchData = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState('pegawai'); // 'pegawai' or 'murid'

  const handleSearch = async () => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = searchType === 'pegawai' 
        ? `http://localhost:3001/pegawai/search?q=${searchTerm}`
        : `http://localhost:3001/murid/search?q=${searchTerm}`;
        
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-3 h-fit">
      <h3 className="text-sm font-medium text-gray-700 mb-3">Cari Data {searchType === 'pegawai' ? 'Pegawai' : 'Murid'}</h3>
      
      {/* Search Type Toggle */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setSearchType('pegawai')}
          className={`px-3 py-1 text-xs rounded ${
            searchType === 'pegawai'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Pegawai
        </button>
        <button
          onClick={() => setSearchType('murid')}
          className={`px-3 py-1 text-xs rounded ${
            searchType === 'murid'
              ? 'bg-green-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Murid
        </button>
      </div>

      {/* Search Input */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={`Cari nama/NIK ${searchType === 'pegawai' ? 'pegawai' : 'murid'}...`}
          className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-3 py-1 text-sm text-white bg-green-600 hover:bg-green-700 rounded disabled:opacity-50"
        >
          {loading ? '...' : 'Cari'}
        </button>
      </div>

      {/* Search Results */}
      <div className="max-h-96 overflow-y-auto">
        {searchResults.length > 0 ? (
          <div className="space-y-2">
            {searchResults.map((item) => (
              <div key={item.NIK || item.nis} className="border border-gray-200 rounded p-2 hover:bg-gray-50 cursor-pointer">
                {searchType === 'pegawai' ? (
                  <>
                    <div className="text-sm font-medium text-gray-700">{item.nama || 'Nama Pegawai'}</div>
                    <div className="text-xs text-gray-600">NIK: {item.NIK || '-'}</div>
                    <div className="text-xs text-gray-500">{item.jabatan || '-'}</div>
                    <div className="text-xs text-gray-500">{item.email || '-'}</div>
                  </>
                ) : (
                  <>
                    <div className="text-sm font-medium text-gray-700">{item.nama || 'Nama Murid'}</div>
                    <div className="text-xs text-gray-600">NIS: {item.nis || '-'}</div>
                    <div className="text-xs text-gray-500">Kelas: {item.kelas || '-'}</div>
                    <div className="text-xs text-gray-500">TTL: {item.tempat_lahir || '-'}, {formatDate(item.tanggal_lahir)}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : searchTerm && !loading ? (
          <div className="text-center py-4 text-gray-500 text-sm">
            Tidak ada {searchType === 'pegawai' ? 'pegawai' : 'murid'} ditemukan
          </div>
        ) : (
          <div className="text-center py-4 text-gray-400 text-sm">
            Masukkan kata kunci untuk mencari {searchType === 'pegawai' ? 'pegawai' : 'murid'}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchData;