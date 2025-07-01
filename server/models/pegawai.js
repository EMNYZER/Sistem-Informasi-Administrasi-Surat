module.exports = (sequelize, DataTypes) => {
  const Pegawai = sequelize.define("Pegawai", {
    NIK: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
    },
    nama: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jenis_kelamin: {
      type: DataTypes.ENUM("Laki-laki", "Perempuan"),
      allowNull: false,
    },
    tempat_lahir: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    tanggal_lahir: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    alamat: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    agama: {
      type: DataTypes.ENUM(
        "Islam",
        "Kristen",
        "Katolik",
        "Hindu",
        "Budha",
        "Konghucu",
      ),
      allowNull: false,
    },
    jabatan_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("Aktif", "Tidak Aktif"),
      allowNull: false,
    },
    NRG: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    No_induk_yayasan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    UKG: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    NUPTK: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    tanda_tangan: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    no_HP: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM("Admin", "User", "Approval"),
      allowNull: false,
    },
    profile_picture: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  });

  // relasi dengan jabatan
  Pegawai.associate = (models) => {
    Pegawai.belongsTo(models.Jabatan, {
      foreignKey: "jabatan_id",
      as: "jabatan",
    });
    Pegawai.belongsToMany(models.Disposisi, {
      through: "DisposisiPegawai",
      foreignKey: "NIK",
      otherKey: "id_disposisi",
      as: "disposisi"
    });
  };

  return Pegawai;
};
