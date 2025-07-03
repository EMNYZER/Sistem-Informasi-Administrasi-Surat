import { Outlet, useLocation, useNavigate } from "react-router-dom";
import logo from "./assets/logo2.png";

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === "/") {
    return (
      <div className="min-h-screen flex flex-col bg-gray-200">
        <main className="flex-1 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center">
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
                  onClick={() => navigate("/alur-sistem")}
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
          </div>
        </main>
        <footer className="flex flex-col items-center justify-center py-8">
        </footer>
      </div>
    );
  }

  return <Outlet />;
}

export default App;
