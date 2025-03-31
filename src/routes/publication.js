const express = require("express");
const router = express.Router();
const PublicController = require ("../controller/publication");
const check = require("../middlewares/auth");
const multer = require("multer");

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, './src/image/publication');
    },

    filename: function(req, file, cb) {
        cb(null, "users" + Date.now() + file.originalname);
    }
});

const upload = multer({ storage: storage});

const optionalFileUpload = (req, res, next) => {
    upload.single("file0")(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                status: "error",
                message: err.message
            });
        }
        next();
    });
};

const auth = check.auth;

router.get("/prueba-publication", PublicController.pruebaPublication);
router.post("/save", auth, optionalFileUpload, PublicController.save);
router.get("/detail/:id", auth, PublicController.detail);
router.delete("/remove/:id", auth, PublicController.remove);
router.get("/detailUser/:user?/:page?", auth, PublicController.publicationUser);
router.post("/uploadFile/:id", [auth, upload.single("file0")], PublicController.uploadFile);
router.get("/media/:file", auth, PublicController.media);
router.get("/feed/:page", auth, PublicController.feed);

module.exports = router