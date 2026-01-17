require('dotenv').config();
const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middleware/auth");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { Pegawai, Jabatan } = require("../models");
const bcrypt = require("bcryptjs");
const XLSX = require("xlsx");

const BACKEND_API_URL = process.env.REACT_APP_BACKEND_API_URL;


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
    // Allow Excel files for import, images for upload
    const allowedImageTypes = ["image/png", "image/jpg", "image/jpeg"];
    const allowedExcelTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel"
    ];
    // If the route is /user/import, allow Excel
    if (req.originalUrl.includes("/user/import")) {
      if (allowedExcelTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Hanya file Excel (.xlsx/.xls) yang diizinkan untuk import!"));
      }
    } else {
      // Default: only allow images
      if (allowedImageTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error("Hanya file PNG, JPG, atau JPEG yang diizinkan!"));
      }
    }
  },
});

//Upload foto profil atau tanda tangan
router.post("/upload/:nik/:tipe", authenticateToken, upload.single("image"), async (req, res) => {
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
      const fileUrl = `${BACKEND_API_URL}/uploads/${tipe}/${req.file.filename}`;
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
      attributes: ["nama", "NIK", "tanda_tangan", "No_induk_yayasan"],
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

// Cari pegawai berdasarkan nama/NIK (untuk autocomplete)
router.get("/search/cari", authenticateToken, async (req, res) => {
  const q = req.query.q || "";
  try {
    const pegawai = await Pegawai.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { nama: { [require('sequelize').Op.like]: `%${q}%` } },
          { NIK: { [require('sequelize').Op.like]: `%${q}%` } }
        ]
      },
      include: [{
        model: Jabatan,
        as: "jabatan",
        attributes: ["nama_jabatan", "level_disposisi"]
      }],
      limit: 10
    });
    res.json(pegawai);
  } catch (error) {
    res.status(500).json({ error: "Gagal mencari pegawai" });
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

// merubah password
router.post("/change-password/:nik", authenticateToken, async (req, res) => {
  try {
    const { nik } = req.params;
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Password lama dan baru harus diisi",
      });
    }
    const pegawai = await Pegawai.findOne({ where: { NIK: nik } });
    if (!pegawai) {
      return res.status(404).json({
        success: false,
        message: "User tidak ditemukan",
      });
    }
    // Cek password lama
    const isMatch = await bcrypt.compare(oldPassword, pegawai.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Password lama salah",
      });
    }
    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    pegawai.password = hashedPassword;
    await pegawai.save();
    res.json({
      success: true,
      message: "Password berhasil diperbarui",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      message: "Terjadi kesalahan saat memperbarui password",
      error: error.message,
    });
  }
});

