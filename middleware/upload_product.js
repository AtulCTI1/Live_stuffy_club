const multer = require('multer')
const path = require('path')
const hash = require('random-hash');
const { v4: uuidv4 } = require('uuid');

// function generateRandomString(length) {
//     const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     let result = '';
//     for (let i = 0; i < length; i++) {
//         result += characters.charAt(Math.floor(Math.random() * characters.length));
//     }
//     return result;
// }
const storage_product = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/product/");
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


const upload_product = multer({ storage: storage_product });

module.exports = upload_product
