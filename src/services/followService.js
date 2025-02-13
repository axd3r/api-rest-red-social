const Follow = require("../models/follow");

const FollowUserIds = async (identityUserId) => {
    try {
        // Obtener los usuarios a los que sigues
        let following = await Follow.find({ user: identityUserId })
                                    .select({ followed: 1, _id: 0 })
                                    .exec();

        // Obtener los usuarios que te siguen
        let followers = await Follow.find({ followed: identityUserId })
                                    .select({ user: 1, _id: 0 })
                                    .exec();

        // Convertir los resultados en arrays de IDs
        let followingIds = following.map(follow => follow.followed.toString());
        let followerIds = followers.map(follow => follow.user.toString());

        return {
            following: followingIds,
            followers: followerIds
        };

    } catch (error) {
        console.error("Error al obtener los seguidores y seguidos:", error);
        throw new Error("Error al obtener la información de los seguidores");
    }
};

const FollowThisUser = async (identityUserId, profileUserId) => {
    try {
        let following = await Follow.find({ "user": identityUserId, "followed": profileUserId });

        let followers = await Follow.find({ "user": profileUserId, "followed": identityUserId });

        return {
            following,
            followers
        }

    } catch (error) {
        console.error("Error al obtener la información de seguimiento:", error);
        throw new Error("Error al obtener la información de seguimiento");
    }
};


module.exports = {
    FollowUserIds,
    FollowThisUser
};
