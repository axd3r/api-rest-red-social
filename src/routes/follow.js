const express = require("express");
const router = express.Router();
const FollowController = require ("../controller/follow");
const check = require ("../middlewares/auth");

const auth = check.auth;

router.get("/prueba-follow", FollowController.pruebaFollow);
router.post("/save", auth, FollowController.save);
router.delete("/unfollow/:id", auth, FollowController.unfollow);
router.get("/following/:id?/:page?", auth, FollowController.following);
router.get("/followers/:id?/:page?", auth ,FollowController.followers);

module.exports = router