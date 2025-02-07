const express = require("express");
const router = express.Router();
const FollowCOntroller = require ("../controller/follow");

router.get("/prueba-follow", FollowCOntroller.pruebaFollow)

module.exports = router