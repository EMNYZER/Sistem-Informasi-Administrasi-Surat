import { Outlet, useLocation, useNavigate } from "react-router-dom";
import logo from "./assets/logo2.png";
import background from "./assets/bg_main_page.jpg";
import { useState } from "react";
import alurSistem from "./assets/alur_sistem.png";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showAlurModal, setShowAlurModal] = useState(false);

  if (location.pathname === "/") {
    return (
      <div 
        className="min-h-screen flex flex-col relative"
        style={{
          backgroundImage: `url(${background})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="absolute inset-0 bg-white/90"></div>
        <main className="flex-1 flex flex-col items-center justify-center relative z-10">
          <div className="flex flex-col items-center gap-2 mb-4">
            <img src={logo} alt="Logo" className="h-40 w-40 md:h-64 md:w-64 object-contain mb-2" />
            <h2 className="text-lg md:text-2xl font-semibold text-green-700 tracking-wide text-center mt-1 mb-1 uppercase">
              Sekolah Dasar Islam Terpadu Anak Sholeh Mataram
            </h2>
            <hr className="w-full border-t-4 border-gray-400 my-4" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800 tracking-wide text-center mb-2">
              Sistem Informasi Administrasi Surat
            </h1>
            <p className="text-gray-600 text-center text-base md:text-lg max-w-xl">
              "Kelola surat masuk dan keluar dengan mudah, cepat, dan terintegrasi. Solusi administrasi modern untuk instansi Anda."
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowAlurModal(true)}
              className="px-6 py-3 text-base font-semibold text-gray-700 bg-gray-100 rounded-lg border-2 border-gray-400 hover:bg-gray-200 hover:border-gray-600 transition-all duration-150 shadow-sm"
            >
              Alur Sistem
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-6 py-3 text-base font-semibold text-white bg-green-600 rounded-lg border-2 border-green-700 hover:bg-green-700 hover:border-green-900 transition-all duration-150 shadow-sm"
            >
              Login
            </button>
          </div>
        </main>
        <footer className="flex flex-col items-center justify-center py-8">
        </footer>

        {/* Modal Alur Sistem */}
        {showAlurModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-hidden relative">
              {/* Header dengan tombol close */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">Alur Sistem Informasi Administrasi Surat</h2>
                <button
                  onClick={() => setShowAlurModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Content */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="text-center">
                  <img 
                    src={alurSistem} 
                    alt="Alur Sistem SIAS" 
                    className="max-w-full h-auto mx-auto rounded-lg shadow-md"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return <Outlet />;
}

export default App;
