const multer = require('multer')
const path = require('path')
const hash = require('random-hash');


const storage_category = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/category/");
    },
    filename: (req, file,cb) => {
             let temp = file.originalname.replace(/\s+/g, '').split('.'); //temp[0] +
                const filename = hash.generateHash({ length: 10 }) + '.' + temp[1]
                //cb(null, filename);
                cb(null, new Date().getTime() + path.extname(file.originalname))
            }
});

const upload_category = multer({ storage: storage_category });
module.exports = upload_category