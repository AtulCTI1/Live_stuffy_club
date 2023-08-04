const multer = require('multer')
const path = require('path')
const hash = require('random-hash');


const storage_share_QR_code = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "public/share_QR_code/");
    },
    filename: (req, file,cb) => {
             let temp = file.originalname.replace(/\s+/g, '').split('.'); //temp[0] +
                const filename = hash.generateHash({ length: 10 }) + '.' + temp[1]
                //cb(null, filename);
                cb(null, new Date().getTime() + path.extname(file.originalname))
            }
});

const upload_share_QR_code = multer({ storage: storage_share_QR_code });
module.exports = upload_share_QR_code