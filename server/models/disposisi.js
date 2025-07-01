module.exports = (sequelize, DataTypes) => {
     const Disposisi = sequelize.define("Disposisi", {
       id_disposisi: {
         type: DataTypes.STRING,
         primaryKey: true,
         allowNull: false,
       },
       tanggal_disposisi: {
          type: DataTypes.DATE,
          allowNull: false,
       },
       sifat: {
          type: DataTypes.ENUM("Biasa", "Segera", "Sangat Segera"),
          allowNull: false,
       },
       isi_disposisi:{
         type: DataTypes.TEXT,
         allowNull: false,
       },
       jabatan_penerima: {
         type: DataTypes.STRING,
         allowNull: false,
       },
       id_surat: {
         type: DataTypes.STRING,
         allowNull: true,
       },
       catatan: {
          type: DataTypes.STRING,
          allowNull: true,
       },
     });

     Disposisi.associate = (models) => {
          Disposisi.belongsTo(models.SuratMasuk, {
            foreignKey: "id_surat",
            as: "suratMasuk",
          });
          Disposisi.belongsToMany(models.Pegawai, {
               through: "DisposisiPegawai",
               foreignKey: "id_disposisi",
               otherKey: "NIK",
               as: "penerima"
          });
     };
   
     return Disposisi;
   };