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
app.use(express.urlencoded({ extended: false }));
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
        for (const iterator of ambillistsiswa) {
            await Absensi.create({
                nisn: iterator["nisn"],
                status: 0,
                untuktanggal: gettanggal(1)
            })
        }
    }
}
app.post("/login", [
    check('username')
        .notEmpty().withMessage('Username is required'),
    check('password')
        .notEmpty().withMessage('Password is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
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
        return res.status(400).json({ errors: errors.array() });
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
    datamuride.status = 1
    datamuride.timestamp = gettanggal(2);
    await datamuride.save()
    return res.status(200).send({
        success: 1,
        data: "Berhasil Absen"
    })
})
app.post("/ubahabsen", [
    check('login')
        .notEmpty().withMessage('Login is required'),
    check('data')
        .notEmpty().withMessage('Data is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
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
    datamuride.status = dataparse[1]
    if (dataparse[1] == 2) {
        datamuride.keteragan = dataparse[2]
    }
    await datamuride.save()
})
app.get("/listabsenhariini", [
    check('login')
        .notEmpty().withMessage('Login is required'),
    check('data')
        .notEmpty().withMessage('Data is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
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
app.post("/tambahtahunajar", [
    check('login')
        .notEmpty().withMessage('Login is required'),
    check('data')
        .notEmpty().withMessage('Data is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
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
    if (data == "tambah_tahun_ajar") {
        var getlast = await TahunAjar.findOne({
            order: [['tahun', 'DESC']]
        })
        if (getlast.tahun == gettanggal(3)) {
            return res.status(400).send({
                success: 0,
                data: "Belum saatnya tambah tahun pelajaran baru"
            })
        }
        await TahunAjar.create({
            tahun: getlast.tahun + 1
        })
        return res.status(200).send({
            success: 1,
            data: "Berhasil Tambah Tahun Pelajaran"
        })
    } else {
        return res.status(400).json({
            success: 0,
            data: "Invalid Data"
        })
    }
})
app.post("/backupkelas9", [
    check('login')
        .notEmpty().withMessage('Login is required'),
    check('data')
        .notEmpty().withMessage('Data is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
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
    if (data == "get_backup_data") {
        var list_kelas9 = await ListSiswa.findAll({
            where: {
                kelas: 9
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
                alpha: alpha,
                hadir: hadir,
                izin: izin
            })
        }
        return res.status(200).send(data_kehadiran)
    } else {
        return res.status(400).send({
            success: 0,
            data: "Invalid Data"
        })
    }
})
app.post("/insertlistsiswa", [
    check('login')
        .notEmpty().withMessage('Login is required'),
    check('data')
        .notEmpty().withMessage('Data is required'),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
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
    if (getlast.tahun == gettanggal(3)) {
        return res.status(400).send({
            success: 0,
            data: "Belum saatnya melakukan insert data siswa"
        })
    } else if (getlast.tahun < gettanggal(3)) {
        return res.status(400).send({
            success: 0,
            data: "Harap buat tahun ajaran baru sebelum melakukan insert siswa"
        })
    }
    data2 = data.split("#")
    if (data2[0] == "go_insert_siswa") {
        await ListSiswa.truncate()
        try{
            listsiswa = JSON.parse(atob(data2[1]))
            for (const iterator of listsiswa) {
                await ListSiswa.create({
                    nisn: iterator.nisn,
                    nama: iterator.nama,
                    no_ortu: iterator.no_ortu,
                    no_walas: iterator.no_walas,
                    kelas: iterator.kelas,
                })
            }
        }catch{
            return res.status(400).send({
                success: 0,
                data: "Error menambahkan siswa"
            })
        }
        return res.status(200).send({
            success: 1,
            data: "Berhasil menambahkan siswa"
        })
    } else {
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
        return res.status(400).json({ errors: errors.array() });
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
                alpha: alpha,
                hadir: hadir,
                izin: izin
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
                alpha: alpha,
                hadir: hadir,
                izin: izin
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
                alpha: alpha,
                hadir: hadir,
                izin: izin
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
        return res.status(400).json({ errors: errors.array() });
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
    var listabsenanak = await Absensi.findAll({
        where:{
            nisn:data
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
                kelas : iterator.kelas,
                untuktanggal : iterator.untuktanggal,
                timestampdatang: iterator.timestamp,
                status: stringstatus,
                keteragan: iterator.keterangan
            }
        )
    }
    return res.status(200).send(outputdata)
})
app.get("/")
sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch((error) => {
    console.error('Unable to connect to the database: ', error);
});
app.listen(port, () => console.log(`Example app listening on port ${port}!`))