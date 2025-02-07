const express = require("express");
const router = express.Router();
const PublicController = require ("../controller/publication");

router.get("/prueba-publication", PublicController.pruebaPublication)

module.exports = router