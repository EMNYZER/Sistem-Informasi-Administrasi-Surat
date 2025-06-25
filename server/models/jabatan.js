module.exports = (sequelize, DataTypes) => {
     const Jabatan = sequelize.define('Jabatan', {
          jabatan_id: {
               type: DataTypes.INTEGER,
               primaryKey: true,
               autoIncrement: true,
               allowNull: false
          },
          nama_jabatan: {
               type: DataTypes.STRING,
               allowNull: false
          },
          deskripsi:{
               type: DataTypes.STRING,
               allowNull: true
          }
     })
 
     return Jabatan
}