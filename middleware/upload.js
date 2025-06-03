const multer = require('multer');
const path = require('path');

const storagePhotos = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/loadPhotos');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now()+'-'+Math.round(Math.random()*1E9);
        cb(null, uniqueSuffix+path.extname(file.originalname));
    }
});

const uploadPhotos = multer({
    storage: storagePhotos,
    limits: { fileSize: 10*1024*1024 },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error ('Разрешены только изображения (jpeg, jpg, png)'));
        }
    }
});


const storageComplexPhotos = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'public/loadComplexPhotos');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadComplexPhotos = multer({
    storage: storageComplexPhotos,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: function (req, file, cb) {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        } else {
            cb(new Error('Разрешены только изображения (jpeg, jpg, png)'));
        }
    }
});

module.exports = { uploadPhotos, uploadComplexPhotos };