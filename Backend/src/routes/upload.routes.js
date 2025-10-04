const express= require("express");
const router=express.Router();
const {authMiddleware} = require("../middlewares/auth.middleware");
const multer=require("multer");
const uploadFile = require("../controllers/UploadFileController/uploadfile.controller");
const upload=multer({
    storage:multer.memoryStorage()
});


router.post("/",authMiddleware,upload.single("file"),uploadFile)

module.exports=router;