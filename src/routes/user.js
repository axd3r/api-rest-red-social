const express = require("express");
const router = express.Router();
const UserController = require ("../controller/user");
const check = require("../middlewares/auth");

const auth = check.auth;

router.get("/prueba-usuario", auth, UserController.pruebaUser);
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/profile/:query", auth, UserController.profile);
router.get("/list/:page", auth, UserController.list);
router.put("/update", auth, UserController.update);

module.exports = router