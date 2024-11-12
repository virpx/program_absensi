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
/*
- STATUS ABSEN:
0 = ALPHA
1 = HADIR
2 = IZIN
- KIRIM RUBAH ABSEN DALAM BENTUK {nisn}#{status}#{keterangan} (keterangan jika ijin jika tidak ada tidak perlu dikirim)
*/
function gettanggal(format){
    var now = new Date();
    var year = now.getFullYear();
    var month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    var day = String(now.getDate()).padStart(2, '0');
    var hours = String(now.getHours()).padStart(2, '0');
    var minutes = String(now.getMinutes()).padStart(2, '0');
    var seconds = String(now.getSeconds()).padStart(2, '0');
    if(format == 1){
        return `${year}-${month}-${day}`
    }else if(format == 2){
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
    }else if(format == 3){
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
app.post("/ubahabsen",[
    check('login')
        .notEmpty().withMessage('Login is required'),
    check('data')
        .notEmpty().withMessage('Data is required'),
], async (req,res)=>{
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
    if(dataparse[1] == 2){
        datamuride.keteragan = dataparse[2]
    }
    await datamuride.save()
})
app.get("/listabsenhariini",[
    check('login')
        .notEmpty().withMessage('Login is required'),
    check('data')
        .notEmpty().withMessage('Data is required'),
],async (req,res)=>{
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
app.post("/tambahtahunajar",[
    check('login')
        .notEmpty().withMessage('Login is required'),
    check('data')
        .notEmpty().withMessage('Data is required'),
], async (req,res)=>{
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
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
    if(data == "tambah_tahun_ajar"){
        var getlast = await TahunAjar.findOne({
            order:[['tahun','DESC']]
        })
        if(getlast.tahun == gettanggal(3)){
            return res.status(400).send({
                success:0,
                data:"Belum saatnya tambah tahun pelajaran baru"
            })
        }
        await TahunAjar.create({
            tahun:getlast.tahun+1
        })
        return res.status(200).send({
            success:1,
            data:"Berhasil Tambah Tahun Pelajaran"
        })
    }else{
        return res.status(400).json({
            success:0,
            data:"Invalid Data"
        })
    }
})
app.post("/insertlistsiswa",[
    check('login')
        .notEmpty().withMessage('Login is required'),
    check('data')
        .notEmpty().withMessage('Data is required'),
])
sequelize.authenticate().then(() => {
    console.log('Connection has been established successfully.');
}).catch((error) => {
    console.error('Unable to connect to the database: ', error);
});
app.listen(port, () => console.log(`Example app listening on port ${port}!`))