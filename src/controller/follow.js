const Follow = require("../models/follow");
const User = require("../models/user");

const followService = require("../services/followService");

const pruebaFollow = (req, res) => {
    return res.status(200).send({
        "message": "Mensaje desde controlles/follow.js"
    })
}

const save = async (req, res) => {
    
    const params = req.body;

    const identity = req.user;

    let userToFollow = new Follow({
        user: identity.id,
        followed: params.followed
    });

    try {

        const userSave = await userToFollow.save();

        return res.status(200).json({
            status: "success",
            identity: req.user,
            follow: userSave
        });

    } catch (error) {

        return res.status(400).json({
            status: "error",
            message: "Usuario no encontrado"
        });

    }
}

const unfollow = async (req, res) => {
    try {
        const userId = req.user.id; // ID del usuario autenticado
        const followedId = req.params.id; // ID del usuario al que se quiere dejar de seguir

        // Intentar eliminar el seguimiento y verificar si existía
        const followDeleted = await Follow.findOneAndDelete({ user: userId, followed: followedId }).lean();

        if (!followDeleted) {
            return res.status(404).json({
                status: "error",
                message: "No sigues a este usuario o ya lo dejaste de seguir"
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Has dejado de seguir a este usuario"
        });

    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error al intentar dejar de seguir",
            error: error.message
        });
    }
};

const following = async (req, res) => {
    try {
        let userId = req.user.id;
        let params = req.params;

        if(params.id) userId = params.id;

        let page = 1;

        if(params.page) page = params.page;

        let userPerPage = 5;

        const options = {
            page,
            limit: userPerPage,
            sort: { _id: 1 },
        };

        const follows = await Follow.paginate(
            { user: userId },
            { ...options, populate: { path: "user followed", select: "-password -role -__v -email" } }
        );

        let followUserIds = await followService.FollowUserIds(req.user.id);

        return res.status(200).json({
            status: "success",
            message: "Listado de usuarios a los que estoy siguiendo",
            follows,
            user_following: followUserIds.following,
            user_followers: followUserIds.followers
        });
    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Error al ver el listado",
            error: error.message
        });

    }
};

const followers = async (req, res) => {

    try {
        let userId = req.user.id;
        let params = req.params;

        if(params.id) userId = params.id;

        let page = 1;

        if(params.page) page = params.page;

        let userPerPage = 5;

        const options = {
            page,
            limit: userPerPage,
            sort: { _id: 1 },
        };

        const follows = await Follow.paginate(
            { followed: userId },
            { ...options, populate: { path: "user followed", select: "-password -role -__v -email" } }
        );

        let followUserIds = await followService.FollowUserIds(req.user.id);

        return res.status(200).json({
            status: "success",
            message: "Listado de usuarios a los que estoy siguiendo",
            follows,
            user_following: followUserIds.following,
            user_followers: followUserIds.followers
        });
    } catch (error) {

        return res.status(500).json({
            status: "error",
            message: "Error al ver el listado",
            error: error.message
        });

    }
};

module.exports = {
    pruebaFollow,
    save,
    unfollow,
    following,
    followers
}