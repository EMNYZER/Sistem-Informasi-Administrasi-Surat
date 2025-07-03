const express = require("express");
const shortid = require("shortid");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const QRCode = require("qrcode");
const { authenticateToken } = require("../middleware/auth");
const { SuratKeluar, KategoriSuratKeluar, Pegawai } = require("../models");

const lampiranStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../public/uploads/lampiran");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});

const uploadLampiran = multer({
  storage: lampiranStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Hanya file PDF yang diizinkan!"));
    }
  },
});

// upload lampiran by id
router.post(
  "/upload-lampiran/:id_surat",
  authenticateToken,
  uploadLampiran.single("file"),
  async (req, res) => {
    try {
      const id = req.params.id_surat;
      const fileUrl = `http://localhost:3001/uploads/lampiran/${req.file.filename}`;

      const surat = await SuratKeluar.findByPk(id);
      if (!surat)
        return res.status(404).json({ error: "Surat tidak ditemukan" });

      surat.lampiran_file = fileUrl;
      await surat.save();

      res.json({ message: "Lampiran berhasil diupload", url: fileUrl });
    } catch (error) {
      console.error(error);
      res
        .status(500)
        .json({ error: "Gagal upload lampiran", detail: error.message });
    }
  },
);

// Get all surat keluar
router.get("/", authenticateToken, async (req, res) => {
  try {
    const surat = await SuratKeluar.findAll({
      include: [
        { model: KategoriSuratKeluar, as: "kategori" },
        { model: Pegawai, as: "pegawai" },
      ],
      order: [["id_surat", "DESC"]],
    });
    res.json(surat);
  } catch (error) {
    res.status(500).json({
      error: "Terjadi kesalahan saat mengambil data surat keluar",
      message: error.message,
    });
  }
});

// Get all surat keluar by NIK
router.get("/nik/:nik", authenticateToken, async (req, res) => {
  try {
    const { nik } = req.params;
    const surat = await SuratKeluar.findAll({
      where: { NIK: nik },
      include: [
        { model: KategoriSuratKeluar, as: "kategori" },
        { model: Pegawai, as: "pegawai" },
      ],
      order: [["id_surat", "DESC"]],
    });
    res.json(surat);
  } catch (error) {
    res.status(500).json({
      error: "Terjadi kesalahan saat mengambil data surat keluar",
      message: error.message,
    });
  }
});

// Get all surat keluar by status
router.get("/status/:status", authenticateToken, async (req, res) => {
  try {
    const { status } = req.params;
    const surat = await SuratKeluar.findAll({
      where: { status },
      include: [
        { model: KategoriSuratKeluar, as: "kategori" },
        { model: Pegawai, as: "pegawai" },
      ],
      order: [["id_surat", "DESC"]],
    });
    res.json(surat);
  } catch (error) {
    res.status(500).json({
      error: "Terjadi kesalahan saat mengambil data surat keluar",
      message: error.message,
    });
  }
});

// Get surat keluar by id
router.get("/:id_surat", authenticateToken, async (req, res) => {
  try {
    const surat = await SuratKeluar.findByPk(req.params.id_surat, {
      include: [
        { model: KategoriSuratKeluar, as: "kategori" },
        { model: Pegawai, as: "pegawai" },
      ],
    });
    if (!surat)
      return res.status(404).json({ error: "Surat keluar tidak ditemukan" });
    res.json(surat);
  } catch (error) {
    res.status(500).json({
      error: "Terjadi kesalahan saat mengambil data surat keluar",
      message: error.message,
    });
  }
});

// Get surat keluar by id for validation
router.get("/valid/:id_surat", async (req, res) => {
  try {
    const surat = await SuratKeluar.findByPk(req.params.id_surat, {
      include: [
        { model: KategoriSuratKeluar, as: "kategori" },
        { model: Pegawai, as: "pegawai" },
      ],
    });
    if (!surat)
      return res.status(404).json({ error: "Surat keluar tidak ditemukan" });
    res.json(surat);
  } catch (error) {
    res.status(500).json({
      error: "Terjadi kesalahan saat mengambil data surat keluar",
      message: error.message,
    });
  }
});

// Create surat keluar
router.post("/", authenticateToken, async (req, res) => {
  try {
    const id_surat = shortid.generate();
    const surat = await SuratKeluar.create({ ...req.body, id_surat });
    res.json(surat);
  } catch (error) {
    res.status(500).json({
      error: "Terjadi kesalahan saat menambah surat keluar",
      message: error.message,
    });
  }
});

