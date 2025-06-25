const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { KategoriSuratKeluar } = require('../models');

// get all kategori surat keluar
router.get('/', authenticateToken, async (req, res) => {
     try {
          const kategori = await KategoriSuratKeluar.findAll();
          res.json(kategori);
     } catch (error) {
          res.status(500).json({ 
               error: 'Terjadi kesalahan saat mengambil data kategori surat keluar',
               message: error.message
          });
     }
});

// add kategori surat keluar
router.post('/', authenticateToken, async (req, res) => {
     try {
          const { kode_kategori, nama_kategori, deskripsi } = req.body;
          const kategori = await KategoriSuratKeluar.create(req.body);
          res.json(kategori);
     } catch (error) {
          res.status(500).json({ 
               error: 'Terjadi kesalahan saat menambahkan data kategori surat keluar', 
               message: error.message 
          });
     }
});

// update kategori surat keluar
router.put('/:kode_kategori', authenticateToken, async (req, res) => {
     try {
          const kategori = await KategoriSuratKeluar.update(req.body, { 
               where: { kode_kategori: req.params.kode_kategori } 
          });
          res.json(kategori);
     } catch (error) {
          res.status(500).json({ 
               error: 'Terjadi kesalahan saat mengubah data kategori surat keluar', 
               message: error.message
          });
     }
});

// delete kategori surat keluar
router.delete('/:kode_kategori', authenticateToken, async (req, res) => {
     try {
          const kategori = await KategoriSuratKeluar.destroy({ 
               where: { kode_kategori: req.params.kode_kategori } 
          });
          res.json(kategori);
     } catch (error) {
          res.status(500).json({ 
               error: 'Terjadi kesalahan saat menghapus data kategori surat keluar', 
               message: error.message 
          });
     }
});

module.exports = router; 