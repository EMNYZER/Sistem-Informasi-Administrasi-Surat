const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { Pegawai, Jabatan } = require("../models");
const bcrypt = require("bcrypt");

// === Setup Multer ===
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const tipe = req.params.tipe; // 'foto' atau 'tanda-tangan'
    const dir = path.join(__dirname, `../public/uploads/${tipe}`);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `${Date.now()}-${file.fieldname}${ext}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Hanya file PNG, JPG, atau JPEG yang diizinkan!"));
    }
  },
});

//Upload foto profil atau tanda tangan
router.post(
  "/upload/:nik/:tipe",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    try {
      const { nik, tipe } = req.params;

      if (!["foto", "tanda-tangan"].includes(tipe)) {
        return res
          .status(400)
          .json({ error: "Tipe harus foto atau tanda-tangan" });
      }

      const pegawai = await Pegawai.findOne({ where: { NIK: nik } });
      if (!pegawai) {
        return res.status(404).json({ error: "Pegawai tidak ditemukan" });
      }

      // Hapus file lama jika ada
      const oldFileUrl =
        tipe === "foto" ? pegawai.profile_picture : pegawai.tanda_tangan;
      if (oldFileUrl) {
        const oldPath = path.join(
          __dirname,
          "../public/uploads/",
          tipe,
          path.basename(oldFileUrl),
        );
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }

      // Simpan URL baru
      const fileUrl = `http://localhost:3001/uploads/${tipe}/${req.file.filename}`;
      if (tipe === "foto") {
        pegawai.profile_picture = fileUrl;
      } else {
        pegawai.tanda_tangan = fileUrl;
      }

      await pegawai.save();

      res.json({
        success: true,
        message: `${tipe === "foto" ? "Foto profil" : "Tanda tangan"} berhasil diunggah`,
        url: fileUrl,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({
        error: "Terjadi kesalahan saat upload",
        detail: error.message,
      });
    }
  },
);

// Route untuk mendapatkan data kepala sekolah (nama dan NIK saja)
router.get("/kepala-sekolah", async (req, res) => {
  try {
    const kepala = await Pegawai.findOne({
      include: [
        {
          model: Jabatan,
          as: "jabatan",
          where: { nama_jabatan: "Kepala Sekolah" },
          attributes: [],
        },
      ],
      attributes: ["nama", "NIK", "tanda_tangan"],
    });
    if (!kepala) {
      return res.status(404).json({
        success: false,
        message: "Kepala Sekolah tidak ditemukan",
      });
    }
    res.json({
      success: true,
      kepalaSekolah: kepala,
    });
  } catch (error) {
    console.log(error.message);
    console.error("Error fetching kepala sekolah:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data kepala sekolah",
      error: error.message,
    });
  }
});

// mengambil semua data pegawai
router.get("/", authenticateToken, async (req, res) => {
  try {
    const pegawai = await Pegawai.findAll({
      include: [
        {
          model: require("../models").Jabatan,
          as: "jabatan",
          attributes: ["nama_jabatan", "level_disposisi"],
        },
      ],
    });
    res.json(pegawai);
  } catch (error) {
    console.error("Error fetching pegawai:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat mengambil data pegawai",
      error: error.message,
    });
  }
});

// merubah password
router.post("/change-password", authenticateToken, async (req, res) => {
  try {
    // cek pengguna ada atau tidak
    const user = await Pegawai.findOne({
      where: { username: req.user.username },
    });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }
  } catch (error) {}
});

// menambahkan pegawai sekaligus menjadi user
router.post("/", async (req, res) => {
  try {
    const {
      NIK,
      nama,
      jenis_kelamin,
      tempat_lahir,
      tanggal_lahir,
      alamat,
      agama,
      jabatan_id,
      status,
      NRG,
      UKG,
      NUPTK,
      No_induk_yayasan,
      no_HP,
      email,
      role,
    } = req.body;

    // Validasi data yang diperlukan
    if (!NIK || !nama || !email || !role) {
      return res.status(400).json({
        status: "error",
        message: "Data tidak lengkap. NIK, nama, email, dan role harus diisi",
      });
    }

    // Cek apakah email sudah terdaftar
    const existingUser = await Pegawai.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Email sudah terdaftar",
      });
    }

    // Cek apakah NIK sudah terdaftar
    const existingNIK = await Pegawai.findOne({ where: { NIK } });
    if (existingNIK) {
      return res.status(400).json({
        status: "error",
        message: "NIK sudah terdaftar",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(NIK, 10);

    // Buat data pegawai baru
    const newPegawai = await Pegawai.create({
      NIK,
      nama,
      jenis_kelamin,
      tempat_lahir,
      tanggal_lahir,
      alamat,
      agama,
      jabatan_id,
      status: status || "Aktif",
      NRG,
      UKG,
      NUPTK,
      No_induk_yayasan,
      no_HP,
      email,
      password: hashedPassword,
      role,
    });

    // Kirim response sukses
    res.status(201).json({
      status: "success",
      message: "Data pegawai berhasil ditambahkan",
      newPegawai,
    });
  } catch (error) {
    console.error("Error adding employee:", error);
    res.status(500).json({
      status: "error",
      message: "Terjadi kesalahan saat menambahkan data pegawai",
      error: error.message,
    });
  }
});

