const express = require('express');
const router = express.Router();
const { Pegawai } = require('../models');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

router.post('/', async (req, res) => {
    try {
        const { NIK, password } = req.body;
        
        // Cari user berdasarkan NIK
        const user = await Pegawai.findOne({ where: { NIK } });
        if (!user) {
            return res.status(401).json({ 
                status: 'error',
                message: 'NIK atau password salah' 
            });
        }
        // Verifikasi password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                status: 'error',
                message: 'NIK atau password salah' 
            });
        }
        
        // Generate token
        const token = jwt.sign(
            { 
                NIK: user.NIK,
                role: user.role 
            }, 
            'secret',
            { expiresIn: '24h' }
        );
        
        // Kirim response
        res.json({ 
            status: 'success',
            message: 'Login berhasil',
            token: token,
            user: {
                NIK: user.NIK,
                nama: user.nama,
                role: user.role,
                profile_picture: user.profile_picture
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            status: 'error',
            message: 'Terjadi kesalahan pada server',
            error: error.message
        });
    }
});

module.exports = router;