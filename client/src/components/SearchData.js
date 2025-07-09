import React, { useState, useEffect } from "react";
import axios from "axios";

// Komponen baris detail dengan tombol copy
const DetailRow = ({ label, value }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    if (value === undefined || value === null) return;
    navigator.clipboard.writeText(value.toString());
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };
  return (
    <div className="flex items-center mb-1 group">
      <div className="w-40 min-w-[8rem] font-medium text-gray-700 flex-shrink-0 flex items-center">
        {label}
        <span className="inline-block w-1 text-right mr-2">:</span>
      </div>
      <div className="flex-1 flex items-center gap-2">
        <span className="break-all">{value || '-'}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="ml-1 text-gray-400 hover:text-green-600 focus:outline-none"
          title="Copy"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 20 20"><path stroke="currentColor" strokeWidth="1.5" d="M7.5 4.5A2 2 0 0 1 9.5 2.5h5A2 2 0 0 1 16.5 4.5v9a2 2 0 0 1-2 2h-5a2 2 0 0 1-2-2v-9Z"/><path stroke="currentColor" strokeWidth="1.5" d="M4.5 7.5v7a2 2 0 0 0 2 2h5"/></svg>
        </button>
        {copied && <span className="text-xs text-green-600 ml-1">Copied!</span>}
      </div>
    </div>
  );
};

