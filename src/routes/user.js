const express = require("express");
const router = express.Router();
const UserController = require ("../controller/user");
const check = require("../middlewares/auth");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './src/image/user/');
    },

    filename: function(req, file, cb) {
        cb(null, "users" + Date.now() + file.originalname);
    }
})

const subidas = multer({ storage: storage});

const auth = check.auth;

router.get("/prueba-usuario", auth, UserController.pruebaUser);
router.post("/register", UserController.register);
router.post("/login", UserController.login);
router.get("/profile/:query", auth, UserController.profile);
router.get("/list/:page", auth, UserController.list);
router.put("/update", auth, UserController.update);
router.post("/subir-imagen", [auth, subidas.single("file0")], UserController.upload);
router.get("/avatar/:file", auth, UserController.avatar);

module.exports = router