import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import profile_pic from "../assets/profile.jpg";
import Header from "../components/Header";
import Menu from "../components/Menu";
import axios from "axios";

function Profile() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");
  const [updateError, setUpdateError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [ttdPreview, setTtdPreview] = useState(null);
  const [ttdFile, setTtdFile] = useState(null);
  const [ttdError, setTtdError] = useState("");
  const [ttdSuccess, setTtdSuccess] = useState("");
  const [fotoFile, setFotoFile] = useState(null);
  const [fotoPreview, setFotoPreview] = useState(null);
  const [fotoError, setFotoError] = useState("");
  const [fotoSuccess, setFotoSuccess] = useState("");

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          // navigate('/login');
          return;
        }
        const nik = localStorage.getItem("nik");
        const response = await axios.get(`http://localhost:3001/user/${nik}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setProfileData(response.data.profileData);
      } catch (error) {
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem("token");
          // navigate('/login');
        } else {
          console.error("Error fetching profile data:", error);
        }
      }
    };
    const fetchTtd = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:3001/user/kepala-sekolah",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setTtdPreview(res.data.kepalaSekolah?.tanda_tangan || null);
      } catch (err) {
        setTtdPreview(null);
      }
    };
    fetchTtd();
    fetchProfileData();
  }, [navigate]);

  useEffect(() => {
    const fetchTtd = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(
          "http://localhost:3001/user/kepala-sekolah",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        setTtdPreview(res.data.kepalaSekolah?.tanda_tangan || null);
      } catch (err) {
        setTtdPreview(null);
      }
    };
    fetchTtd();
  }, []);

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
    setPasswordError("");
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Password baru dan konfirmasi password tidak cocok");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const response = await axios.post(
        "http://localhost:3001/users/change-password",
        {
          oldPassword: passwordData.oldPassword,
          newPassword: passwordData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (response.data.success) {
        alert("Password berhasil diperbarui");
        setShowPasswordModal(false);
        setPasswordData({
          oldPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setPasswordError(
          error.response?.data?.message ||
            "Terjadi kesalahan saat memperbarui password",
        );
      }
    }
  };

  const handleTtdFileChange = (e) => {
    const file = e.target.files[0];
    setTtdFile(file);
    setTtdError("");
    setTtdSuccess("");
    if (file) {
      setTtdPreview(URL.createObjectURL(file));
    } else if (profileData?.tanda_tangan) {
      setTtdPreview(profileData.tanda_tangan); // fallback ke yang lama
    }
  };

  const handleFotoFileChange = (e) => {
    const file = e.target.files[0];
    setFotoFile(file);
    setFotoError("");
    setFotoSuccess("");
    if (file) {
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleProfileUpdate = async () => {
    try {
      setIsUpdating(true);
      setUpdateError("");
      setTtdError("");
      setTtdSuccess("");
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      // Jika ada file tanda tangan baru, upload dulu
      if (ttdFile) {
        const formData = new FormData();
        formData.append("image", ttdFile);
        const nik = localStorage.getItem("nik");
        await axios.post(
          `http://localhost:3001/user/upload/${nik}/tanda-tangan`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setTtdSuccess("Tanda tangan berhasil diupload.");
        setTtdFile(null);
      }

      // Jika ada file foto baru, upload dulu
      if (fotoFile) {
        const formData = new FormData();
        formData.append("image", fotoFile);
        const nik = localStorage.getItem("nik");

        await axios.post(
          `http://localhost:3001/user/upload/${nik}/foto`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          },
        );
        setFotoSuccess("Foto profil berhasil diupload.");
        setFotoFile(null);
      }

      // Update profile
      const nik = localStorage.getItem("nik");
      const response = await axios.put(
        `http://localhost:3001/user/${nik}`,
        profileData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      if (response.data.success) {
        alert("Profile berhasil diperbarui");
        setProfileData(response.data.profileData);
      }
    } catch (error) {
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        setUpdateError(
          error.response?.data?.message ||
            "Terjadi kesalahan saat memperbarui profile",
        );
        setTtdError("Gagal upload tanda tangan.");
        console.log(error.message);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Menu />
      <div className="flex-1 p-4">
        <Header />
        <div className="bg-white shadow-sm rounded-lg p-5 mt-2">
          <div className="flex flex-col md:flex-row gap-6">
            {profileData ? (
              <>
                <div className="md:w-1/2">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="relative w-40 h-40 mx-auto">
                      <img
                        className="w-full h-full object-cover rounded-lg"
                        src={
                          fotoPreview ||
                          profileData.profile_picture ||
                          profile_pic
                        }
                        alt="Profile"
                      />
                      <label className="absolute bottom-2 right-2 bg-white p-1.5 rounded-full shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 text-gray-600"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          onChange={handleFotoFileChange}
                        />
                      </label>
                    </div>
                    <div className="mt-3 text-center">
                      <h2 className="text-lg font-medium text-gray-800">
                        {profileData.nama}
                      </h2>
                      {fotoError && (
                        <div className="text-red-600 text-xs mt-1">
                          {fotoError}
                        </div>
                      )}
                      {fotoSuccess && (
                        <div className="text-green-600 text-xs mt-1">
                          {fotoSuccess}
                        </div>
                      )}
                      <p className="text-xs text-gray-500">
                        {profileData.jabatan?.nama_jabatan || "-"}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {profileData.status}
                      </p>
                    </div>
                    {/* Form Upload Tanda Tangan */}
                    {profileData.role === "Approval" && (
                      <div className="mt-8 border-2 border-blue-200 bg-blue-50 rounded-lg p-3">
                        <TandaTanganProfile
                          onFileChange={handleTtdFileChange}
                          preview={ttdPreview}
                        />
                        {ttdError && (
                          <div className="text-red-600 text-xs mt-1">
                            {ttdError}
                          </div>
                        )}
                        {ttdSuccess && (
                          <div className="text-green-600 text-xs mt-1">
                            {ttdSuccess}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:w-3/4">
                  {updateError && (
                    <div className="mb-3 p-2 bg-red-50 text-red-600 rounded text-xs">
                      {updateError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        NIK
                      </label>
                      <p className="text-sm text-gray-800 bg-gray-50 px-2.5 py-1.5 rounded">
                        {profileData.NIK}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Nama Lengkap
                      </label>
                      <p className="text-sm text-gray-800 bg-gray-50 px-2.5 py-1.5 rounded">
                        {profileData.nama}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        NRG
                      </label>
                      <p className="text-sm text-gray-800 bg-gray-50 px-2.5 py-1.5 rounded">
                        {profileData.NRG}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        UKG
                      </label>
                      <p className="text-sm text-gray-800 bg-gray-50 px-2.5 py-1.5 rounded">
                        {profileData.UKG}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        NUPTK
                      </label>
                      <p className="text-sm text-gray-800 bg-gray-50 px-2.5 py-1.5 rounded">
                        {profileData.NUPTK}
                      </p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Jabatan
                      </label>
                      <p className="text-sm text-gray-800 bg-gray-50 px-2.5 py-1.5 rounded">
                        {profileData.jabatan?.nama_jabatan || "-"}
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Tempat Lahir
                      </label>
                      <input
                        type="text"
                        className="w-full text-sm bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                        value={profileData.tempat_lahir || ""}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            tempat_lahir: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Tanggal Lahir
                      </label>
                      <input
                        type="date"
                        className="w-full text-sm bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                        value={
                          profileData.tanggal_lahir
                            ? new Date(profileData.tanggal_lahir)
                                .toISOString()
                                .split("T")[0]
                            : ""
                        }
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            tanggal_lahir: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Jenis Kelamin
                      </label>
                      <select
                        className="w-full text-sm bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                        value={profileData.jenis_kelamin || ""}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            jenis_kelamin: e.target.value,
                          })
                        }
                      >
                        <option value="">Pilih Jenis Kelamin</option>
                        <option value="Laki-laki">Laki-laki</option>
                        <option value="Perempuan">Perempuan</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Agama
                      </label>
                      <select
                        className="w-full text-sm bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                        value={profileData.agama || ""}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            agama: e.target.value,
                          })
                        }
                      >
                        <option value="">Pilih Agama</option>
                        <option value="Islam">Islam</option>
                        <option value="Kristen">Kristen</option>
                        <option value="Katolik">Katolik</option>
                        <option value="Hindu">Hindu</option>
                        <option value="Budha">Budha</option>
                        <option value="Konghucu">Konghucu</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Alamat
                      </label>
                      <textarea
                        className="w-full text-sm bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                        rows="2"
                        value={profileData.alamat || ""}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            alamat: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Nomor HP
                      </label>
                      <input
                        type="text"
                        className="w-full text-sm bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                        value={profileData.no_HP || ""}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            no_HP: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        className="w-full text-sm bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                        value={profileData.email || ""}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            email: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <button
                      className="bg-green-600 text-white text-sm px-3 py-1.5 rounded hover:bg-green-700 transition-colors focus:outline-none focus:ring-1 focus:ring-green-500 focus:ring-offset-1 disabled:opacity-50"
                      onClick={handleProfileUpdate}
                      disabled={isUpdating}
                    >
                      {isUpdating ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                    <button
                      className="bg-gray-100 text-gray-700 text-sm px-3 py-1.5 rounded hover:bg-gray-200 transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500 focus:ring-offset-1"
                      onClick={() => setShowPasswordModal(true)}
                    >
                      Ubah Password
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full text-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">
                  Memuat data profile...
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Password Update Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-lg p-4 w-full max-w-sm mx-4">
              <h2 className="text-lg font-medium text-gray-800 mb-3">
                Ubah Password
              </h2>
              {passwordError && (
                <div className="mb-3 p-2 bg-red-50 text-red-600 rounded text-xs">
                  {passwordError}
                </div>
              )}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Password Lama
                  </label>
                  <input
                    type="password"
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    className="w-full text-sm bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Password Baru
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full text-sm bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Konfirmasi Password Baru
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full text-sm bg-gray-50 border border-gray-200 rounded px-2.5 py-1.5 text-gray-800 focus:outline-none focus:ring-1 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({
                      oldPassword: "",
                      newPassword: "",
                      confirmPassword: "",
                    });
                    setPasswordError("");
                  }}
                  className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500 focus:ring-offset-1"
                >
                  Batal
                </button>
                <button
                  onClick={handlePasswordUpdate}
                  className="px-3 py-1.5 text-sm text-white bg-green-600 rounded hover:bg-green-700 transition-colors focus:outline-none focus:ring-1 focus:ring-green-500 focus:ring-offset-1"
                >
                  Update Password
                </button>
              </div>
            </div>
          </div>
        )}
        <Outlet />
      </div>
    </div>
  );
}

// Komponen Form Upload Tanda Tangan untuk Profile
function TandaTanganProfile({ onFileChange, preview }) {
  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
      {/* Preview di kiri */}
      <div className="w-full sm:w-2/3 flex flex-col items-center">
        <span className="text-gray-600 text-xs mb-1">
          Preview Tanda Tangan:
        </span>
        <div className="border rounded-lg bg-gray-100 flex items-center justify-center w-full h-24 mb-2">
          {preview ? (
            <img
              src={preview}
              alt="Tanda Tangan"
              className="max-h-20 object-contain"
            />
          ) : (
            <span className="text-gray-400 text-xs">
              Belum ada tanda tangan
            </span>
          )}
        </div>
      </div>
      {/* Form upload di kanan */}
      <div className="w-full sm:w-1/3 flex flex-col items-center gap-2">
        <input
          type="file"
          accept="image/*"
          onChange={onFileChange}
          className="block w-full text-xs text-gray-700 file:mr-2 file:py-1 file:px-2 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
      </div>
    </div>
  );
}

export default Profile;
