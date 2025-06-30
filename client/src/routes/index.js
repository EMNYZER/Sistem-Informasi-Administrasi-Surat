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
import TandaTangan from "../pages/tandaTangan";
import Pages404 from "../pages/pages404";
import SuratMasuk from "../pages/suratMasuk";
import FormSuratmasuk from "../pages/formSuratmasuk";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "profile",
        element: <Profile />,
      },
      {
        path: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "pegawai",
        element: <Pegawai />,
      },
      {
        path: "jabatan",
        element: <Jabatan />,
      },
      {
        path: "surat-keluar",
        element: <SuratKeluar />,
      },
      {
        path: "buat-surat",
        element: <FormSuratKeluar />,
      },
      {
        path: "buat-surat/:id_surat",
        element: <FormSuratKeluar />,
      },
      {
        path: "buat-surat/template/:id_template",
        element: <FormSuratKeluar />,
      },
      {
        path: "preview-surat",
        element: <ViewSuratKeluar />,
      },
      {
        path: "preview-surat/:id_surat",
        element: <ViewSuratKeluar />,
      },
      {
        path: "pengaturan-surat",
        element: <PengaturanSurat />,
      },
      {
        path: "template-surat",
        element: <TemplateSurat />,
      },
      {
        path: "template-form/:id?",
        element: <FormTemplate />,
      },
      {
        path: "daftar-template",
        element: <PilihTemplate />,
      },
      {
        path: "verifikasi",
        element: <VerifikasiSurat />,
      },
      {
        path: "pengesahan",
        element: <PengesahanSurat />,
      },
      {
        path: "validation/:id_surat",
        element: <Validation />,
      },
      {
        path: "sign",
        element: <TandaTangan />,
      },
      {
        path: "surat-masuk",
        element: <SuratMasuk/>,
      },
      {
        path: "catat-surat",
        element: <FormSuratmasuk/>,
      },
      {
        path: "*",
        element: <Pages404 />,
      },
    ],
  },
]);

export default router;