const SearchData = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchType, setSearchType] = useState("pegawai"); // 'pegawai' or 'murid'
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [userRole, setUserRole] = useState("");
  const [userProfile, setUserProfile] = useState(null);

  const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;

  // Fetch user profile & role on mount
  useEffect(() => {
    const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      const nik = localStorage.getItem("nik");
      if (!nik) return;
      try {
        const response = await axios.get(`${BACKEND_API_URL}/user/${nik}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserProfile(response.data.profileData);
        setUserRole(response.data.profileData.role || "");
      } catch (error) {
        setUserProfile(null);
        setUserRole("");
      }
    };
    fetchUserProfile();
  }, []);

  // Fetch data diri only sets selectedData from userProfile
  useEffect(() => {
    if (searchType === "dataDiri") {
      setLoading(true);
      setSelectedData(null);
      setSearchResults([]);
      setShowDropdown(false);
      // Use userProfile if available
      if (userProfile) {
        setSelectedData({ profileData: userProfile });
      }
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchType, userProfile]);

  const handleSearch = async (term) => {
    if (!term.trim()) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const endpoint =
        searchType === "pegawai"
          ? `${BACKEND_API_URL}/user/search?q=${term}`
          : `${BACKEND_API_URL}/murid/search?q=${term}`;
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setSearchResults(response.data);
      setShowDropdown(true);
    } catch (error) {
      setSearchResults([]);
      setShowDropdown(false);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setSelectedData(null);
    if (value.length > 0) {
      handleSearch(value);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleSelect = (item) => {
    setSelectedData(item);
    setShowDropdown(false);
    setSearchTerm("");
  };

  const handleBackToSearch = () => {
    setSelectedData(null);
    setSearchTerm("");
    setSearchResults([]);
    setShowDropdown(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-3 h-fit relative">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">
        Cari Data {searchType === "pegawai" ? "Pegawai" : searchType === "murid" ? "Murid" : "Diri"}
      </h3>

      {/* Search Type Toggle */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => { setSearchType("dataDiri"); handleBackToSearch(); }}
          className={`px-3 py-1 text-xs rounded ${searchType === "dataDiri" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          Data Diri
        </button>
        {userRole === "Admin" && (
          <button
            onClick={() => { setSearchType("pegawai"); handleBackToSearch(); }}
            className={`px-3 py-1 text-xs rounded ${searchType === "pegawai" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            Pegawai
          </button>
        )}
        <button
          onClick={() => { setSearchType("murid"); handleBackToSearch(); }}
          className={`px-3 py-1 text-xs rounded ${searchType === "murid" ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
        >
          Murid
        </button>
      </div>

      {/* Loading Spinner */}
      {loading && searchType === "dataDiri" && (
        <div className="text-center text-sm text-gray-500 mb-2">Memuat data diri...</div>
      )}

      {/* Search Input */}
      {!selectedData && searchType !== "dataDiri" && (
        <div className="flex gap-2 mb-3 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            placeholder={`Cari nama/NIK ${searchType === "pegawai" ? "pegawai" : "murid"}...`}
            className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-500"
            onKeyDown={(e) => e.key === "Enter" && handleSearch(searchTerm)}
            disabled={searchType === "dataDiri"}
            autoComplete="off"
          />
          {/* Dropdown Autocomplete */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute left-0 top-10 w-full bg-white border border-gray-200 rounded shadow-lg z-20 max-h-60 overflow-y-auto">
              {searchResults.map((item) => (
                <div
                  key={item.NIK || item.nis}
                  className="px-3 py-2 hover:bg-green-50 cursor-pointer text-sm border-b last:border-b-0"
                  onClick={() => handleSelect(item)}
                >
                  {searchType === "pegawai"
                    ? `${item.nama}`
                    : `${item.nama}`}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Detail View */}
      {selectedData && (
        <div className="border border-green-200 rounded p-4 bg-green-50 mb-2">
          <div className="flex justify-between items-center mb-2">
            <div className="font-semibold text-green-700">
              {searchType === "pegawai"
                ? "Data Pegawai"
                : searchType === "murid"
                ? "Data Murid"
                : "Data Diri"}
            </div>
            <button
              onClick={handleBackToSearch}
              className="text-xs text-green-700 hover:underline"
            >
              Kembali ke pencarian
            </button>
          </div>
          <div className="max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-4 h-full min-h-[350px]">
            {searchType === "pegawai" ? (
              <>
                {/* Left: Data Pribadi Pegawai */}
                <div className="p-4 bg-white rounded shadow-sm border border-gray-200 h-full flex flex-col">
                  <div className="font-semibold text-gray-700 mb-2 border-b pb-1">Data Pribadi Pegawai</div>
                  <DetailRow label="NIK" value={selectedData.NIK} />
                  <DetailRow label="Nama" value={selectedData.nama} />
                  <DetailRow label="Jenis Kelamin" value={selectedData.jenis_kelamin} />
                  <DetailRow label="Tempat Lahir" value={selectedData.tempat_lahir} />
                  <DetailRow label="Tanggal Lahir" value={formatDate(selectedData.tanggal_lahir)} />
                  <DetailRow label="Alamat" value={selectedData.alamat} />
                  <DetailRow label="Agama" value={selectedData.agama} />
                  <DetailRow label="No HP" value={selectedData.no_HP} />
                  <DetailRow label="Email" value={selectedData.email} />
                </div>
                {/* Right: Kepegawaian */}
                <div className="p-4 bg-white rounded shadow-sm border border-gray-200 h-full flex flex-col">
                  <div className="font-semibold text-gray-700 mb-2 border-b pb-1">Kepegawaian</div>
                  <DetailRow label="Jabatan" value={selectedData.jabatan?.nama_jabatan} />
                  <DetailRow label="Status" value={selectedData.status} />
                  <DetailRow label="Role" value={selectedData.role} />
                  <DetailRow label="NRG" value={selectedData.NRG} />
                  <DetailRow label="UKG" value={selectedData.UKG} />
                  <DetailRow label="NUPTK" value={selectedData.NUPTK} />
                  <DetailRow label="No. Induk Yayasan" value={selectedData.No_induk_yayasan} />
                </div>
              </>
            ) : searchType === "murid" ? (
              <>
                {/* Left: Data Pribadi Murid */}
                <div className="p-4 bg-white rounded shadow-sm border border-gray-200 h-full flex flex-col">
                  <div className="font-semibold text-gray-700 mb-2 border-b pb-1">Data Pribadi Murid</div>
                  <DetailRow label="NIS" value={selectedData.NIS} />
                  <DetailRow label="NISN" value={selectedData.NISN} />
                  <DetailRow label="NIK" value={selectedData.NIK} />
                  <DetailRow label="Nama" value={selectedData.nama} />
                  <DetailRow label="Jenis Kelamin" value={selectedData.jenis_kelamin} />
                  <DetailRow label="Tempat Lahir" value={selectedData.tempat_lahir} />
                  <DetailRow label="Tanggal Lahir" value={formatDate(selectedData.tanggal_lahir)} />
                  <DetailRow label="Alamat" value={selectedData.alamat} />
                  <DetailRow label="Rombel" value={selectedData.rombel} />
                </div>
                {/* Right: Pendataan & Orang Tua */}
                <div className="flex flex-col gap-4 h-full">
                  <div className="p-4 bg-white rounded shadow-sm border border-gray-200 h-fit mb-4 flex-1">
                    <div className="font-semibold text-gray-700 mb-2 border-b pb-1">Pendataan Murid</div>
                    <DetailRow label="Tahun Ajaran" value={selectedData.tahun_ajaran} />
                    <DetailRow label="Status Siswa" value={selectedData.status_siswa} />
                    <DetailRow label="Status Registrasi" value={selectedData.status_registrasi} />
                  </div>
                  <div className="p-4 bg-white rounded shadow-sm border border-gray-200 h-fit flex-1">
                    <div className="font-semibold text-gray-700 mb-2 border-b pb-1">Data Orang Tua</div>
                    <DetailRow label="Nama Ayah" value={selectedData.nama_ayah} />
                    <DetailRow label="Nama Ibu" value={selectedData.nama_ibu} />
                    <DetailRow label="Pekerjaan Ayah" value={selectedData.pekerjaan_ayah} />
                    <DetailRow label="Pekerjaan Ibu" value={selectedData.pekerjaan_ibu} />
                    <DetailRow label="No HP Ayah" value={selectedData.no_hp_ayah} />
                    <DetailRow label="No HP Ibu" value={selectedData.no_hp_ibu} />
                  </div>
                </div>
              </>
            ) : (
              // Data Diri (user pribadi)
              <>
                {/* Grid for Data Diri, same as pegawai */}
                  {/* Left: Data Pribadi */}
                  <div className="p-4 bg-white rounded shadow-sm border border-gray-200 h-full flex flex-col">
                    <div className="font-semibold text-gray-700 mb-2 border-b pb-1">Data Pribadi</div>
                    <DetailRow label="NIK" value={userProfile?.NIK} />
                    <DetailRow label="Nama" value={userProfile?.nama} />
                    <DetailRow label="Jenis Kelamin" value={userProfile?.jenis_kelamin} />
                    <DetailRow label="Tempat Lahir" value={userProfile?.tempat_lahir} />
                    <DetailRow label="Tanggal Lahir" value={formatDate(userProfile?.tanggal_lahir)} />
                    <DetailRow label="Alamat" value={userProfile?.alamat} />
                    <DetailRow label="Agama" value={userProfile?.agama} />
                    <DetailRow label="No HP" value={userProfile?.no_HP} />
                    <DetailRow label="Email" value={userProfile?.email} />
                  </div>
                  {/* Right: Kepegawaian */}
                  <div className="p-4 bg-white rounded shadow-sm border border-gray-200 h-full flex flex-col">
                    <div className="font-semibold text-gray-700 mb-2 border-b pb-1">Kepegawaian</div>
                    <DetailRow label="Jabatan" value={userProfile?.jabatan?.nama_jabatan} />
                    <DetailRow label="Status" value={userProfile?.status} />
                    <DetailRow label="Role" value={userProfile?.role} />
                    <DetailRow label="NRG" value={userProfile?.NRG} />
                    <DetailRow label="UKG" value={userProfile?.UKG} />
                    <DetailRow label="NUPTK" value={userProfile?.NUPTK} />
                    <DetailRow label="No. Induk Yayasan" value={userProfile?.No_induk_yayasan} />
                  </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Search Results (legacy, not used in dropdown mode) */}
      {/* {searchType !== "dataDiri" && !selectedData && (
        <div className="max-h-96 overflow-y-auto">
          ...
        </div>
      )} */}
    </div>
  );
};

export default SearchData;
