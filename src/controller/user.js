const validatorUser = require("../helper/validator");
const bcrypt = require("bcrypt");
const mongoosePaginate = require("mongoose-paginate-v2");
const User = require("../models/user");
const followService = require("../services/followService");
const jwt = require("../services/jwt");
const path = require("path");
const fs = require("fs")

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
        }).select("+password").lean();

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
                email: userExisting.email
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

const profile = async (req, res) => {

    try{
    let { query } = req.params;

    if(!query) {
        return res.status(400).json({
            status: "error",
            message: "El parametro de búsqueda es obligatorio"
        });
    }

    const regexQuery = new RegExp("^" + query + "$", "i");

    const user = await User.findOne({
        $or:[
            { email: query.toLowerCase() },
            { name: regexQuery },
            { surname: regexQuery },
            { nick: regexQuery },
            {
                $expr: { 
                    $regexMatch: { input: { $concat: ["$name", " ", "$surname"] }, regex: query, options: "i" } 
                } 
            }
        ]
    });

        if(!user){
            return res.status(404).json({
                status: "error",
                message: "Fallo en la buqueda"
            });
        }

        user.password = undefined;
        user.role = undefined

        const followInfo = await followService.FollowThisUser(req.user.id, user.id);

        return res.status(200).json({
            status: "success",
            user,
            followInfo
        })
    } catch( error ){
        return res.status(500).json({
            status: "error",
            message: "Error al buscar usuario",
            error: error.message
        });
    }
}

const list = async (req, res) => {
    try {
        let page = parseInt(req.params.page) || 1;
        let itemsPerPage = 2; //Total de items mostrados

        const options = {
            page,
            limit: itemsPerPage,
            sort: { _id: 1 }, // Ordenar por ID ascendente
            select: "-password" // Excluir el campo de contraseña
        };

        const result = await User.paginate({}, options);

        if (!result.docs.length) {
            return res.status(404).json({
                status: "error",
                message: "No hay usuarios disponibles",
            });
        }

        let followUserIds = await followService.FollowUserIds(req.user.id);

        return res.status(200).json({
            status: "success",
            users: result.docs,
            page: result.page,
            itemsPerPage: result.limit,
            total: result.totalDocs,
            totalPages: result.totalPages,
            user_following: followUserIds.following,
            user_follow_me: followUserIds.followers
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error en la consulta",
            error: error.message
        });
    }
};

const update = async (req, res) => {
    try{
    const userIdentity = req.user;
    const userToUpdate = req.body;

    delete userToUpdate.iat;
    delete userToUpdate.exp;
    delete userToUpdate.role;
    delete userToUpdate.image;

    const users = await User.find({
        $or: [
            { email: userToUpdate.email.toLowerCase() },
            { nick: userToUpdate.nick.toLowerCase() }
        ]
    }).exec();

    let userIsset = false;

    users.forEach(user => {
        if(user && user._id.toString() !== userIdentity.id) userIsset = true;
    });
    
        if (userIsset){
            return res.status(200).json({
                status: "success",
                message: "El usuario ya existe"
            });
        }

    
    if(userToUpdate.password){
        userToUpdate.password = await bcrypt.hash(userToUpdate.password, 10);
    }

    const userUpdated = await User.findByIdAndUpdate(userIdentity.id, userToUpdate, {new:true});
        
        if(!userUpdated){
            return res.status(500).json({status: "error", message: "Errorn en la esta parte"});
        }
        
        return res.status(200).json({
            status: "Success",
            message: "Metodo para actualizar usuario",
            userUpdated
        });
    } catch (error) {
        return res,status(500).json({
            status: "error",
            message: "Error en la actualizcion",
            error:  error.message
        });
    }
};

const upload = async (req, res) => {
    if(!req.file && !req.files) {
        return res.status(404).json({
            status: "error",
            message: "Peticion invalida:  no se pudo subir ninguna imagen"
        });
    }

    let archivo = req.file.originalname;

    let archivo_extension = path.extname(archivo).toLowerCase().substring(1);

    if(!["png", "jpg", "jpeg", "gif"].includes(archivo_extension)) {
        fs.unlink(req.file.path, (error) => {
            if (error) {
                console.error("Error al intentar borrar el archivo: ", error);
            }
            return res.status(400).json({
                status: "error",
                message: "Imagen invalida: formato no permitido",
            });
        });
        return
    }

    try {

        const userIdentity = req.user;

        const userUpdated = await User.findOneAndUpdate(
            {_id: userIdentity.id}, 
            {image: req.file.filename}, 
            {new: true}
        );

        if (!userUpdated) {
            return res.status(500).json({
                status: "error",
                message: "Error al actualizar el usuario"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Usuario actualizado correctamente",
            user: userUpdated,
            fichero: req.file
        })


    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error en la actualizacion",
            error: error.message
        });
    }
};

const avatar = (req, res) => {

    let file = req.params.file;
    let ruta_fisica = path.join(__dirname, "../image/user/", file);

    fs.stat(ruta_fisica, (error, stats) => {
        if (error || !stats.isFile()) {
            return res.status(404).json({
                status: "error",
                message: "No se pudo encontrar la imagen",
                error,
                fichero,
                ruta_fisica
            });
        } else {
            return res.sendFile(path.resolve(ruta_fisica));
        }
    });
};

module.exports = {
    pruebaUser,
    register,
    login,
    profile,
    list,
    update,
    upload,
    avatar
}