const express = require("express");
const shortid = require("shortid");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const { SuratMasuk, Pegawai, sequelize } = require("../models");
const { Op } = require("sequelize");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../public/uploads/surat-masuk");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    // Allow PDF, DOC, DOCX, and image files
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Hanya file gambar, PDF, dan dokumen Word yang diizinkan!"));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});

// Function to convert month to Roman numerals
const toRomanNumeral = (month) => {
  const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  return roman[month];
};

// Function to generate nomor_agenda automatically
const generateNomorAgenda = async (tanggal_terima) => {
  const date = new Date(tanggal_terima);
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-11
  
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);

  const lastSurat = await SuratMasuk.findOne({
    where: {
      tanggal_terima: { [Op.between]: [startDate, endDate] },
    },
    order: [["nomor_agenda", "DESC"]],
  });

  let nextNumber = 1;
  if (lastSurat) {
    const match = lastSurat.nomor_agenda.match(/^(\d+)\/SM\//);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }

  const romanMonth = toRomanNumeral(month);
  const nomorUrut = nextNumber.toString().padStart(3, "0");
  return `${nomorUrut}/SM/${romanMonth}/${year}`;
};

// GET all incoming letters
router.get("/", authenticateToken, async (req, res) => {
  try {
    const suratMasuk = await SuratMasuk.findAll({
      include: [{ model: Pegawai, as: "pegawai", attributes: ["nama", "NIK"] }],
      order: [["tanggal_terima", "DESC"]],
    });
    res.json(suratMasuk);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil data surat masuk", message: error.message });
  }
});

// GET incoming letters by status
router.get("/status/:status", authenticateToken, async (req, res) => {
  try {
    const { status } = req.params;
    const suratMasuk = await SuratMasuk.findAll({
      where: { status_disposisi: status },
      include: [{ model: Pegawai, as: "pegawai", attributes: ["nama", "NIK"] }],
      order: [["tanggal_terima", "DESC"]],
    });
    res.json(suratMasuk);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil data surat masuk", message: error.message });
  }
});

// GET incoming letter by id_surat
router.get("/:id_surat", authenticateToken, async (req, res) => {
  try {
    const { id_surat } = req.params;
    const suratMasuk = await SuratMasuk.findOne({
      where: { id_surat },
      include: [{ model: Pegawai, as: "pegawai", attributes: ["nama", "NIK"] }],
    });
    if (!suratMasuk) {
      return res.status(404).json({ error: "Surat masuk tidak ditemukan" });
    }
    res.json(suratMasuk);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengambil data surat masuk", message: error.message });
  }
});

// POST create new incoming letter
router.post("/", authenticateToken, upload.single("file_surat"), async (req, res) => {
  try {
    const { NIK } = req.body;
    const id_surat = shortid.generate();
    const nomor_agenda = await generateNomorAgenda(req.body.tanggal_terima);

    const pegawai = await Pegawai.findByPk(NIK);
    if (!pegawai) {
      return res.status(400).json({ error: "Pegawai tidak ditemukan" });
    }

    let file_path = null;
    if (req.file) {
      file_path = path.join("uploads/surat-masuk", req.file.filename).replace(/\\/g, "/");
    }

    const newSurat = await SuratMasuk.create({
      ...req.body,
      id_surat,
      nomor_agenda,
      file_surat: file_path,
      status_disposisi: req.body.status_disposisi || "Belum",
    });

    res.status(201).json(newSurat);
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: "Gagal membuat surat masuk", message: error.message });
  }
});

// PUT update incoming letter
router.put("/:id_surat", authenticateToken, upload.single("file_surat"), async (req, res) => {
  try {
    const { id_surat } = req.params;
    const { NIK } = req.body;

    const surat = await SuratMasuk.findByPk(id_surat);
    if (!surat) {
      return res.status(404).json({ error: "Surat masuk tidak ditemukan" });
    }

    if (NIK) {
      const pegawai = await Pegawai.findByPk(NIK);
      if (!pegawai) {
        return res.status(400).json({ error: "Pegawai tidak ditemukan" });
      }
    }

    let file_path = surat.file_surat;
    if (req.file) {
      if (surat.file_surat) {
        const oldFilePath = path.join(__dirname, "../public", surat.file_surat);
        if (fs.existsSync(oldFilePath)) fs.unlinkSync(oldFilePath);
      }
      file_path = path.join("uploads/surat-masuk", req.file.filename).replace(/\\/g, "/");
    }

    await surat.update({ ...req.body, file_surat: file_path });
    const updatedSurat = await SuratMasuk.findByPk(id_surat, {
      include: [{ model: Pegawai, as: "pegawai" }]
    });

    res.json(updatedSurat);
  } catch (error) {
    if (req.file) fs.unlinkSync(req.file.path);
    res.status(500).json({ error: "Gagal mengupdate surat masuk", message: error.message });
  }
});

// PUT update status surat masuk
router.put("/:id_surat/status", authenticateToken, async (req, res) => {
  try {
    const { id_surat } = req.params;
    const { status_disposisi } = req.body;

    const surat = await SuratMasuk.findByPk(id_surat);
    if (!surat) {
      return res.status(404).json({ error: "Surat masuk tidak ditemukan" });
    }

    await surat.update({ status_disposisi });
    const updatedSurat = await SuratMasuk.findByPk(id_surat, {
      include: [{ model: Pegawai, as: "pegawai" }]
    });

    res.json(updatedSurat);
  } catch (error) {
    res.status(500).json({ error: "Gagal mengupdate status surat masuk", message: error.message });
  }
});

// DELETE incoming letter
router.delete("/:id_surat", authenticateToken, async (req, res) => {
  try {
    const { id_surat } = req.params;
    const surat = await SuratMasuk.findByPk(id_surat);
    if (!surat) {
      return res.status(404).json({ error: "Surat masuk tidak ditemukan" });
    }

    if (surat.file_surat) {
      const filePath = path.join(__dirname, "../public", surat.file_surat);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await surat.destroy();
    res.json({ message: "Surat masuk berhasil dihapus" });
  } catch (error) {
    res.status(500).json({ error: "Gagal menghapus surat masuk", message: error.message });
  }
});

module.exports = router;
