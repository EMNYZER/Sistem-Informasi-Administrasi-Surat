module.exports = (sequelize, DataTypes) => {
     const DisposisiPegawai = sequelize.define("DisposisiPegawai", {
       id: {
         type: DataTypes.INTEGER,
         primaryKey: true,
         autoIncrement: true,
       },
       id_disposisi: {
         type: DataTypes.STRING,
         allowNull: false,
       },
       NIK: {
         type: DataTypes.STRING,
         allowNull: false,
       },
     });
     
     DisposisiPegawai.associate = (models) => {
       DisposisiPegawai.belongsTo(models.Disposisi, {
         foreignKey: "id_disposisi",
         as: "disposisi",
       });
       DisposisiPegawai.belongsTo(models.Pegawai, {
         foreignKey: "NIK",
         as: "pegawai",
       });
     };
     return DisposisiPegawai;
   };