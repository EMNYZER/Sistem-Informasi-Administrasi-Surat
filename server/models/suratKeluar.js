module.exports = (sequelize, DataTypes) => {
  const SuratKeluar = sequelize.define("SuratKeluar", {
    id_surat: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    nomor_urut_surat: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    nomor_surat: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kode_kategori: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    perihal: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sifat: {
      type: DataTypes.ENUM("Biasa", "Segera", "Sangat Segera", "Rahasia"),
      allowNull: false,
    },
    lampiran: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    lampiran_file: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    kepada: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tujuan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tanggal_surat: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isi_surat: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM(
        "draft",
        "diajukan",
        "diproses",
        "ditolak",
        "revisi",
        "disetujui",
      ),
      allowNull: false,
    },
    catatan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    NIK: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    QR_code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });
  SuratKeluar.associate = (models) => {
    SuratKeluar.belongsTo(models.KategoriSuratKeluar, {
      foreignKey: "kode_kategori",
      as: "kategori",
    });
    SuratKeluar.belongsTo(models.Pegawai, {
      foreignKey: "NIK",
      as: "pegawai",
    });
  };

  return SuratKeluar;
};
