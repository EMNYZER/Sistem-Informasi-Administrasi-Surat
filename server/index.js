require('dotenv').config();
const express = require("express");
const cors = require("cors");
const db = require("./models");
const { startCleanupCron } = require("./cron/cleanupExpiredData");
const path = require("path");
const fs = require("fs");
const bcrypt = require("bcryptjs");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

//Routers
const login = require("./routes/login");
app.use("/login", login);
const user = require("./routes/User");
app.use("/user", user);
const murid = require("./routes/murid");
app.use("/murid", murid);
const jabatan = require("./routes/jabatan");
app.use("/jabatan", jabatan);
const kategori = require("./routes/kategori");
app.use("/kategori", kategori);
const template = require("./routes/template");
app.use("/template", template);

const suratKeluar = require("./routes/suratKeluar");
app.use("/suratKeluar", suratKeluar);

const suratMasuk = require("./routes/suratMasuk");
app.use("/suratMasuk", suratMasuk);
const disposisi = require("./routes/disposisi");
app.use("/disposisi", disposisi);

const laporan = require("./routes/laporan");
app.use("/laporan", laporan);

// Fungsi untuk membuat akun ADMIN default jika belum ada
async function ensureDefaultAdmin() {
  try {
    const defaultNIK = "12345678";
    const existing = await db.Pegawai.findOne({ where: { NIK: defaultNIK } });

    if (existing) {
      console.log("ℹ️ Default admin already exists (NIK 12345678)");
      return;
    }

    const hashedPassword = await bcrypt.hash(defaultNIK, 10);

    await db.Pegawai.create({
      NIK: defaultNIK,
      nama: "ADMIN",
      jenis_kelamin: "Laki-laki",
      tempat_lahir: "-",
      tanggal_lahir: new Date(),
      alamat: "-",
      agama: "Islam",
      jabatan_id: null,
      status: "Aktif",
      NRG: null,
      No_induk_yayasan: null,
      UKG: null,
      NUPTK: null,
      no_HP: "-",
      email: "admin@sias.local",
      password: hashedPassword,
      role: "Admin",
      profile_picture: null,
      tanda_tangan: null,
    });

    console.log("✅ Default admin created (NIK 12345678 / password 12345678)");
  } catch (err) {
    console.error("❌ Failed to create default admin:", err);
  }
}

db.sequelize.authenticate()
  .then(() => console.log('✅ Connected to TiDB Cloud successfully'))
  .catch(err => console.error('❌ Connection error:', err));

const PORT = process.env.PORT || 3001;
db.sequelize.sync().then(async () => {

  await ensureDefaultAdmin();
  
  app.use("/uploads", express.static("public/uploads"));
  app.use("/qrcodes", express.static("public/qrcodes"));
  app.use("/public", express.static("public"));

  app.get("/view-pdf/:filename", (req, res) => {
    const fileName = req.params.filename;
    const filePath = path.join(__dirname, "public/uploads/surat-masuk", fileName);
  
    if (!fs.existsSync(filePath)) {
      return res.status(404).send("File tidak ditemukan");
    }
  
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=" + fileName);
    res.sendFile(filePath);
  });

  // Start cron job untuk cleanup expired data
  startCleanupCron();

  app.listen(PORT, () => {
    const url = `http://localhost:${PORT}`;
    console.log(`server running on ${PORT}`);
    console.log(`Access the app at: ${url}`);
  });
});
