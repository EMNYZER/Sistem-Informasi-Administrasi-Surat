const express = require("express");
const cors = require("cors");
const db = require("./models");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

//Routers
const login = require("./routes/login");
app.use("/login", login);
const user = require("./routes/User");
app.use("/user", user);
const murid = require("./routes/murid");
app.use("/murid", murid);
const jabatan = require("./routes/jabatan");
app.use("/jabatan", jabatan);
const kategori = require("./routes/kategori");
app.use("/kategori", kategori);
const suratKeluar = require("./routes/suratKeluar");
app.use("/suratKeluar", suratKeluar);
const suratMasuk = require("./routes/suratMasuk");
app.use("/suratMasuk", suratMasuk);
const template = require("./routes/template");
app.use("/template", template);
const disposisi = require("./routes/disposisi");
app.use("/disposisi", disposisi);

const PORT = process.env.PORT || 3001;
db.sequelize.sync().then(() => {
  app.use("/uploads", express.static("public/uploads"));
  app.use("/qrcodes", express.static("public/qrcodes"));

  app.get("/view-pdf/:filename", (req, res) => {
    const fileName = req.params.filename;
    const filePath = path.join(__dirname, "public/uploads/surat-masuk", fileName);
  
    if (!fs.existsSync(filePath)) {
      return res.status(404).send("File tidak ditemukan");
    }
  
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "inline; filename=" + fileName);
    res.sendFile(filePath);
  });

  app.listen(PORT, () => console.log(`server running on ${PORT}`));
});
