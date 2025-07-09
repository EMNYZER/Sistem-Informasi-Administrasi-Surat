const express = require("express");
const router = express.Router();
const multer = require("multer");
const XLSX = require("xlsx");
const upload = multer({ dest: "uploads/" });
const { authenticateToken } = require("../middleware/auth");
const { Murid } = require("../models");


// Ambil semua data murid
router.get("/", authenticateToken, async (req, res) => {
  try {
    const murid = await Murid.findAll();
    res.json(murid);
  } catch (error) {
    console.error("Error fetching murid:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat mengambil data murid",
      error: error.message,
    });
  }
});

// Cari murid berdasarkan nama/NIS (untuk autocomplete)
router.get("/search", authenticateToken, async (req, res) => {
  const q = req.query.q || "";
  try {
    const murid = await Murid.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { nama: { [require('sequelize').Op.like]: `%${q}%` } },
          { NIS: { [require('sequelize').Op.like]: `%${q}%` } }
        ]
      },
      limit: 10
    });
    res.json(murid);
  } catch (error) {
    res.status(500).json({ error: "Gagal mencari murid" });
  }
});

// Ambil data murid berdasarkan NIS
router.get("/:NIS", authenticateToken, async (req, res) => {
  try {
    const murid = await Murid.findOne({ where: { NIS: req.params.NIS } });
    if (!murid) {
      return res.status(404).json({
        status: "error",
        message: "Data murid tidak ditemukan",
      });
    }
    res.json(murid);
  } catch (error) {
    console.error("Error fetching murid by NIS:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat mengambil data murid",
      error: error.message,
    });
  }
});

// Tambah murid
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      NIS, NISN, NIK, nama, jenis_kelamin, tempat_lahir, tanggal_lahir, alamat, rombel, tahun_ajaran,
      status_siswa, status_registrasi, nama_ayah, nama_ibu, pekerjaan_ayah, pekerjaan_ibu, no_hp_ayah, no_hp_ibu
    } = req.body;

    // Validasi data wajib
    if (!NIS || !NISN || !nama || !jenis_kelamin || !tempat_lahir || !tanggal_lahir || !rombel || !tahun_ajaran || !status_siswa || !status_registrasi || !nama_ayah || !nama_ibu) {
      return res.status(400).json({
        status: "error",
        message: "Data tidak lengkap. Pastikan semua field wajib diisi."
      });
    }

    // Cek NIS sudah terdaftar
    const existingNIS = await Murid.findOne({ where: { NIS } });
    if (existingNIS) {
      return res.status(400).json({
        status: "error",
        message: "NIS sudah terdaftar"
      });
    }

    // Cek NISN sudah terdaftar
    const existingNISN = await Murid.findOne({ where: { NISN } });
    if (existingNISN) {
      return res.status(400).json({
        status: "error",
        message: "NISN sudah terdaftar"
      });
    }

    const newMurid = await Murid.create({
      NIS, NISN, NIK, nama, jenis_kelamin, tempat_lahir, tanggal_lahir, alamat, rombel, tahun_ajaran,
      status_siswa, status_registrasi, nama_ayah, nama_ibu, pekerjaan_ayah, pekerjaan_ibu, no_hp_ayah, no_hp_ibu
    });

    res.status(201).json({
      status: "success",
      message: "Data murid berhasil ditambahkan",
      newMurid,
    });
  } catch (error) {
    console.error("Error adding murid:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat menambahkan data murid",
      error: error.message,
    });
  }
});

// Import Data Murid by xlsx
router.post("/import", authenticateToken, upload.single("file"), async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "File tidak ditemukan" });

    const workbook = XLSX.readFile(file.path);
    const sheetName = workbook.SheetNames[0];
    const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Validasi & mapping data sesuai model Murid
    const muridData = data.map(row => ({
      NIS: row.NIS,
      NISN: row.NISN,
      NIK: row.NIK,
      nama: row.nama,
      jenis_kelamin: row.jenis_kelamin,
      tempat_lahir: row.tempat_lahir,
      tanggal_lahir: row.tanggal_lahir,
      alamat: row.alamat,
      rombel: row.rombel,
      tahun_ajaran: row.tahun_ajaran,
      status_siswa: row.status_siswa,
      status_registrasi: row.status_registrasi,
      nama_ayah: row.nama_ayah,
      nama_ibu: row.nama_ibu,
      pekerjaan_ayah: row.pekerjaan_ayah,
      pekerjaan_ibu: row.pekerjaan_ibu,
      no_hp_ayah: row.no_hp_ayah,
      no_hp_ibu: row.no_hp_ibu,
    }));

    // Bulk insert
    await Murid.bulkCreate(muridData, { ignoreDuplicates: true });

    res.json({ message: "Import data murid berhasil" });
  } catch (err) {
    res.status(500).json({ message: "Gagal import", error: err.message });
  }
});

// Edit murid
router.put("/:NIS", authenticateToken, async (req, res) => {
  try {
    const murid = await Murid.findOne({ where: { NIS: req.params.NIS } });
    if (!murid) {
      return res.status(404).json({
        status: "error",
        message: "Data murid tidak ditemukan",
      });
    }
    await murid.update(req.body);
    res.json({
      status: "success",
      message: "Data murid berhasil diperbarui",
      murid: murid.toJSON(),
    });
  } catch (error) {
    console.error("Error updating murid:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat memperbarui data murid",
      error: error.message,
    });
  }
});

// Hapus murid
router.delete("/:NIS", authenticateToken, async (req, res) => {
  try {
    const murid = await Murid.findOne({ where: { NIS: req.params.NIS } });
    if (!murid) {
      return res.status(404).json({
        status: "error",
        message: "Data murid tidak ditemukan",
      });
    }
    await murid.destroy();
    res.json({
      status: "success",
      message: "Data murid berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting murid:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat menghapus data murid",
      error: error.message,
    });
  }
});

module.exports = router;
