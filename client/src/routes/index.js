import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import Login from "../pages/login";
import Profile from "../pages/profile";
import Dashboard from "../pages/dashboard";
import Pegawai from "../pages/pegawai";
import Jabatan from "../pages/jabatan";
import SuratKeluar from "../pages/suratKeluar";
import FormSuratKeluar from "../pages/formSuratKeluar";
import ViewSuratKeluar from "../pages/viewSuratKeluar";
import PengaturanSurat from "../pages/pengaturanSurat";
import TemplateSurat from "../pages/templateSurat";
import FormTemplate from "../pages/formTemplate";
import PilihTemplate from "../pages/pilihTemplate";
import VerifikasiSurat from "../pages/verifikasiSurat";
import PengesahanSurat from "../pages/pengesahanSurat";
import Validation from "../pages/validation";
import Pages404 from "../pages/pages404";
import SuratMasuk from "../pages/suratMasuk";
import FormSuratmasuk from "../pages/formSuratmasuk";
import Murid from "../pages/murid";
import FormDisposisi from "../pages/formDIsposisi";
import RiwayatDisposisi from "../pages/riwayatDisposisi";
import DaftarDisposisi from "../pages/daftarDisposisi";
import FormLanjutanDisposisi from "../pages/formLanjutanDisposisi";
import ViewDisposisi from "../pages/viewDisposisi";
import Laporan from "../pages/laporan";
import ViewLaporan from "../pages/viewLaporan";
import BukuAgenda from "../pages/bukuAgenda";

const router = createBrowserRouter([
  {
    path: "",
    element: <App />,
    children: [
      
      // Pengaturan
      { path: "login", element: <Login />,},
      { path: "profile", element: <Profile /> },
      { path: "dashboard", element: <Dashboard /> },
      { path: "pegawai", element: <Pegawai /> },
      { path: "jabatan", element: <Jabatan /> },
      { path: "pengaturan-surat", element: <PengaturanSurat /> },
      { path: "murid", element: <Murid/> },
      { path: "*", element: <Pages404 /> },
      
      // Template Surat Keluar
      { path: "template-surat", element: <TemplateSurat /> },
      { path: "template-form/:id?", element: <FormTemplate /> },
      { path: "daftar-template", element: <PilihTemplate /> },

      // Surat Keluar
      { path: "surat-keluar", element: <SuratKeluar />,},
      { path: "buat-surat", element: <FormSuratKeluar />,},
      { path: "buat-surat/:id_surat", element: <FormSuratKeluar />,},
      { path: "buat-surat/template/:id_template", element: <FormSuratKeluar />, },
      { path: "preview-surat", element: <ViewSuratKeluar />,},
      { path: "preview-surat/:id_surat", element: <ViewSuratKeluar />,},
      { path: "verifikasi", element: <VerifikasiSurat />,},


      // Verifikasi, Pengesahan, Validation
      
      // Surat Masuk
      { path: "surat-masuk", element: <SuratMasuk/>,},
      { path: "catat-surat", element: <FormSuratmasuk/>,},
      { path: "catat-surat/:id_surat", element: <FormSuratmasuk/>,},
      
      // Disposisi
      { path: "disposisi/:id_surat", element: <FormDisposisi/>,},
      { path: "teruskan-disposisi/:id_disposisi", element: <FormLanjutanDisposisi/>,},
      { path: "riwayat-disposisi", element: <RiwayatDisposisi/>,},


      { path: "daftar-disposisi", element: <DaftarDisposisi/>,},
      { path: "pengesahan", element: <PengesahanSurat />, },
      { path: "validation/:id_surat", element: <Validation />, },
      { path: "view-disposisi/:id_disposisi", element: <ViewDisposisi/>, },
      // Laporan
      { path: "laporan", element: <Laporan/> },
      { path: "view-laporan/:id_laporan", element: <ViewLaporan/> },
      { path: "buku-agenda", element: <BukuAgenda/> },
    ],
  },
]);

export default router;
