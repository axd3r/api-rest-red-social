const jwt = require("jwt-simple");
const moment = require("moment");

const libjwt = require("../services/jwt");
const secret = libjwt.secret;

// MIDDLEWARE
exports.auth = (req, res, next) => {

    if(!req.headers.authorization){
        return res.status(403).json({
            status: "error",
            message: "La peticion no tiene la cabecera de autenticaion"
        });
    }

    let token = req.headers.authorization.replace(/['"]+/g,'');

    try{
        let payload = jwt.decode(token, secret);

        console.log(payload);

        if(payload.exp <= moment().unix()){
            return res.status(404).json({
                status: "error",
                message: "Token expirado"
            });
        }
        req.user = payload;

    } catch ( error ){
        return res.status(404).json({
            status: "error",
            message: "Token invalido",
            error: error.message
        });
    }

    next();
}