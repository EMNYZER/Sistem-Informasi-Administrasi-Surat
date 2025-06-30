module.exports = (sequelize, DataTypes) => {
  const KategoriSuratKeluar = sequelize.define("KategoriSuratKeluar", {
    kode_kategori: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    nama_kategori: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deskripsi: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  return KategoriSuratKeluar;
};