// Helper function to validate if field is empty or only whitespace
const validateRequiredField = (value, fieldName) => {
  // Handle string fields
  if (typeof value === 'string' && (!value || value.trim() === '')) {
    return `Please fill up this field`;
  }
  // Handle non-string fields (like numbers, dates, etc.)
  if (value === null || value === undefined || value === '') {
    return `Please fill up this field`;
  }
  return null;
};

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

    // Validasi field required - check for empty or whitespace only
    const validationErrors = {};
    
    const requiredFields = {
      NIK: 'NIK',
      nama: 'Nama',
      tempat_lahir: 'Tempat Lahir',
      tanggal_lahir: 'Tanggal Lahir',
      jenis_kelamin: 'Jenis Kelamin',
      agama: 'Agama',
      no_HP: 'No. HP',
      email: 'Email',
      alamat: 'Alamat',
      jabatan_id: 'Jabatan',
      role: 'Role',
      status: 'Status'
    };

    Object.keys(requiredFields).forEach((field) => {
      const error = validateRequiredField(req.body[field], requiredFields[field]);
      if (error) {
        validationErrors[field] = error;
      }
    });

    // Validate email format
    if (email && email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        validationErrors.email = 'Format email tidak valid';
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Validasi gagal",
        errors: validationErrors,
      });
    }

    // Trim all string values before processing
    const trimmedEmail = email ? email.trim() : email;
    const trimmedNIK = NIK ? NIK.trim() : NIK;

    // Cek apakah email sudah terdaftar
    const existingUser = await Pegawai.findOne({ where: { email: trimmedEmail } });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Email sudah terdaftar",
      });
    }

    // Cek apakah NIK sudah terdaftar
    const existingNIK = await Pegawai.findOne({ where: { NIK: trimmedNIK } });
    if (existingNIK) {
      return res.status(400).json({
        status: "error",
        message: "NIK sudah terdaftar",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(trimmedNIK, 10);

    // Buat data pegawai baru dengan trimmed values
    const newPegawai = await Pegawai.create({
      NIK: trimmedNIK,
      nama: nama ? nama.trim() : nama,
      jenis_kelamin: jenis_kelamin ? jenis_kelamin.trim() : jenis_kelamin,
      tempat_lahir: tempat_lahir ? tempat_lahir.trim() : tempat_lahir,
      tanggal_lahir,
      alamat: alamat ? alamat.trim() : alamat,
      agama: agama ? agama.trim() : agama,
      jabatan_id,
      status: status ? status.trim() : (status || "Aktif"),
      NRG: NRG ? NRG.trim() : NRG,
      UKG: UKG ? UKG.trim() : UKG,
      NUPTK: NUPTK ? NUPTK.trim() : NUPTK,
      No_induk_yayasan: No_induk_yayasan ? No_induk_yayasan.trim() : No_induk_yayasan,
      no_HP: no_HP ? no_HP.trim() : no_HP,
      email: trimmedEmail,
      password: hashedPassword,
      role: role ? role.trim() : role,
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

// Import Data Pegawai by xlsx
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
      'NIK', 'nama', 'jenis_kelamin', 'tempat_lahir', 'tanggal_lahir', 
      'alamat', 'agama', 'jabatan_id', 'status', 'NRG', 'UKG', 'NUPTK', 
      'No_induk_yayasan', 'no_HP', 'email', 'role'
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
    const pegawaiData = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2; // +2 karena baris 1 adalah header dan index dimulai dari 0
      const rowErrors = [];

      // Validasi field required
      const requiredFields = {
        'NIK': 'NIK',
        'nama': 'Nama',
        'jenis_kelamin': 'Jenis Kelamin',
        'tempat_lahir': 'Tempat Lahir',
        'tanggal_lahir': 'Tanggal Lahir',
        'agama': 'Agama',
        'no_HP': 'No. HP',
        'email': 'Email',
        'alamat': 'Alamat',
        'jabatan_id': 'Jabatan ID'
      };

      Object.keys(requiredFields).forEach(field => {
        const value = row[field];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          rowErrors.push(`${requiredFields[field]} harus diisi`);
        }
      });

      // Validasi format email
      if (row.email && row.email.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(String(row.email).trim())) {
          rowErrors.push('Format email tidak valid');
        }
      }

      if (rowErrors.length > 0) {
        validationErrors.push({
          row: rowNumber,
          errors: rowErrors
        });
      } else {
        // Hash password for each row (NIK as default password)
        pegawaiData.push({
          NIK: String(row.NIK).trim(),
          nama: String(row.nama).trim(),
          jenis_kelamin: String(row.jenis_kelamin).trim(),
          tempat_lahir: String(row.tempat_lahir).trim(),
          tanggal_lahir: row.tanggal_lahir,
          alamat: row.alamat ? String(row.alamat).trim() : null,
          agama: String(row.agama).trim(),
          jabatan_id: row.jabatan_id ? parseInt(row.jabatan_id) : null,
          status: row.status ? String(row.status).trim() : "Aktif",
          NRG: row.NRG ? String(row.NRG).trim() : null,
          UKG: row.UKG ? String(row.UKG).trim() : null,
          NUPTK: row.NUPTK ? String(row.NUPTK).trim() : null,
          No_induk_yayasan: row.No_induk_yayasan ? String(row.No_induk_yayasan).trim() : null,
          no_HP: String(row.no_HP).trim(),
          email: String(row.email).trim(),
          role: row.role ? String(row.role).trim() : "User",
          password: row.NIK ? await bcrypt.hash(String(row.NIK).trim(), 10) : undefined,
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

    if (pegawaiData.length === 0) {
      return res.status(400).json({ 
        message: "Tidak ada data yang valid untuk diimport." 
      });
    }

    // Bulk insert, ignore duplicates by NIK or email
    await Pegawai.bulkCreate(pegawaiData, { ignoreDuplicates: true });

    // Cleanup file setelah selesai
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    res.json({ 
      message: `Import data pegawai berhasil. ${pegawaiData.length} data berhasil diimport.`,
      imported: pegawaiData.length
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

    // Validasi field required - check for empty or whitespace only
    const validationErrors = {};
    
    const requiredFields = {
      nama: 'Nama',
      tempat_lahir: 'Tempat Lahir',
      tanggal_lahir: 'Tanggal Lahir',
      jenis_kelamin: 'Jenis Kelamin',
      agama: 'Agama',
      no_HP: 'No. HP',
      email: 'Email',
      alamat: 'Alamat',
      jabatan_id: 'Jabatan',
      role: 'Role',
      status: 'Status'
    };

    Object.keys(requiredFields).forEach((field) => {
      const error = validateRequiredField(req.body[field], requiredFields[field]);
      if (error) {
        validationErrors[field] = error;
      }
    });

    // Validate email format
    if (req.body.email && req.body.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(req.body.email.trim())) {
        validationErrors.email = 'Format email tidak valid';
      }
    }

    if (Object.keys(validationErrors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Gagal Memperbarui Profile",
        errors: validationErrors,
      });
    }

    // Trim all string values before updating
    const updatedData = {
      nama: req.body.nama ? req.body.nama.trim() : req.body.nama,
      jenis_kelamin: req.body.jenis_kelamin ? req.body.jenis_kelamin.trim() : req.body.jenis_kelamin,
      tempat_lahir: req.body.tempat_lahir ? req.body.tempat_lahir.trim() : req.body.tempat_lahir,
      tanggal_lahir: req.body.tanggal_lahir,
      alamat: req.body.alamat ? req.body.alamat.trim() : req.body.alamat,
      agama: req.body.agama ? req.body.agama.trim() : req.body.agama,
      jabatan_id: req.body.jabatan_id,
      status: req.body.status ? req.body.status.trim() : req.body.status,
      NRG: req.body.NRG ? req.body.NRG.trim() : req.body.NRG,
      UKG: req.body.UKG ? req.body.UKG.trim() : req.body.UKG,
      NUPTK: req.body.NUPTK ? req.body.NUPTK.trim() : req.body.NUPTK,
      No_induk_yayasan: req.body.No_induk_yayasan ? req.body.No_induk_yayasan.trim() : req.body.No_induk_yayasan,
      no_HP: req.body.no_HP ? req.body.no_HP.trim() : req.body.no_HP,
      email: req.body.email ? req.body.email.trim() : req.body.email,
      role: req.body.role ? req.body.role.trim() : req.body.role,
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
