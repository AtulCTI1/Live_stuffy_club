const multer = require('multer')
const path = require('path')
const hash = require('random-hash');
const { v4: uuidv4 } = require('uuid');

const storage_sprites = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/sprites/");
    },
    filename: (req, file, cb) => {
        let temp = file.originalname.replace(/\s+/g, '').split('.'); //temp[0] +
        const filename = hash.generateHash({ length: 10 }) + '.' + temp[1]
        const uniqueFilename = uuidv4(); // Generate a unique filename
        //cb(null, filename);
        cb(null, uniqueFilename + path.extname(file.originalname))
    }

    // filename: (req, file, cb) => {
    //     const uniqueFilename = uuidv4(); // Generate a unique filename
    //     cb(null, uniqueFilename + '.' ); // Use a unique filename with original file extension
    // }

});


const upload_sprites = multer({ storage: storage_sprites });

module.exports = upload_sprites
