const validatorUser = require("../helper/validator");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const { error, log } = require("console");
const jwt = require("../services/jwt");

const pruebaUser = (req, res) => {
    return res.status(200).json({
        message: "Mensaje desde controlles/user.js",
        usuario: req.user

    })
}

const register = async (req, res) => {
    
    let params = req.body;

    try{

        validatorUser(params);

    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar",
            error: error.message
        });
    }
    try{
    const userExisting = await User.find({ 
        $or: [
            { email: params.email.toLowerCase() },
            { nick: params.nick.toLowerCase() }
        ]
    });

        if(userExisting.length > 0) {
            return res.status(400).json({
                status: "error",
                message: "El usuario ya existe"
            })
        }    

        params.password = await bcrypt.hash(params.password, 10);

        const user = new User(params);
        const userSaved = await user.save()

        return res.status(200).json({
            status: "succes",
            message: "Usuario registrado exitosamente",
            user: userSaved
        });

    } catch ( error ){
        return res.status(500).json({
            status: "error",
            message: "Error en el servidor",
            error: error.message
        })
    };

};

const login = async (req, res) => {

    let params = req.body;

    if(!params.email || !params.password){
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar"
        });
    }

    try{

        const userExisting = await User.findOne({
            email: params.email
        }).select("+password");

        if (!userExisting) {
            return res.status(400).json({
                status: "error",
                message: "Correo no encontrado"
            })
        }

        const pwd = bcrypt.compareSync(params.password, userExisting.password)

        if(!pwd){
            return res.status(400).json({
                status: "error",
                message: "Contraseña incorrecta"
            })
        }

        // Token
        const token = jwt.createToken(userExisting);

        // Eliminar contraseña antes de enviar la respuesta
        userExisting.password = undefined;

        return res.status(200).json({
            status: "success",
            message: "Te has identificado correctamente",
            user: {
                id: userExisting._id,
                name: userExisting.name,
                nick: userExisting.nick,
            },
            token
        });

    } catch( error ){
        return res.status(500).json({
            status: "error",
            message: "Error en el servidor",
            error: error.message
        })
    }
};

module.exports = {
    pruebaUser,
    register,
    login
}