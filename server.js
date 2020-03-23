const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const nodemailer = require('nodemailer')

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'protocolos3cm9@gmail.com',
        pass: 'dinos@urio123'
    }
})


const CatalogoProfesores = "select p.nombre nombre, p.rol rol, a.nombre academia from profesor p, pertenece pt, academia a where p.usuario=pt.nombre and a.clave=pt.clave";
const login = "select usuario,contraseña from profesor"
var profe

var app = express();
app.use(bodyParser.json());
app.use(cors())

var mysqlConnection = mysql.createConnection({
    host: "192.168.0.18",
    port: 9995,
    user: "usuario1",
    password: "perro123",
    database: "TT",
    multipleStatements: true
})

mysqlConnection.connect((error) => {
    if (!error) {
        console.log("Connected");
    }
    else {
        throw error;
    }
})

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get("/", (req, res) => {
    res.send("Ve a /profesor para ver a profesores")
});

app.get("/catalogo", (req, res) => {
    mysqlConnection.query(CatalogoProfesores, (err, results) => {
        if (err) {
            throw res.send(err);
        }
        else {
            return res.json({
                data: results
            })
        }
    })
})

app.post("/NombreProfe", (req, res) => {
    let profesor = req.body
    var sql = "select nombre from profesor where usuario='" + profesor.usuario + "'"

    mysqlConnection.query(sql, (err, results) => {
        if (err) {
            throw res.send(err);
        }
        else {
            profe = results[0].nombre
            return res.json({
                data: results
            })
        }
    })
})

app.post("/LoginProfes", (req, res) => {
    let profe = req.body;
    var sql = "select * from profesor where usuario='" + profe.usuario + "' and contraseña='" + profe.contraseña + "';"
    mysqlConnection.query(sql, (err, rows) => {
        if (rows.length > 0) {
            return res.json({
                data: 1
            })
        }
        else {
            return res.json({
                data: 0
            })
        }
    })
})

/* Login Alumnos */

app.post("/LoginAlumnos", (req, res) => {
    let alumno = req.body;
    var sql = "select * from alumnos where boleta='" + alumno.boleta + "' and contraseña='" + alumno.contraseña + "';"
    mysqlConnection.query(sql, (err, rows) => {
        if (rows.length > 0) {
            return res.json({
                data: 1
            })
        }
        else {
            return res.json({
                data: 0
            })
        }
    })
})

//Registro Profe

app.post('/RegistroProfe', (req, res) => {
    let profesor = req.body;
    var sql = "insert into Profesor (nombre,usuario,contraseña,rol,correo) values ('" + profesor.nombre + "','" + profesor.usuario + "','" + profesor.contraseña + "','" + profesor.rol + "','" + profesor.correo + "')";
    mysqlConnection.query(sql, (err) => {
        if (err) {
            return res.json({
                data: 0
            })
        }
        else {
            return res.json({
                data: 1
            })
        }
    })
})


/*Registro Alumno*/

app.post('/RegistroAlumno', (req, res) => {
    let alumno = req.body;
    var sql = "insert into Alumnos (nombre,boleta,correo,contraseña) values ('" + alumno.nombre + "','" + alumno.boleta + "','" + alumno.correo + "','" + alumno.contraseña + "')";
    mysqlConnection.query(sql, (err) => {
        if (err) {
            return res.json({
                data: 0
            })
        }
        else {
            return res.json({
                data: 1
            })
        }
    })
})

app.post('/ProtocolosProfe', (req, res) => {
    let profesor = req.body;
    var sql = "SELECT pt.numeroTT Numero,pt.nombreTT Nombre FROM Protocolo pt, evalúa e, profesor p WHERE e.estatus='Pendiente' and pt.numeroTT=e.numeroTT and p.usuario=e.nombre and p.usuario='" + profesor.usuario + "'"
    mysqlConnection.query(sql, (err, results) => {
        if (err) {
            throw res.send(err);
        }
        else {
            return res.json({
                data: results
            })
        }
    })
})

/*Protocolo */

