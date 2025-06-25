const express = require("express");
const cors = require('cors');
const db = require("./models");

const app = express()
app.use(express.urlencoded({ extended: true }));
app.use(express.json())
app.use(cors())


//Routers
const login = require("./routes/login")
app.use("/login", login)
const user = require("./routes/User")
app.use("/user", user)
const jabatan = require("./routes/jabatan")
app.use("/jabatan", jabatan)
const kategori = require("./routes/kategori")
app.use("/kategori", kategori)
const suratKeluar = require("./routes/suratKeluar")
app.use("/suratKeluar", suratKeluar)
const template = require("./routes/template")
app.use("/template", template)



const PORT = process.env.PORT || 3001
db.sequelize.sync().then(() => {
          app.use('/uploads', express.static('public/uploads'));
          app.use('/qrcodes', express.static('public/qrcodes'));
          app.listen(PORT, () => console.log(`server running on ${PORT}`))
     })
