module.exports = (sequelize, DataTypes) => {
  const SuratMasuk = sequelize.define("SuratMasuk", {
    id_surat: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    nomor_agenda: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nomor_surat: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tanggal_surat: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    tanggal_terima: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    asal: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    perihal: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    lampiran: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status_disposisi: {
      type: DataTypes.ENUM("Belum", "Revisi", "disposisi", "Selesai"),
      allowNull: false,
    },
    status_surat: {
      type: DataTypes.ENUM("Asli", "Tembusan"),
      allowNull: false,
    },
    sifat: {
      type: DataTypes.ENUM("Biasa", "Segera", "Sangat Segera", "Rahasia"),
      allowNull: false,
    },
    file_surat: {
      type: DataTypes.STRING,
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
  });

  SuratMasuk.associate = (models) => {
    SuratMasuk.belongsTo(models.Pegawai, {
      foreignKey: "NIK",
      as: "pegawai",
    });
  };

  return SuratMasuk;
};
