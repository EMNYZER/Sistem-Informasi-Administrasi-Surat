const express = require("express");
const shortid = require("shortid");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const { Template, KategoriSuratKeluar } = require("../models");

// Get all templates
router.get("/", authenticateToken, async (req, res) => {
  try {
    const templates = await Template.findAll({
      include: [{ model: KategoriSuratKeluar, as: "kategori" }],
      order: [["id", "DESC"]],
    });
    res.json(templates);
  } catch (error) {
    res.status(500).json({
      error: "Terjadi kesalahan saat mengambil data template",
      message: error.message,
    });
  }
});

// Get template by id
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const template = await Template.findByPk(req.params.id, {
      include: [{ model: KategoriSuratKeluar, as: "kategori" }],
    });
    if (!template)
      return res.status(404).json({ error: "Template tidak ditemukan" });
    res.json(template);
  } catch (error) {
    res.status(500).json({
      error: "Terjadi kesalahan saat mengambil data template",
      message: error.message,
    });
  }
});

// Create template
router.post("/", authenticateToken, async (req, res) => {
  try {
    const id = shortid.generate();
    const { kode_kategori, perihal, deskripsi, isi_surat } = req.body;

    // Validate required fields
    if (!kode_kategori || !perihal || !deskripsi || !isi_surat) {
      return res.status(400).json({ error: "Semua field harus diisi" });
    }

    const template = await Template.create({
      id,
      kode_kategori,
      perihal,
      deskripsi,
      isi_surat,
    });

    // Fetch the created template with kategori data
    const createdTemplate = await Template.findByPk(template.id, {
      include: [{ model: KategoriSuratKeluar, as: "kategori" }],
    });

    res.status(201).json(createdTemplate);
  } catch (error) {
    res.status(500).json({
      error: "Terjadi kesalahan saat menambah template",
      message: error.message,
    });
  }
});

// Update template
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { kode_kategori, perihal, deskripsi, isi_surat } = req.body;

    // Validate required fields
    if (!kode_kategori || !perihal || !deskripsi || !isi_surat) {
      return res.status(400).json({ error: "Semua field harus diisi" });
    }

    const [updated] = await Template.update(
      {
        kode_kategori,
        perihal,
        deskripsi,
        isi_surat,
      },
      {
        where: { id: req.params.id },
      },
    );

    if (!updated)
      return res.status(404).json({ error: "Template tidak ditemukan" });

    // Fetch the updated template with kategori data
    const updatedTemplate = await Template.findByPk(req.params.id, {
      include: [{ model: KategoriSuratKeluar, as: "kategori" }],
    });

    res.json(updatedTemplate);
  } catch (error) {
    res.status(500).json({
      error: "Terjadi kesalahan saat mengupdate template",
      message: error.message,
    });
  }
});

// Delete template
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const deleted = await Template.destroy({ where: { id: req.params.id } });
    if (!deleted)
      return res.status(404).json({ error: "Template tidak ditemukan" });
    res.json({ message: "Template berhasil dihapus" });
  } catch (error) {
    res.status(500).json({
      error: "Terjadi kesalahan saat menghapus template",
      message: error.message,
    });
  }
});

module.exports = router;