// Update surat keluar
router.put('/:id_surat', authenticateToken, async (req, res) => {
  try {
    const { id_surat } = req.params;
    const { status } = req.body;

    if (status === 'disetujui') {
      const surat = await SuratKeluar.findByPk(id_surat);
      if (surat && !surat.QR_code) {
        const validationUrl = `http://localhost:3000/validation/${id_surat}`;
        
        const filename = `${shortid()}.png`;
        const outputPath = path.join(__dirname, '../public/qrcodes', filename);

        await QRCode.toFile(outputPath, validationUrl, {
          errorCorrectionLevel: 'H',
          margin: 2,
          width: 200
        });

        req.body.QR_code = `http://localhost:3001/qrcodes/${filename}`;
      }
    }

    const [updated] = await SuratKeluar.update(req.body, { where: { id_surat } });
    if (!updated) return res.status(404).json({ error: 'Surat keluar tidak ditemukan' });
    res.json({ message: 'Surat keluar berhasil diupdate' });
  } catch (error) {
    res.status(500).json({ error: 'Terjadi kesalahan saat mengupdate surat keluar', message: error.message });
  }
});

// Delete surat keluar
router.delete("/:id_surat", authenticateToken, async (req, res) => {
  try {
    const { id_surat } = req.params;

    // Cari data surat terlebih dahulu
    const surat = await SuratKeluar.findByPk(id_surat);
    if (!surat) {
      return res.status(404).json({ error: "Surat keluar tidak ditemukan" });
    }

    // 🔻 Hapus file QR code jika ada
    if (surat.QR_code) {
      const qrFilename = path.basename(surat.QR_code);
      const qrFilePath = path.join(
        __dirname,
        "..",
        "public",
        "qrcodes",
        qrFilename,
      );
      if (fs.existsSync(qrFilePath)) fs.unlinkSync(qrFilePath);
    }

    // 🔻 Hapus file lampiran PDF jika ada
    if (surat.lampiran) {
      const lampiranFilename = path.basename(surat.lampiran);
      const lampiranFilePath = path.join(
        __dirname,
        "..",
        "public",
        "uploads",
        "lampiran",
        lampiranFilename,
      );
      if (fs.existsSync(lampiranFilePath)) fs.unlinkSync(lampiranFilePath);
    }

    // 🔻 Hapus data surat dari database
    await SuratKeluar.destroy({ where: { id_surat } });

    res.json({
      message: "Surat keluar, QR code, dan lampiran berhasil dihapus",
    });
  } catch (error) {
    console.error("Gagal hapus surat:", error);
    res.status(500).json({
      error: "Terjadi kesalahan saat menghapus surat keluar",
      message: error.message,
    });
  }
});

// Generate nomor surat
router.post("/generate-nomor/:id_surat", authenticateToken, async (req, res) => {
    try {
      const { id_surat } = req.params;
      const surat = await SuratKeluar.findByPk(id_surat);
      if (!surat)
        return res.status(404).json({ error: "Surat keluar tidak ditemukan" });

      // Ambil tahun dan bulan dari tanggal_surat
      const tanggal = new Date(surat.tanggal_surat);
      const tahun = tanggal.getFullYear();
      const bulan = tanggal.getMonth() + 1;
      const bulanRomawi = [
        "I",
        "II",
        "III",
        "IV",
        "V",
        "VI",
        "VII",
        "VIII",
        "IX",
        "X",
        "XI",
        "XII",
      ][bulan - 1];
      const kode_kategori = surat.kode_kategori;

      // Cari nomor urut terakhir untuk tahun & kategori yang sama
      const lastSurat = await SuratKeluar.findOne({
        where: {
          kode_kategori,
          nomor_urut_surat: { [require("sequelize").Op.ne]: null },
          tanggal_surat: {
            [require("sequelize").Op.gte]: new Date(`${tahun}-01-01`),
            [require("sequelize").Op.lte]: new Date(`${tahun}-12-31`),
          },
        },
        order: [["nomor_urut_surat", "DESC"]],
      });
      let nomor_urut = 1;
      if (lastSurat && lastSurat.nomor_urut_surat) {
        nomor_urut = parseInt(lastSurat.nomor_urut_surat) + 1;
      }
      // Format nomor surat
      const nomor_surat = `${nomor_urut}/${kode_kategori}/SDITASM/${bulanRomawi}/${tahun}`;

      // Update surat
      await SuratKeluar.update(
        { nomor_urut_surat: nomor_urut, nomor_surat },
        { where: { id_surat } },
      );
      res.json({ nomor_surat });
    } catch (error) {
      res
        .status(500)
        .json({ error: "Gagal generate nomor surat", message: error.message });
    }
  },
);

module.exports = router;
