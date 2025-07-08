const cron = require('node-cron');
const { Laporan, Murid, SuratKeluar, SuratMasuk } = require('../models');

// Function untuk menghapus laporan yang sudah expired
const cleanupExpiredLaporan = async () => {
  try {
    const currentDate = new Date();
    
    // Hapus laporan yang sudah melewati Expired_Date
    const deletedCount = await Laporan.destroy({
      where: {
        Expired_Date: {
          [require('sequelize').Op.lt]: currentDate
        }
      }
    });

    if (deletedCount > 0) {
      console.log(`[${new Date().toISOString()}] Berhasil menghapus ${deletedCount} laporan yang sudah expired`);
    } else {
      console.log(`[${new Date().toISOString()}] Tidak ada laporan yang perlu dihapus`);
    }
  } catch (error) {
    console.error('Error saat cleanup expired laporan:', error);
  }
};

// Function untuk menghapus data murid yang sudah 7 tahun
const cleanupExpiredMurid = async () => {
  try {
    const currentDate = new Date();
    const sevenYearsAgo = new Date();
    sevenYearsAgo.setFullYear(currentDate.getFullYear() - 7);
    
    // Hapus murid yang sudah 7 tahun (berdasarkan created_at)
    const deletedCount = await Murid.destroy({
      where: {
        [require('sequelize').Op.or]: [
          {
            createdAt: {
              [require('sequelize').Op.lt]: sevenYearsAgo
            }
          }
        ]
      }
    });

    if (deletedCount > 0) {
      console.log(`[${new Date().toISOString()}] Berhasil menghapus ${deletedCount} data murid yang sudah 7 tahun`);
    } else {
      console.log(`[${new Date().toISOString()}] Tidak ada data murid yang perlu dihapus`);
    }
  } catch (error) {
    console.error('Error saat cleanup expired murid:', error);
  }
};

// Function untuk menghapus data surat keluar yang sudah 3 tahun
const cleanupExpiredSuratKeluar = async () => {
  try {
    const currentDate = new Date();
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(currentDate.getFullYear() - 3);
    
    // Hapus surat keluar yang sudah 3 tahun
    const deletedCount = await SuratKeluar.destroy({
      where: {
        [require('sequelize').Op.or]: [
          {
            createdAt: {
              [require('sequelize').Op.lt]: threeYearsAgo
            }
          }
        ]
      }
    });

    if (deletedCount > 0) {
      console.log(`[${new Date().toISOString()}] Berhasil menghapus ${deletedCount} data surat keluar yang sudah 3 tahun`);
    } else {
      console.log(`[${new Date().toISOString()}] Tidak ada data surat keluar yang perlu dihapus`);
    }
  } catch (error) {
    console.error('Error saat cleanup expired surat keluar:', error);
  }
};

// Function untuk menghapus data surat masuk yang sudah 3 tahun
const cleanupExpiredSuratMasuk = async () => {
  try {
    const currentDate = new Date();
    const threeYearsAgo = new Date();
    threeYearsAgo.setFullYear(currentDate.getFullYear() - 3);
    
    // Hapus surat masuk yang sudah 3 tahun
    const deletedCount = await SuratMasuk.destroy({
      where: {
        [require('sequelize').Op.or]: [
          {
            createdAt: {
              [require('sequelize').Op.lt]: threeYearsAgo
            }
          }
        ]
      }
    });

    if (deletedCount > 0) {
      console.log(`[${new Date().toISOString()}] Berhasil menghapus ${deletedCount} data surat masuk yang sudah 3 tahun`);
    } else {
      console.log(`[${new Date().toISOString()}] Tidak ada data surat masuk yang perlu dihapus`);
    }
  } catch (error) {
    console.error('Error saat cleanup expired surat masuk:', error);
  }
};

// Function untuk menjalankan semua cleanup
const runAllCleanup = async () => {
  console.log('Running all cleanup tasks...');
  await cleanupExpiredLaporan();
  await cleanupExpiredMurid();
  await cleanupExpiredSuratKeluar();
  await cleanupExpiredSuratMasuk();
  console.log('All cleanup tasks completed');
};

// Schedule cron job untuk menjalankan cleanup setiap hari jam 00:00
const startCleanupCron = () => {
  console.log('Starting cleanup cron jobs...');
  
  // Jalankan setiap hari jam 00:00
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily cleanup tasks...');
    await runAllCleanup();
  }, {
    scheduled: true,
    timezone: "Asia/Jakarta" // Timezone Indonesia
  });

  // Jalankan sekali saat server start untuk membersihkan data yang sudah expired
  console.log('Running initial cleanup on server start...');
  runAllCleanup();
};

module.exports = {
  cleanupExpiredLaporan,
  cleanupExpiredMurid,
  cleanupExpiredSuratKeluar,
  cleanupExpiredSuratMasuk,
  runAllCleanup,
  startCleanupCron
}; 