const express = require("express");
const router = express.Router();
const UserController = require ("../controller/user");
const check = require("../middlewares/auth");

const auth = check.auth;

router.get("/prueba-usuario", auth, UserController.pruebaUser);
router.post("/register", auth, UserController.register);
router.post("/login", UserController.login);

module.exports = router