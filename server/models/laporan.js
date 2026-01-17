module.exports = (sequelize, DataTypes) => {
     const Laporan = sequelize.define("Laporan", {
       id_laporan: {
         type: DataTypes.STRING,
         primaryKey: true,
         allowNull: false,
       },
       mulai_tanggal: {
         type: DataTypes.DATE,
         allowNull: false,
       },
       sampai_tanggal: {
         type: DataTypes.DATE,
         allowNull: false,
       },
       jenis_laporan: {
         type: DataTypes.ENUM("Surat Masuk", "Surat Keluar", "Disposisi"),
         allowNull: true,
       },
       Judul: {
          type: DataTypes.STRING,
          allowNull: false,
       },
       Expired_Date:{
          type: DataTypes.DATE,
          allowNull: false,
       }
     });
     return Laporan;
   };
   