app.post('/Protocolo', (req, res) => {
    let protocolo = req.body;

    var sql1 = "select * from Alumnos where boleta='" + protocolo.boleta + "' and numeroTT is not null"

    mysqlConnection.query(sql1, (err, results) => {
        if (err) {
            throw res.send(err)
        }
        else {
            if (results.length > 0) {
                return res.json({
                    data: 0
                })
            }
            else {
                var sql2 = "insert into Protocolo (nombreTT, numeroTT, DocumentoPDF) values ('" + protocolo.nombreTT + "','" + protocolo.numeroTT + "','" + protocolo.linktt + "')";

                mysqlConnection.query(sql2, (err) => {
                    if (err) {
                        throw res.send(err)
                    }
                    else {
                        var sql3 = "update alumnos set numeroTT = '" + protocolo.numeroTT + "' where boleta='" + protocolo.boleta + "'"
                        mysqlConnection.query(sql3, (err) => {
                            if (err) {
                                throw res.send(err)
                            }
                            else {
                                return res.json({
                                    data: 1
                                })
                            }
                        })

                    }
                })
            }
        }
    })

})

/*Dar de baja protocolo*/

app.post('/BajaProtocolo', (req, res) => {

    let protocolo = req.body;
    var sqla = "select numeroTT from alumnos where boleta='" + protocolo.usuario + "' and numeroTT is not null"

    var numeroTT
    mysqlConnection.query(sqla, (err, results) => {
        if (err) {
            throw res.send(err)
        }
        else {
            if (results.length < 1) {
                return res.json({
                    data: 0
                })
            }
            else {
                numeroTT = results[0].numeroTT
                var sql = "delete from protocolo where numeroTT = '" + numeroTT + "' ;"

                mysqlConnection.query(sql, (err) => {
                    if (err) {
                        throw res.send(err)
                    }
                    else {
                        return res.json({
                            data: 1
                        })
                    }
                })
            }
        }
    })
})

/*Protocolo disponible*/

app.post('/ProtocolosDisponibles', (req, res) => {
    let profesor = req.body
    var sql = "select tabla1.numeroTT,tabla1.nombreTT from((select numeroTT, nombreTT from Protocolo where numeroTT not in (select numeroTT from Evalúa)) UNION (select distinct p.numeroTT,p.nombreTT from protocolo p, evalúa e where p.numeroTT=e.numeroTT group by(p.numeroTT) having (count(*) <3))) tabla1 left join (select p.numeroTT,p.nombreTT from protocolo p, evalúa e where p.numeroTT=e.numeroTT and e.nombre='" + profesor.usuario + "') tabla2 on tabla1.numeroTT=tabla2.numeroTT where tabla2.numeroTT is null"
    mysqlConnection.query(sql, (err, results) => {
        if (err) {
            throw res.send(err)
        }
        else {
            return res.json({
                data: results
            })
        }
    })
})

app.post('/AgregarProtocolo', (req, res) => {
    let conjunto = req.body

    var sql = "insert into evalúa(numeroTT,nombre,estatus) values('" + conjunto.protocolo + "','" + conjunto.usuario + "','Pendiente')"
    mysqlConnection.query(sql, (err) => {
        if (err) {
            return res.json({
                data: 0
            })
        }
        else {
            return res.json({
                data: 1
            })
        }
    })

})

app.post('/ProtocoloEvaluado', (req, res) => {
    var evaluacion = req.body
    var sql1 = "select nombre from profesor where usuario='" + evaluacion.profesor + "'"
    var nombre

    mysqlConnection.query(sql1, (err, results) => {
        if (err) {
            throw res.send(err)
        }
        else {
            nombre = results[0].nombre
        }
    })



    var sql2 = "update evalúa set estatus='" + evaluacion.calificacion + "' where numeroTT='" + evaluacion.protocolo + "' and nombre='" + evaluacion.profesor + "'"

    mysqlConnection.query(sql2, (err) => {
        if (err) {
            throw res.send(err)
        }
        else {
            var sql3 = "select correo from alumnos where numeroTT='" + evaluacion.protocolo + "'"
            mysqlConnection.query(sql3, (err, results) => {

                if (err) {
                    throw res.send(err)
                }
                else {
                    for (var i = 0; i < results.length; i++) {
                        var opcionesMail = {
                            from: 'Protocolos 3CM9',
                            to: results[i].correo,
                            subject: 'Actualización de evaluación de Protocolo',
                            text: "La evaluación del profesor " + nombre + " sobre tu protocolo ha sido actualziada."
                        }
                        transporter.sendMail(opcionesMail, function (err) {
                            if (err) {
                                console.log(err)
                            } else {
                                console.log("Email enviado a " + results[i].correo)
                            }
                        })
                    }
                    return res.json({
                        data: 1
                    })
                }
            })
        }
    })
})

