module.exports = (sequelize, DataTypes) => {
     const Murid = sequelize.define("Murid", {
       NIS: {
         type: DataTypes.STRING,
         primaryKey: true,
       },
       NISN: {
          type: DataTypes.STRING,
          allowNull: false,
        },
       NIK: {
          type: DataTypes.STRING,
          allowNull: true,
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
       rombel: {
        type: DataTypes.STRING,
        allowNull: false,
       },
       tahun_ajaran: {
        type: DataTypes.STRING,
        allowNull: false,
       },
       status_siswa: {
        type: DataTypes.ENUM("Aktif", "Pindah", "Lulus"),
        allowNull: false,
       },
       status_registrasi: {
          type: DataTypes.ENUM("Siswa Baru", "Pindahan",),
          allowNull: false,
       },
       nama_ayah: {
        type: DataTypes.STRING,
        allowNull: false,
       },
       nama_ibu: {
        type: DataTypes.STRING,
        allowNull: false,
       },
       pekerjaan_ayah: {
        type: DataTypes.STRING,
        allowNull: true,
       },
       pekerjaan_ibu: {
        type: DataTypes.STRING,
        allowNull: true,
       }, 
       no_hp_ayah: {
        type: DataTypes.STRING,
        allowNull: true,
       },
       no_hp_ibu: {
        type: DataTypes.STRING,
        allowNull: true,
       },
     });
     return Murid;
   };