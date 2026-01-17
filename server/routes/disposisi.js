const express = require("express");
const router = express.Router();
const { Disposisi, DisposisiPegawai, SuratMasuk, Jabatan, Pegawai } = require("../models");
const shortid = require("shortid");
const { authenticateToken } = require("../middleware/auth");

// GET - Tampilkan semua disposisi
router.get("/", authenticateToken, async (req, res) => {
  try {
    const disposisi = await Disposisi.findAll({
      include: [
        {
          model: SuratMasuk,
          as: "suratMasuk",
          attributes: ["id_surat", "nomor_surat", "perihal", "tanggal_surat", "asal"]
        },
      ],
      order: [["tanggal_disposisi", "DESC"]]
    });

    res.json(disposisi);
  } catch (error) {
    console.error("Error fetching disposisi:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET - Tampilkan disposisi berdasarkan ID
router.get("/:id_disposisi", authenticateToken, async (req, res) => {
  try {
    const disposisi = await Disposisi.findByPk(req.params.id_disposisi, {
      include: [
        {
          model: SuratMasuk,
          as: "suratMasuk",
          attributes: ["id_surat", "nomor_surat","nomor_agenda", "perihal", "tanggal_surat","tanggal_terima","lampiran", "asal", "sifat","status_surat"]
        },
      ]
    });

    if (!disposisi) {
      return res.status(404).json({ message: "Disposisi tidak ditemukan" });
    }

    res.json(disposisi);
  } catch (error) {
    console.error("Error fetching disposisi:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET - pegawai penerima disposisi
router.get("/pegawai/:id_disposisi", authenticateToken, async (req, res) => {
  try{
    const id = req.params.id_disposisi
    const disposisiPegawaiData = await DisposisiPegawai.findAll({
      where: { id_disposisi: id },
      include: [
        {
          model: Pegawai,
          as: "pegawai",
          include: [
            {
              model: Jabatan,
              as: "jabatan"
            }
          ]
        },
      ]
    });

    if (!disposisiPegawaiData) {
      return res.status(404).json({ message: "penerima tidak ditemukan" });
    }

    res.json(disposisiPegawaiData);
  } catch(error){
    console.error("Error fetching disposisi:", error);
    res.status(500).json({ message: "Internal server errorh" });
  }
});

// GET - Tampilkan disposisi berdasarkan NIK pegawai (dari DisposisiPegawai)
router.get("/nik/:nik", authenticateToken, async (req, res) => {
  try {
    const nik = req.params.nik;
    const data = await DisposisiPegawai.findAll({
      where: { NIK: nik },
      include: [
        {
          model: Disposisi,
          as: "disposisi",
          include: [
            {
              model: SuratMasuk,
              as: "suratMasuk"
            }
          ]
        }
      ]
    });
    res.json(data);
  } catch (error) {
    console.error("Error fetching disposisi by NIK:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST - Buat disposisi baru
router.post("/", authenticateToken, async (req, res) => {
  try {
    const {
      id_surat,
      tanggal_disposisi,
      instruksi,
      instruksi_lanjutan,
      jabatan_penerima,
      catatan,
      status_disposisi,
      pegawai_penerima // Array of NIK
    } = req.body;

    // Generate short ID untuk disposisi
    const id_disposisi = shortid.generate();

    // Buat disposisi baru
    const disposisi = await Disposisi.create({
      id_disposisi: id_disposisi,
      id_surat,
      tanggal_disposisi: tanggal_disposisi || new Date(),
      instruksi,
      instruksi_lanjutan,
      jabatan_penerima,
      catatan,
      status_disposisi: status_disposisi || "Menunggu"
    });

    // Jika ada pegawai penerima, simpan ke DisposisiPegawai
    if (pegawai_penerima && pegawai_penerima.length > 0) {
      const disposisiPegawaiData = pegawai_penerima.map(nik => ({
        id_disposisi: id_disposisi,
        NIK: nik
      }));

      await DisposisiPegawai.bulkCreate(disposisiPegawaiData);
    }

    // Update status disposisi surat masuk
    await SuratMasuk.update(
      { status_disposisi: "Disposisi" },
      { where: { id_surat: id_surat } }
    );

    res.status(201).json({
      message: "Disposisi berhasil dibuat",
      disposisi: {
        ...disposisi.toJSON(),
        id_disposisi: id_disposisi
      }
    });
  } catch (error) {
    console.error("Error creating disposisi:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// PUT - Update disposisi
router.put("/:id_disposisi", authenticateToken, async (req, res) => {
  try {
    const {
      tanggal_disposisi,
      instruksi,
      instruksi_lanjutan,
      jabatan_penerima,
      catatan,
      status_disposisi,
      pegawai_penerima // Array of NIK
    } = req.body;

    const disposisi = await Disposisi.findByPk(req.params.id_disposisi);
    if (!disposisi) {
      return res.status(404).json({ message: "Disposisi tidak ditemukan" });
    }

    // Update disposisi
    await disposisi.update({
      tanggal_disposisi,
      instruksi,
      instruksi_lanjutan,
      jabatan_penerima,
      catatan,
      status_disposisi
    });

    // Hapus data DisposisiPegawai yang lama
    // await DisposisiPegawai.destroy({
    //   where: { id_disposisi: req.params.id_disposisi }
    // });

    // Buat data DisposisiPegawai yang baru
    if (pegawai_penerima && pegawai_penerima.length > 0) {
      const disposisiPegawaiData = pegawai_penerima.map(nik => ({
        id_disposisi: req.params.id_disposisi,
        NIK: nik
      }));

      await DisposisiPegawai.bulkCreate(disposisiPegawaiData);
    }

    res.json({
      message: "Disposisi berhasil diupdate",
      disposisi
    });
  } catch (error) {
    console.error("Error updating disposisi:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// DELETE - Hapus disposisi
router.delete("/:id_disposisi", authenticateToken, async (req, res) => {
  try {
    const disposisi = await Disposisi.findByPk(req.params.id_disposisi);
    if (!disposisi) {
      return res.status(404).json({ message: "Disposisi tidak ditemukan" });
    }

    // Hapus data DisposisiPegawai terkait
    await DisposisiPegawai.destroy({
      where: { id_disposisi: req.params.id_disposisi }
    });

    // Update status disposisi surat masuk menjadi "Belum"
    await SuratMasuk.update(
      { status_disposisi: "Belum" },
      { where: { id_surat: disposisi.id_surat } }
    );

    // Hapus disposisi
    await disposisi.destroy();

    res.json({ message: "Disposisi berhasil dihapus" });
  } catch (error) {
    console.error("Error deleting disposisi:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
