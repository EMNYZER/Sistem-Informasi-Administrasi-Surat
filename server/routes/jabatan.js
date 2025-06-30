const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const { Jabatan } = require("../models");

// get all jabatan
router.get("/", authenticateToken, async (req, res) => {
  try {
    const jabatan = await Jabatan.findAll();
    res.json(jabatan);
  } catch (error) {
    res.status(500).json({
      error: "Terjadi kesalahan saat mengambil data jabatan",
      message: error.message,
    });
  }
});

// add jabatan
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { jabatan_id, nama_jabatan, deskripsi } = req.body;
    const jabatan = await Jabatan.create(req.body);
    res.json(jabatan);
  } catch (error) {
    res.status(500).json({
      error: "Terjadi kesalahan saat menambahkan data jabatan",
      message: error.message,
    });
  }
});

// update jabatan
router.put("/:jabatan_id", authenticateToken, async (req, res) => {
  try {
    const jabatan = await Jabatan.update(req.body, {
      where: { jabatan_id: req.params.jabatan_id },
    });
    res.json(jabatan);
  } catch (error) {
    res.status(500).json({
      error: "Terjadi kesalahan saat mengubah data jabatan",
      message: error.message,
    });
  }
});

// delete jabatan
router.delete("/:jabatan_id", authenticateToken, async (req, res) => {
  try {
    const jabatan = await Jabatan.destroy({
      where: { jabatan_id: req.params.jabatan_id },
    });
    res.json(jabatan);
  } catch (error) {
    res.status(500).json({
      error: "Terjadi kesalahan saat menghapus data jabatan",
      message: error.message,
    });
  }
});

module.exports = router;
