const express = require("express");
const router = express.Router();
const multer = require("multer");
const XLSX = require("xlsx");
const fs = require("fs");
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
router.get("/search/cari", authenticateToken, async (req, res) => {
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
  let filePath = null;
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ message: "File tidak ditemukan" });

    filePath = file.path;
    const workbook = XLSX.readFile(filePath);
    
    // Validasi sheet name - harus ada sheet
    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return res.status(400).json({ 
        message: "File Excel tidak valid. Pastikan file memiliki sheet yang valid." 
      });
    }

    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Validasi header kolom yang diharapkan
    const expectedHeaders = [
      'NIS', 'NISN', 'NIK', 'nama', 'jenis_kelamin', 'tempat_lahir', 
      'tanggal_lahir', 'alamat', 'rombel', 'tahun_ajaran', 'status_siswa', 
      'status_registrasi', 'nama_ayah', 'nama_ibu', 'pekerjaan_ayah', 
      'pekerjaan_ibu', 'no_hp_ayah', 'no_hp_ibu'
    ];
    
    // Ambil header dari baris pertama
    const headerRow = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null })[0];
    if (!headerRow || headerRow.length === 0) {
      return res.status(400).json({ 
        message: "File Excel tidak memiliki header. Pastikan file sesuai dengan template yang disediakan." 
      });
    }

    // Normalize header (convert to lowercase and trim)
    const actualHeaders = headerRow.map(h => h ? String(h).trim().toLowerCase() : '');
    const normalizedExpectedHeaders = expectedHeaders.map(h => h.toLowerCase());

    // Cek apakah semua header yang diharapkan ada
    const missingHeaders = normalizedExpectedHeaders.filter(expected => 
      !actualHeaders.includes(expected)
    );

    if (missingHeaders.length > 0) {
      return res.status(400).json({ 
        message: `Template tidak sesuai. Pastikan file sesuai dengan template yang disediakan.`,
        missingHeaders: missingHeaders
      });
    }

    // Convert to JSON dengan header yang benar
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (!data || data.length === 0) {
      return res.status(400).json({ 
        message: "File Excel tidak memiliki data. Pastikan ada data selain header." 
      });
    }

    // Validasi data per baris
    const validationErrors = [];
    const muridData = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // +2 karena baris 1 adalah header dan index dimulai dari 0
      const rowErrors = [];

      // Validasi field required
      const requiredFields = {
        'NIS': 'NIS',
        'NISN': 'NISN',
        'nama': 'Nama',
        'jenis_kelamin': 'Jenis Kelamin',
        'tempat_lahir': 'Tempat Lahir',
        'tanggal_lahir': 'Tanggal Lahir',
        'rombel': 'Rombel',
        'tahun_ajaran': 'Tahun Ajaran',
        'status_siswa': 'Status Siswa',
        'status_registrasi': 'Status Registrasi',
        'nama_ayah': 'Nama Ayah',
        'nama_ibu': 'Nama Ibu'
      };

      Object.keys(requiredFields).forEach(field => {
        const value = row[field];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          rowErrors.push(`${requiredFields[field]} harus diisi`);
        }
      });

      // Validasi enum untuk jenis_kelamin
      if (row.jenis_kelamin && !['Laki-laki', 'Perempuan'].includes(String(row.jenis_kelamin).trim())) {
        rowErrors.push('Jenis Kelamin harus "Laki-laki" atau "Perempuan"');
      }

      // Validasi enum untuk status_siswa
      if (row.status_siswa && !['Aktif', 'Pindah', 'Lulus'].includes(String(row.status_siswa).trim())) {
        rowErrors.push('Status Siswa harus "Aktif", "Pindah", atau "Lulus"');
      }

      // Validasi enum untuk status_registrasi
      if (row.status_registrasi && !['Siswa Baru', 'Pindahan'].includes(String(row.status_registrasi).trim())) {
        rowErrors.push('Status Registrasi harus "Siswa Baru" atau "Pindahan"');
      }

      if (rowErrors.length > 0) {
        validationErrors.push({
          row: rowNumber,
          errors: rowErrors
        });
      } else {
        // Mapping data sesuai model Murid
        muridData.push({
          NIS: String(row.NIS).trim(),
          NISN: String(row.NISN).trim(),
          NIK: row.NIK ? String(row.NIK).trim() : null,
          nama: String(row.nama).trim(),
          jenis_kelamin: String(row.jenis_kelamin).trim(),
          tempat_lahir: String(row.tempat_lahir).trim(),
          tanggal_lahir: row.tanggal_lahir,
          alamat: row.alamat ? String(row.alamat).trim() : null,
          rombel: String(row.rombel).trim(),
          tahun_ajaran: String(row.tahun_ajaran).trim(),
          status_siswa: String(row.status_siswa).trim(),
          status_registrasi: String(row.status_registrasi).trim(),
          nama_ayah: String(row.nama_ayah).trim(),
          nama_ibu: String(row.nama_ibu).trim(),
          pekerjaan_ayah: row.pekerjaan_ayah ? String(row.pekerjaan_ayah).trim() : null,
          pekerjaan_ibu: row.pekerjaan_ibu ? String(row.pekerjaan_ibu).trim() : null,
          no_hp_ayah: row.no_hp_ayah ? String(row.no_hp_ayah).trim() : null,
          no_hp_ibu: row.no_hp_ibu ? String(row.no_hp_ibu).trim() : null,
        });
      }
    }

    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        message: "Validasi data gagal. Silakan periksa data di file Excel.",
        errors: validationErrors,
        totalErrors: validationErrors.length
      });
    }

    if (muridData.length === 0) {
      return res.status(400).json({ 
        message: "Tidak ada data yang valid untuk diimport." 
      });
    }

    // Bulk insert, ignore duplicates by NIS or NISN
    await Murid.bulkCreate(muridData, { ignoreDuplicates: true });

    // Cleanup file setelah selesai
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ 
      message: `Import data murid berhasil. ${muridData.length} data berhasil diimport.`,
      imported: muridData.length
    });
  } catch (err) {
    // Cleanup file jika terjadi error
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (cleanupErr) {
        console.error("Error cleaning up file:", cleanupErr);
      }
    }
    res.status(500).json({ 
      message: "Gagal import", 
      error: err.message 
    });
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
