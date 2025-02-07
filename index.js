require('dotenv').config();
const {database} = require("./src/config/database");
const express = require('express');
const cors = require('cors');

database();

const app = express();
const port = 3000;

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({extended: true}));

const userRoutes = require('./src/routes/user');
const publicationRoutes = require('./src/routes/publication');
const followRoutes = require("./src/routes/follow");

app.use('/api/user', userRoutes);
app.use('/api/publication', publicationRoutes);
app.use('/api/follow', followRoutes);

/*
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Ocurrio un error en el servidor' });
});
*/

app.get("/ruta-prueba", (req,res) => {

    return res.status(200).json({
        "id" : 1,
        "nombre" : "Joaquin",
        "web": "joaquinoriweb.es"
    })

});


app.listen(port, () => {
    console.log("Servidor de node corriendo en el puerto " + port);
});