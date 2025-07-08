const express = require("express");
const router = express.Router();
const shortid = require("shortid");
const { Laporan } = require("../models");
const { 
  cleanupExpiredLaporan, 
  cleanupExpiredMurid, 
  cleanupExpiredSuratKeluar, 
  cleanupExpiredSuratMasuk,
  runAllCleanup 
} = require("../cron/cleanupExpiredData");

// CREATE - Membuat laporan baru
router.post("/", async (req, res) => {
  try {
    const { mulai_tanggal, sampai_tanggal, jenis_laporan, Judul } = req.body;
    
    // Generate id_laporan menggunakan shortid
    const id_laporan = shortid.generate();
    
    // Set Expired_Date 2 tahun dari sekarang
    const expired_date = new Date();
    expired_date.setFullYear(expired_date.getFullYear() + 2);
    
    const laporan = await Laporan.create({
      id_laporan,
      mulai_tanggal,
      sampai_tanggal,
      jenis_laporan,
      Judul,
      Expired_Date: expired_date
    });
    
    res.status(201).json({
      success: true,
      message: "Laporan berhasil dibuat",
      data: laporan
    });
  } catch (error) {
    console.error("Error creating laporan:", error);
    res.status(500).json({
      success: false,
      message: "Gagal membuat laporan",
      error: error.message
    });
  }
});

// READ - Mendapatkan semua laporan
router.get("/", async (req, res) => {
  try {
    const laporans = await Laporan.findAll({
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      message: "Data laporan berhasil diambil",
      data: laporans
    });
  } catch (error) {
    console.error("Error fetching laporans:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data laporan",
      error: error.message
    });
  }
});

// READ - Mendapatkan laporan berdasarkan ID
router.get("/:id_laporan", async (req, res) => {
  try {
    const { id_laporan } = req.params;
    
    const laporan = await Laporan.findByPk(id_laporan);
    
    if (!laporan) {
      return res.status(404).json({
        success: false,
        message: "Laporan tidak ditemukan"
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Data laporan berhasil diambil",
      data: laporan
    });
  } catch (error) {
    console.error("Error fetching laporan:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data laporan",
      error: error.message
    });
  }
});

// UPDATE - Mengupdate laporan
router.put("/:id_laporan", async (req, res) => {
  try {
    const { id_laporan } = req.params;
    const { mulai_tanggal, sampai_tanggal, jenis_laporan, Judul } = req.body;
    
    const laporan = await Laporan.findByPk(id_laporan);
    
    if (!laporan) {
      return res.status(404).json({
        success: false,
        message: "Laporan tidak ditemukan"
      });
    }
    
    // Update data laporan
    await laporan.update({
      mulai_tanggal,
      sampai_tanggal,
      jenis_laporan,
      Judul
    });
    
    res.status(200).json({
      success: true,
      message: "Laporan berhasil diupdate",
      data: laporan
    });
  } catch (error) {
    console.error("Error updating laporan:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengupdate laporan",
      error: error.message
    });
  }
});

// DELETE - Menghapus laporan
router.delete("/:id_laporan", async (req, res) => {
  try {
    const { id_laporan } = req.params;
    
    const laporan = await Laporan.findByPk(id_laporan);
    
    if (!laporan) {
      return res.status(404).json({
        success: false,
        message: "Laporan tidak ditemukan"
      });
    }
    
    await laporan.destroy();
    
    res.status(200).json({
      success: true,
      message: "Laporan berhasil dihapus"
    });
  } catch (error) {
    console.error("Error deleting laporan:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menghapus laporan",
      error: error.message
    });
  }
});

// GET - Mendapatkan laporan berdasarkan jenis
router.get("/filter/jenis/:jenis", async (req, res) => {
  try {
    const { jenis } = req.params;
    
    const laporans = await Laporan.findAll({
      where: {
        jenis_laporan: jenis
      },
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      message: `Data laporan ${jenis} berhasil diambil`,
      data: laporans
    });
  } catch (error) {
    console.error("Error fetching laporan by jenis:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data laporan berdasarkan jenis",
      error: error.message
    });
  }
});

// GET - Mendapatkan laporan yang belum expired
router.get("/filter/active", async (req, res) => {
  try {
    const currentDate = new Date();
    
    const laporans = await Laporan.findAll({
      where: {
        Expired_Date: {
          [require('sequelize').Op.gt]: currentDate
        }
      },
      order: [['createdAt', 'DESC']]
    });
    
    res.status(200).json({
      success: true,
      message: "Data laporan aktif berhasil diambil",
      data: laporans
    });
  } catch (error) {
    console.error("Error fetching active laporan:", error);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data laporan aktif",
      error: error.message
    });
  }
});

// POST - Manual cleanup expired laporan (untuk testing/admin)
router.post("/cleanup-expired", async (req, res) => {
  try {
    await cleanupExpiredLaporan();
    res.status(200).json({
      success: true,
      message: "Cleanup expired laporan berhasil dijalankan"
    });
  } catch (error) {
    console.error("Error manual cleanup:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menjalankan cleanup",
      error: error.message
    });
  }
});

// POST - Manual cleanup semua data expired (untuk testing/admin)
router.post("/cleanup-all", async (req, res) => {
  try {
    await runAllCleanup();
    res.status(200).json({
      success: true,
      message: "Cleanup semua data expired berhasil dijalankan"
    });
  } catch (error) {
    console.error("Error manual cleanup all:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menjalankan cleanup",
      error: error.message
    });
  }
});

// POST - Manual cleanup data murid expired (untuk testing/admin)
router.post("/cleanup-murid", async (req, res) => {
  try {
    await cleanupExpiredMurid();
    res.status(200).json({
      success: true,
      message: "Cleanup data murid expired berhasil dijalankan"
    });
  } catch (error) {
    console.error("Error manual cleanup murid:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menjalankan cleanup murid",
      error: error.message
    });
  }
});

// POST - Manual cleanup data surat keluar expired (untuk testing/admin)
router.post("/cleanup-surat-keluar", async (req, res) => {
  try {
    await cleanupExpiredSuratKeluar();
    res.status(200).json({
      success: true,
      message: "Cleanup data surat keluar expired berhasil dijalankan"
    });
  } catch (error) {
    console.error("Error manual cleanup surat keluar:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menjalankan cleanup surat keluar",
      error: error.message
    });
  }
});

// POST - Manual cleanup data surat masuk expired (untuk testing/admin)
router.post("/cleanup-surat-masuk", async (req, res) => {
  try {
    await cleanupExpiredSuratMasuk();
    res.status(200).json({
      success: true,
      message: "Cleanup data surat masuk expired berhasil dijalankan"
    });
  } catch (error) {
    console.error("Error manual cleanup surat masuk:", error);
    res.status(500).json({
      success: false,
      message: "Gagal menjalankan cleanup surat masuk",
      error: error.message
    });
  }
});

module.exports = router;
