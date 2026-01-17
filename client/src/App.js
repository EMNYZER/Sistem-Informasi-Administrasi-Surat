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
        
        {/* Mobile Layout */}
        <main className="flex-1 flex flex-col items-center justify-center relative z-10 px-4 py-6 md:hidden">
          <div className="flex flex-col items-center gap-3 mb-6 w-full">
            <img src={logo} alt="Logo" className="h-28 w-28 object-contain" />
            <h2 className="text-sm font-semibold text-green-700 tracking-wide text-center uppercase leading-tight px-2">
              Sekolah Dasar Islam Terpadu Anak Sholeh Mataram
            </h2>
            <hr className="w-full max-w-xs border-t-2 border-gray-400 my-2" />
            <h1 className="text-xl font-bold text-gray-800 tracking-wide text-center leading-tight px-2">
              Sistem Informasi Administrasi Surat
            </h1>
            <p className="text-gray-600 text-center text-sm max-w-sm px-4 leading-relaxed">
              "Kelola surat masuk dan keluar dengan mudah, cepat, dan terintegrasi. Solusi administrasi modern untuk instansi Anda."
            </p>
          </div>
          <div className="flex flex-col gap-3 w-full max-w-xs px-4">
            <button
              onClick={() => setShowAlurModal(true)}
              className="w-full px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg border-2 border-gray-400 active:bg-gray-200 active:border-gray-600 transition-all duration-150 shadow-sm"
            >
              Alur Sistem
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-full px-4 py-3 text-sm font-semibold text-white bg-green-600 rounded-lg border-2 border-green-700 active:bg-green-700 active:border-green-900 transition-all duration-150 shadow-sm"
            >
              Login
            </button>
          </div>
        </main>

        {/* Desktop Layout */}
        <main className="hidden md:flex flex-1 flex-col items-center justify-center relative z-10 px-8">
          <div className="flex flex-col items-center gap-4 mb-8 max-w-4xl">
            <img src={logo} alt="Logo" className="h-48 w-48 lg:h-64 lg:w-64 object-contain mb-4" />
            <h2 className="text-xl lg:text-2xl font-semibold text-green-700 tracking-wide text-center uppercase">
              Sekolah Dasar Islam Terpadu Anak Sholeh Mataram
            </h2>
            <hr className="w-full max-w-2xl border-t-4 border-gray-400 my-4" />
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 tracking-wide text-center mb-4">
              Sistem Informasi Administrasi Surat
            </h1>
            <p className="text-gray-600 text-center text-lg lg:text-xl max-w-2xl leading-relaxed">
              "Kelola surat masuk dan keluar dengan mudah, cepat, dan terintegrasi. Solusi administrasi modern untuk instansi Anda."
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setShowAlurModal(true)}
              className="px-8 py-4 text-lg font-semibold text-gray-700 bg-gray-100 rounded-lg border-2 border-gray-400 hover:bg-gray-200 hover:border-gray-600 transition-all duration-150 shadow-md hover:shadow-lg"
            >
              Alur Sistem
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-4 text-lg font-semibold text-white bg-green-600 rounded-lg border-2 border-green-700 hover:bg-green-700 hover:border-green-900 transition-all duration-150 shadow-md hover:shadow-lg"
            >
              Login
            </button>
          </div>
        </main>

        <footer className="hidden md:flex flex-col items-center justify-center py-8">
        </footer>

        {/* Modal Alur Sistem - Mobile */}
        {showAlurModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 md:hidden">
            <div className="bg-white rounded-lg shadow-xl w-full max-h-[95vh] overflow-hidden relative m-2">
              {/* Header dengan tombol close */}
              <div className="flex justify-between items-center p-3 border-b border-gray-200">
                <h2 className="text-base font-semibold text-gray-800 pr-2">Alur Sistem SIAS</h2>
                <button
                  onClick={() => setShowAlurModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200 flex-shrink-0"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Content */}
              <div className="p-3 overflow-y-auto max-h-[calc(95vh-80px)]">
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

        {/* Modal Alur Sistem - Desktop */}
        {showAlurModal && (
          <div className="hidden md:flex fixed inset-0 bg-black bg-opacity-50 z-50 items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden relative">
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
