module.exports = (sequelize, DataTypes) => {
  const Template = sequelize.define("Template", {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    kode_kategori: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    perihal: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deskripsi: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isi_surat: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  });

  Template.associate = (models) => {
    Template.belongsTo(models.KategoriSuratKeluar, {
      foreignKey: "kode_kategori",
      as: "kategori",
    });
  };

  return Template;
};
