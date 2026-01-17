const express = require("express");
const router = express.Router();
const shortid = require("shortid");
const { Laporan } = require("../models");

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

module.exports = router;