app.post("/InfoProtocolo", (req, res) => {
    let protocolo = req.body

    var sql = "select nombreTT Nombre,DocumentoPDF URL from protocolo where numeroTT='" + protocolo.protocolo + "'"

    mysqlConnection.query(sql, (err, results) => {
        if (err) {
            return res.send(err)
        }
        else {
            return res.json({
                data: results
            })
        }
    })
})

app.post("/NombreAlumno", (req, res) => {
    let Alumno = req.body

    var sql = "select nombre from alumnos where boleta='" + Alumno.boleta + "'"

    mysqlConnection.query(sql, (err, results) => {
        if (err) {
            throw res.send(err)
        }
        else {
            return res.json({
                data: results
            })
        }
    })
})

app.post("/EvaluacionesAlumno", (req, res) => {
    let Alumno = req.body

    var sql = "select p.nombre Profesor,e.estatus Estatus from evalúa e,profesor p,alumnos a where a.numeroTT=e.numeroTT and e.nombre=p.usuario and a.boleta='" + Alumno.boleta + "'"

    mysqlConnection.query(sql, (err, results) => {
        if (err) {
            throw res.send(err)
        }
        else {
            return res.json({
                data: results
            })
        }
    })
})

app.post("/UnirseProtocolo", (req, res) => {
    let Alumno = req.body

    var sql1 = "select * from alumnos where boleta='" + Alumno.boleta + "' and numeroTT is null"
    mysqlConnection.query(sql1, (err, results) => {
        if (err) {
            throw res.send(err)
        }
        else {
            if (results.length > 0) {
                var sql2 = "update alumnos set numeroTT='" + Alumno.protocolo + "' where boleta='" + Alumno.boleta + "'"
                mysqlConnection.query(sql2, (err) => {
                    if (err) {
                        return res.json({
                            data: 0
                        })
                    }
                    else {
                        return res.json({
                            data: 1
                        })
                    }
                })
            }
            else {
                return res.json({
                    data: -1
                })
            }
        }
    })
})

app.post("/AlumnoProtocolo", (req, res) => {
    let Alumno = req.body

    var sql = "select numeroTT from alumnos where boleta='" + Alumno.boleta + "'"

    mysqlConnection.query(sql, (err, results) => {
        if (err) {
            throw res.send(err)
        }
        else {
            return res.json({
                data: results
            })
        }
    })
})

app.post("/AgregaPalabrasClave",(req,res)=>{
    let conjunto=req.body

    var sql="insert into protocolo_palabrasclave(palabrasClave,numeroTT) values('"+conjunto.palabra+"','"+conjunto.protocolo+"')"
    mysqlConnection.query(sql,(err)=>{
        if(err){
            return res.json({
                data:0
            })
        }
        else{
            return res.json({
                data:1
            })
        }
    })
})

app.post("/PalabrasClave",(req,res)=>{
    let conjunto=req.body

    var sql="select palabrasclave Palabra from Protocolo_palabrasClave where numeroTT='"+conjunto.protocolo+"'"
    mysqlConnection.query(sql,(err,results)=>{
        if(err){
            throw res.send(err)
        }
        else{
            if(results.length>0){
                return res.json({
                    data:results
                })
            }
            else{
                return res.json({
                    data:0
                })
            }
        }
    })
})

app.post("/ObtenLink",(req,res)=>{
    let conjunto=req.body

    var sql="select DocumentoPDF from protocolo where numeroTT='"+conjunto.protocolo+"'"
    mysqlConnection.query(sql,(err,results)=>{
        if(err){
            throw res.send(err)
        }
        else{
            if(results.length>0){
                return res.json({
                    data:results
                })
            }
            else{
                return res.json({
                    data:0
                })
            }
        }
    })
})

app.post("/ActualizaLink",(req,res)=>{
    let conjunto=req.body

    var sql="update protocolo set DocumentoPDF='"+conjunto.link+"' where numeroTT='"+conjunto.protocolo+"'"
    mysqlConnection.query(sql,(err)=>{
        if(err){
            return res.json({
                data:0
            })
        }
        else{
            return res.json({
                data:1
            })
        }
    })
})

app.post("/FinalizaEvaluacion",(req,res)=>{
    let conjunto=req.body

    var sql="update evalúa set estatus='Pendiente' where numeroTT='"+conjunto.protocolo+"' and not estatus='Aprobado'"
    mysqlConnection.query(sql,(err)=>{
        if(err){
            return res.json({
                data:0
            })
        }
        else{
            return res.json({
                data:1
            })
        }
    })
})

app.listen(4000)