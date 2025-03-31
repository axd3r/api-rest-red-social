const fs = require("fs");
const path = require("path");

const Publication = require("../models/publication");
const validatorPublication = require("../helper/validatorublication");

const followService = require("../services/followService");
const { response } = require("express");

const pruebaPublication = (req, res) => {
    return res.status(200).send({
        "message": "Mensaje desde controlles/publication.js"
    });
}

const save = async (req, res) => {
    let params = req.body;

    try {
        validatorPublication(params);
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar",
            error: error.message
        });
    }

    const user = req.user;

    let publicationData = {
        user: user.id,
        text: params.text
    };

    if (req.file) {
        publicationData.file = req.file.filename;
    }

    let publication = new Publication(publicationData);

    try {
        await publication.save();

        return res.status(200).json({
            status: "success",
            message: "Publicación guardada correctamente.",
            publication
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al guardar la publicación",
            error: error.message
        });
    }
};

const detail = async (req, res) => {

    const params = req.params.id;

    if(!params) {
        return res.status(400).json({
            status: "error",
            message: "El dato de busqueda es obligatorio"
        });
    };
    
    try {

        const find = await Publication.findById( params );

        if (!find) {
            return res.status(404).json({
                status: "error",
                message: "no se encontrator coincidencias"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Mostrar publicacion",
            publication: find
        });

    } catch ( error ) {
        return res.status(400).json({
            status: "error",
            message: "Erro al tratar de hacer la busqueda"
        });
    }
};

const remove = async(req, res) => {

    const params = req.params.id;
    
    if ( !params) {
        return res.status(404).json({
            status: "error",
            message: "Es obligatorio el dato de busqueda"
        })
    }
    try {

        const publication = await Publication.findOneAndDelete({"user": req.user.id, "_id": params});

        if( !publication ) {
            return res.status(400).json({
                status: "error",
                message: "Este usuario no uede elminar una publicacion que no es suya"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Publicaion eliminada con exito",
            object: publication
        });
        
    } catch ( error) {
        return res.status(400).json({
            status: "error",
            message: "Erro al tratar de hacer la busqueda",
            error: error.message
        });
    }
};

const publicationUser = async (req, res) => {
    
    try {
        let userId = req.user.id;
        let params = req.params;
        
        if(params.user) userId = params.user;
        
        let page = 1;

        if(params.page) page = params.page;

        let publicaitonPerPage = 5;

        const options = {
            page,
            limit: publicaitonPerPage,
            sort: { _id: 1 }
        }

        const find = await Publication.paginate(
            {user: userId},
            { ...options, populate: { path: "user", select: "-password -role -___v"} }
        );

        if(!find.docs.length) {
            return res.status(400).json({
                status: "error",
                message: "No hay datos en la busqueda"
            });
        }
        return res.status(200).json({
            status: "success",
            message: "Mostrar publicacion",
            publication: find
        });

    } catch ( error ) {
        return res.status(400).json({
            status: "error",
            message: "Erro al tratar de hacer la busqueda"
        });
    }
}

const uploadFile = async (req, res) => {
    if (!req.file) {
        return res.status(400).json({
            status: "error",
            message: "Petición inválida: No se ha recibido ningún archivo."
        });
    }

    try {
        const userId = req.user.id;
        const publicationId = req.params.id;

        const publicationUpdated = await Publication.findOneAndUpdate(
            { _id: publicationId, user: userId },
            { file: req.file.filename },
            { new: true }
        );

        if (!publicationUpdated) {
            return res.status(403).json({
                status: "error",
                message: "No tienes permiso para actualizar esta publicación o no existe."
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Archivo actualizado correctamente.",
            publication: publicationUpdated,
            file: req.file.filename
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al actualizar el archivo de la publicación.",
            error: error.message
        });
    }
};

const media = (req, res) => {

    let file = req.params.file;
    let ruta_fisica = path.join(__dirname, "../image/publication/", file);

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

const feed = async (req, res) => {

    let page = 1;

    if( req.params.page){
        page = req.params.page;
    }

    let itemsPerPage = 5;

    const options = {
        page,
        limit: itemsPerPage,
    }

    try {
        const myFollows = await followService.FollowUserIds(req.user.id);

        const publicacions = await Publication.paginate(
            {user: myFollows.following}, // Manera implicita
            //user: {"$in": myFollows.following} Manera explicita
            {...options, populate: {path: "user", select: "-password -role -__v"}});

        if(!publicacions){
            return res.status(500).json({
                status: "error",
                message: "No hay publicaciones que mostrar"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Feed de publicacion correctamente",
            myFollows: myFollows.following,
            publicacions
        });
    }catch(error){
        return res.status(500).json({
            status: "error",
            message: "No se han listado las publicaciones del feed"

        });
    }
} 

module.exports = {
    pruebaPublication,
    save,
    detail,
    remove,
    publicationUser,
    uploadFile,
    media,
    feed
}