// mengambil data profile pegawai berdasarkan NIK
router.get("/:NIK", authenticateToken, async (req, res) => {
  try {
    const user = await Pegawai.findOne({ where: { NIK: req.user.NIK } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }

    const pegawai = await Pegawai.findOne({
      where: { NIK: req.params.NIK },
      include: [
        {
          model: require("../models").Jabatan,
          as: "jabatan",
          attributes: ["nama_jabatan", "level_disposisi"],
        },
      ],
    });

    const profileData = {
      NIK: pegawai.NIK,
      role: pegawai.role,
      nama: pegawai.nama,
      jenis_kelamin: pegawai.jenis_kelamin,
      tempat_lahir: pegawai.tempat_lahir,
      tanggal_lahir: pegawai.tanggal_lahir,
      alamat: pegawai.alamat,
      agama: pegawai.agama,
      jabatan_id: pegawai.jabatan_id,
      jabatan: pegawai.jabatan,
      status: pegawai.status,
      NRG: pegawai.NRG,
      UKG: pegawai.UKG,
      NUPTK: pegawai.NUPTK,
      no_HP: pegawai.no_HP,
      email: pegawai.email,
      tanda_tangan: pegawai.tanda_tangan,
      profile_picture: pegawai.profile_picture,
    };

    res.json({
      success: true,
      message: "Profile data retrieved successfully",
      profileData,
    });
  } catch (error) {
    console.error("Error retrieving profile data:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat mengambil data profile",
      error: error.message,
    });
  }
});

// Memperbarui data profile pegawai berdasarkan NIK
router.put("/:NIK", authenticateToken, async (req, res) => {
  try {
    const pegawai = await Pegawai.findOne({
      where: { NIK: req.params.NIK },
    });

    if (!pegawai) {
      return res.status(404).json({
        success: false,
        message: "Data pegawai tidak ditemukan",
      });
    }

    // Update data pegawai
    const updatedData = {
      nama: req.body.nama,
      jenis_kelamin: req.body.jenis_kelamin,
      tempat_lahir: req.body.tempat_lahir,
      tanggal_lahir: req.body.tanggal_lahir,
      alamat: req.body.alamat,
      agama: req.body.agama,
      jabatan_id: req.body.jabatan_id,
      status: req.body.status,
      NRG: req.body.NRG,
      UKG: req.body.UKG,
      NUPTK: req.body.NUPTK,
      No_induk_yayasan: req.body.No_induk_yayasan,
      no_HP: req.body.no_HP,
      email: req.body.email,
      role: req.body.role,
    };

    await pegawai.update(updatedData);

    res.json({
      success: true,
      message: "Profile berhasil diperbarui",
      profileData: pegawai.toJSON(),
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memperbarui profile",
      error: error.message,
    });
  }
});

// menghapus user
router.delete("/:NIK", authenticateToken, async (req, res) => {
  try {
    const pegawai = await Pegawai.findOne({ where: { NIK: req.params.NIK } });

    if (!pegawai) {
      return res.status(404).json({
        success: false,
        message: "Data pegawai tidak ditemukan",
      });
    }

    // Hapus foto profil jika ada
    if (pegawai.profile_picture) {
      const fotoPath = path.join(
        __dirname,
        "../public/uploads/foto",
        path.basename(pegawai.profile_picture),
      );
      if (fs.existsSync(fotoPath)) {
        fs.unlinkSync(fotoPath);
      }
    }

    // Hapus tanda tangan jika ada
    if (pegawai.tanda_tangan) {
      const ttPath = path.join(
        __dirname,
        "../public/uploads/tanda-tangan",
        path.basename(pegawai.tanda_tangan),
      );
      if (fs.existsSync(ttPath)) {
        fs.unlinkSync(ttPath);
      }
    }

    await pegawai.destroy();

    res.json({
      success: true,
      message: "Pegawai dan file terkait berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting pegawai:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat menghapus pegawai",
      error: error.message,
    });
  }
});

module.exports = router;
