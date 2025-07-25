const express = require('express')
const app = express()
const bcrypt = require('bcrypt');
const port = 3000
var jwt = require('jsonwebtoken');
const NodeRSA = require('node-rsa');
const { check, validationResult } = require('express-validator');
const sequelize = require('./model');
const ListSiswa = require('./model/listsiswa.model');
const Absensi = require('./model/absensi.model');
const TahunAjar = require('./model/tahunajar.model');
const { hash } = require('crypto');
const { Op } = require('sequelize');
const { QueryTypes } = require('sequelize');
const PesanWA = require('./model/pesanwa.model');


// const bodyParser = require("body-parser");

// // Tambahkan batas besar request body
// app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
// app.use(bodyParser.json({ limit: '10mb' }))
/*
- STATUS ABSEN:
0 = ALPHA
1 = HADIR
2 = IZIN
- KIRIM RUBAH ABSEN DALAM BENTUK {nisn}#{status}#{keterangan} (keterangan jika ijin jika tidak ada tidak perlu dikirim)
*/
function gettanggal(format) {
    var now = new Date();
    var year = now.getFullYear();
    var month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    var day = String(now.getDate()).padStart(2, '0');
    var hours = String(now.getHours()).padStart(2, '0');
    var minutes = String(now.getMinutes()).padStart(2, '0');
    var seconds = String(now.getSeconds()).padStart(2, '0');
    if (format == 1) {
        return `${year}-${month}-${day}`
    } else if (format == 2) {
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    } else if (format == 3) {
        return year;
    }
}
app.use(express.json({ limit: '100mb' })); // atau lebih besar jika perlu
app.use(express.urlencoded({ extended: true, limit: '100mb' }));
app.get('/', async (req, res) => {
    const hashedPassword = await bcrypt.hash("smpn3warudarjo", 10);
    return res.send(hashedPassword)
})
async function generateabsen() {
    //untuk cek dan generate list absen buat hari tersebut

    var cekdata = await Absensi.findAll({
        where: {
            untuktanggal: gettanggal(1)
        }
    })
    if (cekdata.length == 0) {
        var ambillistsiswa = await ListSiswa.findAll()
        var getlast = await TahunAjar.findOne({
            order: [['tahun', 'DESC']]
        })
        for (const iterator of ambillistsiswa) {
            await Absensi.create({
                nisn: iterator["nisn"],
                nama: iterator["nama"],
                kelas: iterator["kelas"],
                tahunpelajaran:getlast.tahun,
                status: 0,
                untuktanggal: gettanggal(1)
            })
        }
    }
}
app.get("/generateabsen",(req,res)=>{
    generateabsen()
    return res.status(200).send("success")
})
app.post("/login", [
    check('username')
        .notEmpty().withMessage('Username is required'),
    check('password')
        .notEmpty().withMessage('Password is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({
            success: 0,
            data: "Error Input"
        })
    }
    const { username, password } = req.body
    if (username == "admin") {
        const isMatch = await bcrypt.compare(password, "$2b$10$HkBfbCUSINx.OmIzSrgtxucCR4fj.PBp8tiYsIBLDtAftT2mDL4va");
        if (isMatch) {
            const jwt = require('jsonwebtoken');
            const token = jwt.sign(
                {
                    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // 1 day expiration
                    data: 'adminlogin'
                },
                'sistemabsensi'
            );
            generateabsen()
            return res.status(200).send({
                success: 1,
                data: token
            })
        } else {
            return res.status(400).send({
                success: 0,
                data: "Invalid Credentials"
            })
        }
    } else {
        return res.status(400).send({
            success: 0,
            data: "Invalid Credentials"
        })
    }
})
app.post("/absen", [
    check('login')
        .notEmpty().withMessage('Login is required'),
    check('data')
        .notEmpty().withMessage('Data is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({
            success: 0,
            data: "Error Input"
        })
    }
    const { login, data } = req.body
    try {
        jwt.verify(login, "sistemabsensi");
    } catch (error) {
        return res.status(400).send({
            success: 0,
            data: "Invalid Token"
        })
    }
    var datamuride = await Absensi.findOne(
        {
            where: {
                nisn: data,
                untuktanggal: gettanggal(1)
            }
        }
    );
    if (datamuride) {
        datamuride.status = 1
        datamuride.timestamp = gettanggal(2);
        await datamuride.save()
        return res.status(200).send({
            success: 1,
            data: "Berhasil Absen"
        })
    } else {
        return res.status(400).send({
            success: 0,
            data: "NISN Tidak Ditemukan"
        })
    }
})
app.post("/ubahabsen", [
    check('login')
        .notEmpty().withMessage('Login is required'),
    check('data')
        .notEmpty().withMessage('Data is required'),
], async (req, res) => {
    function formatDate(date) {
        const pad = (n) => n.toString().padStart(2, '0');
        
        const year = date.getFullYear();
        const month = pad(date.getMonth() + 1); // Months are zero-based
        const day = pad(date.getDate());
        const hours = pad(date.getHours());
        const minutes = pad(date.getMinutes());
        const seconds = pad(date.getSeconds());
        
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({
            success: 0,
            data: "Error Input"
        })
    }
    const { login, data } = req.body
    try {
        jwt.verify(login, "sistemabsensi");
    } catch (error) {
        return res.status(400).send({
            success: 0,
            data: "Invalid Token"
        })
    }
    var dataparse = data.split("#")
    var datamuride = await Absensi.findOne(
        {
            where: {
                nisn: dataparse[0],
                untuktanggal: gettanggal(1)
            }
        }
    );
    if (dataparse[1] == 2 && dataparse[2] == "") {
        return res.status(400).send({
            success: 0,
            data: "Keterangan tidak boleh kosong!"
        })
    } else {
        datamuride.status = dataparse[1]
        if(dataparse[1] == 1){
            const now = new Date();
            datamuride.timestamp = formatDate(now)
        }
        if (dataparse[1] == 2) {
            console.log("yow")
            datamuride.keterangan = dataparse[2]
        } else {
            datamuride.keterangan = null
        }
        await datamuride.save()
        return res.status(200).send({
            success: 1,
            data: "Berhasil Ubah Kehadiran"
        })
    }
})
app.get("/listabsenhariini", [
    check('login')
        .notEmpty().withMessage('Login is required'),
    check('data')
        .notEmpty().withMessage('Data is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({
            success: 0,
            data: "Error Input"
        })
    }
    const { login } = req.body
    try {
        jwt.verify(login, "sistemabsensi");
    } catch (error) {
        return res.status(400).send({
            success: 0,
            data: "Invalid Token"
        })
    }
    var dataabsenhariini = await Absensi.findAll(
        {
            where: {
                untuktanggal: gettanggal(1)
            }
        }
    );
    return res.status(200).send(dataabsenhariini)
})
app.post("/backupkelas9", [
    check('login')
        .notEmpty().withMessage('Login is required'),
    check('data')
        .notEmpty().withMessage('Data is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({
            success: 0,
            data: "Error Input"
        })
    }
    const { login, data } = req.body
    try {
        jwt.verify(login, "sistemabsensi");
    } catch (error) {
        return res.status(400).send({
            success: 0,
            data: "Invalid Token"
        })
    }
    var getlast = await TahunAjar.findOne({
        order: [['tahun', 'DESC']]
    })
    if (data == "get_backup_data") {
        var list_kelas9 = await ListSiswa.findAll({
            where: {
                kelas: {
                    [Op.like]: "9%"
                }
            }
        })
        var data_kehadiran = []
        for (const iterator of list_kelas9) {
            console.log(iterator.nisn)
            var list_kehadiran = await Absensi.findAll({
                where: {
                    nisn: iterator.nisn
                }
            })
            alpha = 0
            hadir = 0
            izin = 0
            for (const iteratorr of list_kehadiran) {
                if (iteratorr.status == 0) {
                    alpha++
                } else if (iteratorr.status == 1) {
                    hadir++
                } else {
                    izin++
                }
            }
            data_kehadiran.push({
                nama: iterator.nama,
                kelas: iterator.kelas,
                alpha: alpha,
                hadir: hadir,
                izin: izin
            })
        }
        return res.status(200).send({
            success: 1,
            data: {
                tahunajar: getlast.tahun,
                list: data_kehadiran
            }
        })
    } else {
        return res.status(400).send({
            success: 0,
            data: "Invalid Data"
        })
    }
})
app.get("/getpesanwa",[
    check('login')
        .notEmpty().withMessage('Login is required'),
],async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({
            success: 0,
            data: "Error Input"
        })
    }
    const { login } = req.body
    try {
        jwt.verify(login, "sistemabsensi");
    } catch (error) {
        return res.status(400).send({
            success: 0,
            data: "Invalid Token"
        })
    }
    var ambilpesan = await PesanWA.findAll()
    return res.status(200).send({
        success: 1,
        data: ambilpesan
    })
})
app.post("/simpanpesanwa",[
    check('login')
        .notEmpty().withMessage('Login is required'),
    check('data')
        .notEmpty().withMessage('Data is required'),
],async(req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({
            success: 0,
            data: "Error Input"
        })
    }
    const { login,data } = req.body
    try {
        jwt.verify(login, "sistemabsensi");
    } catch (error) {
        return res.status(400).send({
            success: 0,
            data: "Invalid Token"
        })
    }
    datasimpan = JSON.parse(atob(data))
    for (const iterator of datasimpan) {
        var ambildatae = await PesanWA.findOne(
            {
                where: {
                    id:iterator.id
                }
            }
        )
        ambildatae.isi = iterator.isi
        ambildatae.save()
    }
    return res.status(200).send({
        success: 1
    })
})
app.post("/insertlistsiswa", [
    check('login')
        .notEmpty().withMessage('Login is required'),
    check('data')
        .notEmpty().withMessage('Data is required'),
], async (req, res) => {
    console.log("✅ POST /insertlistsiswa diterima");
    console.log("Body:", req.body);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({
            success: 0,
            data: "Error Input"
        })
    }
    const { login, data } = req.body
    try {
        jwt.verify(login, "sistemabsensi");
    } catch (error) {
        return res.status(400).send({
            success: 0,
            data: "Invalid Token"
        })
    }
    data2 = data.split("#")
    if (data2[0] == "go_insert_siswa") {
        var getlast = await TahunAjar.findOne({
            order: [['tahun', 'DESC']]
        })
        if (getlast.tahun == gettanggal(3)) {
            return res.status(400).send({
                success: 0,
                data: "err_belum_saatnya"
            })
        } else if (getlast.tahun < gettanggal(3)) {
            return res.status(400).send({
                success: 0,
                data: "err_tahunajar"
            })
        }
    } else if (data2[0] == "goinsertsiswaforce") {
        console.log("➡️ goinsertsiswaforce dijalankan", new Date().toLocaleTimeString());
        try {
            // await ListSiswa.truncate();
            await ListSiswa.destroy({ where: {}, truncate: true });

            console.log("⬇️ Decoding Base64...");
            listsiswa = JSON.parse(atob(data2[1]));
            console.log("✅ Decoded listsiswa:", listsiswa.length, "data");

            const siswaData = listsiswa.map(siswa => ({
                nisn: siswa.nisn,
                nama: siswa.nama,
                no_ortu: siswa.no_ortu,
                no_walas: siswa.no_walas,
                kelas: siswa.kelas.toString().replace("-","")
            }));

            await ListSiswa.bulkCreate(siswaData);
            console.log("✅ ListSiswa inserted", new Date().toLocaleTimeString());

            await Absensi.destroy({
                where: {
                    untuktanggal: gettanggal(1)
                }
            });

            const getlast = await TahunAjar.findOne({ order: [['tahun', 'DESC']] });

            const absensiData = listsiswa.map(siswa => ({
                nisn: siswa.nisn,
                nama: siswa.nama,
                kelas: siswa.kelas.toString().replace("-",""),
                tahunpelajaran: getlast.tahun,
                status: 0,
                untuktanggal: gettanggal(1)
            }));

            await Absensi.bulkCreate(absensiData);
            console.log("✅ Absensi updated", new Date().toLocaleTimeString());

            return res.status(200).send({
                success: 1,
                data: "Berhasil menambahkan siswa"
            });
        } catch (err) {
            console.error("❌ Gagal insert paksa:", err);
            return res.status(400).send({
                success: 0,
                data: "Error menambahkan siswa"
            });
        }
    }
    else if (data2[0] == "tambahtahunajar") {
        console.log("➡️ tambahtahunajar dijalankan");

        const getlast = await TahunAjar.findOne({ order: [['tahun', 'DESC']] });
        if (getlast && getlast.tahun == gettanggal(3)) {
            return res.status(400).send({
                success: 0,
                data: "Belum saatnya tambah tahun pelajaran baru"
            });
        }

        const currentYear = new Date().getFullYear();
        await TahunAjar.create({ tahun: currentYear });

        try {
            await ListSiswa.truncate();

            // const listsiswa = JSON.parse(atob(data2[1]));
            console.log("⬇️ Decoding Base64...");
            listsiswa = JSON.parse(atob(data2[1]));
            console.log("✅ Decoded listsiswa:", listsiswa.length, "data");


            const siswaData = listsiswa.map(siswa => ({
                nisn: siswa.nisn,
                nama: siswa.nama,
                no_ortu: siswa.no_ortu,
                no_walas: siswa.no_walas,
                kelas: siswa.kelas.toString().replace("-","")
            }));
            await ListSiswa.bulkCreate(siswaData);

            await Absensi.destroy({
                where: {
                    untuktanggal: gettanggal(1)
                }
            });

            const absensiData = listsiswa.map(siswa => ({
                nisn: siswa.nisn,
                nama: siswa.nama,
                kelas: siswa.kelas.toString().replace("-",""),
                tahunpelajaran: currentYear,
                status: 0,
                untuktanggal: gettanggal(1)
            }));
            await Absensi.bulkCreate(absensiData);

            return res.status(200).send({
                success: 1,
                data: "Berhasil menambahkan siswa"
            });

        } catch (err) {
            console.error("❌ Gagal saat tambah tahun ajar:", err);
            await TahunAjar.destroy({ where: { tahun: currentYear } });

            return res.status(400).send({
                success: 0,
                data: "Error menambahkan siswa"
            });
        }
    }
    else {
        return res.status(400).send({
            success: 0,
            data: "Invalid Data"
        })
    }
})
app.get("/laporan", [
    check('login')
        .notEmpty().withMessage('Login is required'),
    check('data')
        .notEmpty().withMessage('Data is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({
            success: 0,
            data: "Error Input"
        })
    }
    const { login, data } = req.body
    try {
        jwt.verify(login, "sistemabsensi");
    } catch (error) {
        return res.status(400).send({
            success: 0,
            data: "Invalid Token"
        })
    }
    if (data == 1) {
        //untuk by minggu
        var d = new Date()
        var mulaicari = new Date()
        if (d.getDay() == 0) {
            mulaicari.setDate(d.getDate() - 6)
        } else {
            mulaicari.setDate(d.getDate() - d.getDay() + 1)
        }
        var year = mulaicari.getFullYear();
        var month = String(mulaicari.getMonth() + 1).padStart(2, '0');
        var day = String(mulaicari.getDate()).padStart(2, '0');
        stringmulaicari = `${year}/${month}/${day}`
        var akhircari = new Date()
        akhircari.setDate(mulaicari.getDate() + 6)
        var year = akhircari.getFullYear();
        var month = String(akhircari.getMonth() + 1).padStart(2, '0');
        var day = String(akhircari.getDate()).padStart(2, '0');
        stringakhircari = `${year}/${month}/${day}`
        var list_siswa = await ListSiswa.findAll()
        outputdata = []
        for (const iterator of list_siswa) {
            var list_absensi = await sequelize.query('SELECT * FROM absensi WHERE nisn=? AND untuktanggal >= ? AND untuktanggal <= ?', {
                replacements: [iterator.nisn, stringmulaicari, stringakhircari],
                type: QueryTypes.SELECT,
            });
            alpha = 0
            hadir = 0
            izin = 0
            for (const iteratorr of list_absensi) {
                if (iteratorr.status == 0) {
                    alpha++
                } else if (iteratorr.status == 1) {
                    hadir++
                } else {
                    izin++
                }
            }
            outputdata.push({
                nisn: iterator.nisn,
                nama: iterator.nama,
                kelas: iterator.kelas,
                alpha: alpha,
                hadir: hadir,
                izin: izin,
                data: list_absensi
            })
        }
        return res.status(200).send(outputdata)
    } else if (data == 2) {
        //untuk by bulan
        var d = new Date()
        var lastDate = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        stringmulaicari = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/01`
        stringakhircari = `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${lastDate.getDate()}`
        console.log(stringmulaicari)
        console.log(stringakhircari)
        var list_siswa = await ListSiswa.findAll()
        outputdata = []
        for (const iterator of list_siswa) {
            var list_absensi = await sequelize.query('SELECT * FROM absensi WHERE nisn=? AND untuktanggal >= ? AND untuktanggal <= ?', {
                replacements: [iterator.nisn, stringmulaicari, stringakhircari],
                type: QueryTypes.SELECT,
            });
            alpha = 0
            hadir = 0
            izin = 0
            for (const iteratorr of list_absensi) {
                if (iteratorr.status == 0) {
                    alpha++
                } else if (iteratorr.status == 1) {
                    hadir++
                } else {
                    izin++
                }
            }
            outputdata.push({
                nisn: iterator.nisn,
                nama: iterator.nama,
                kelas: iterator.kelas,
                alpha: alpha,
                hadir: hadir,
                izin: izin,
                data: list_absensi
            })
        }
        return res.status(200).send(outputdata)
    } else if (data == 3) {
        //untuk by semester
        var getlast = await TahunAjar.findOne({
            order: [['tahun', 'DESC']]
        })
        var list_siswa = await ListSiswa.findAll()
        outputdata = []
        for (const iterator of list_siswa) {
            var list_absensi = await sequelize.query('SELECT * FROM absensi WHERE nisn=? AND tahunpelajaran = ?', {
                replacements: [iterator.nisn, getlast.tahun],
                type: QueryTypes.SELECT,
            });
            alpha = 0
            hadir = 0
            izin = 0
            for (const iteratorr of list_absensi) {
                if (iteratorr.status == 0) {
                    alpha++
                } else if (iteratorr.status == 1) {
                    hadir++
                } else {
                    izin++
                }
            }
            outputdata.push({
                nisn: iterator.nisn,
                nama: iterator.nama,
                kelas: iterator.kelas,
                alpha: alpha,
                hadir: hadir,
                izin: izin,
                data: list_absensi
            })
        }
        return res.status(200).send(outputdata)
    } else {
        return res.status(400).send({
            success: 0,
            data: "Invalid Data!"
        })
    }
})
app.get("/detailabsen", [
    check('login')
        .notEmpty().withMessage('Login is required'),
    check('data')
        .notEmpty().withMessage('Data is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({
            success: 0,
            data: "Error Input"
        })
    }
    const { login, data } = req.body
    try {
        jwt.verify(login, "sistemabsensi");
    } catch (error) {
        return res.status(400).send({
            success: 0,
            data: "Invalid Token"
        })
    }
    var datanake = await ListSiswa.findOne({
        where: {
            nisn: data
        }
    })
    if (datanake) {
        var listabsenanak = await Absensi.findAll({
            where: {
                nisn: data
            }
        })
        var outputdata = []
        for (const iterator of listabsenanak) {
            if (iterator.status == 0) {
                stringstatus = "Alpha"
            } else if (iterator.status == 1) {
                stringstatus = "Hadir"
            } else {
                stringstatus = "izin"
            }
            outputdata.push(
                {
                    kelas: iterator.kelas,
                    untuktanggal: iterator.untuktanggal,
                    timestampdatang: iterator.timestamp,
                    status: stringstatus,
                    keterangan: iterator.keterangan == null ? "-" : iterator.keterangan
                }
            )
        }
        return res.status(200).send({
            success: 1,
            data: [datanake, outputdata]
        })
    } else {
        return res.status(400).send({
            success: 0,
            data: "Murid tidak ditemukan"
        })
    }
})
app.get("/backupdatabase", [
    check('login')
        .notEmpty().withMessage('Login is required'),
    check('data')
        .notEmpty().withMessage('Data is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({
            success: 0,
            data: "Error Input"
        })
    }
    const { login, data } = req.body
    try {
        jwt.verify(login, "sistemabsensi");
    } catch (error) {
        return res.status(400).send({
            success: 0,
            data: "Invalid Token"
        })
    }
    var dataanak = await ListSiswa.findAll()
    var dataout = []
    for (const iterator of dataanak) {
        var dataabsen = await Absensi.findAll({
            where: {
                nisn: iterator.nisn
            }
        })
        alpha = 0
        hadir = 0
        izin = 0
        for (const iteratorr of dataabsen) {
            if (iteratorr.status == 0) {
                alpha++
            } else if (iteratorr.status == 1) {
                hadir++
            } else {
                izin++
            }
        }
        dataout.push({
            nisn: iterator.nisn,
            nama: iterator.nama,
            no_ortu: iterator.no_ortu,
            no_walas: iterator.no_walas,
            kelas: iterator.kelas,
            alpha: alpha,
            hadir: hadir,
            izin: izin
        })
    }
    return res.status(200).send({
        success: 1,
        data: dataout
    })
})
function getTimeOnly(dateTimeString) {
    // Parse the date-time string into a Date object
    const date = new Date(dateTimeString);

    // Extract the time portion in HH:MM:SS format
    const timeOnly = date.toTimeString().split(' ')[0];
    
    return timeOnly;
}
app.get("/getdatanotifikasi",[
    check('login')
        .notEmpty().withMessage('Login is required'),
    check('data')
        .notEmpty().withMessage('Data is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).send({
            success: 0,
            data: "Error Input"
        })
    }
    const { login, data } = req.body
    try {
        jwt.verify(login, "sistemabsensi");
    } catch (error) {
        return res.status(400).send({
            success: 0,
            data: "Invalid Token"
        })
    }
    var dataabsenhariini = await Absensi.findAll(
        {
            where: {
                untuktanggal: gettanggal(1)
            }
        }
    );
    var datasend = []
    for (const iterator of dataabsenhariini) {
        var dataanak_e = await ListSiswa.findOne({
            where:{
                nisn:iterator.nisn
            }
        })
        datasend.push({
            nama:dataanak_e.nama,
            no_ortu:dataanak_e.no_ortu,
            status:iterator.status,
            waktuhadir: getTimeOnly(iterator.timestamp),
            keterangan:iterator.keterangan
        });
    }
    return res.status(200).send(datasend)
})
app.get("/")
sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch((error) => {
    console.error('Unable to connect to the database: ', error);
});
app.listen(port, () => console.log(`Example app listening on port ${port}!`))