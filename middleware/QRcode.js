const QRCode = require('qrcode')

// Creating the data

function genrateQRcode(){
let data = {
   link:"https://g.co/kgs/FYJo4g"
}

// Converting the data into String format
let stringdata = JSON.stringify(data)

// Print the QR code to terminal
QRCode.toString(stringdata, { type: 'terminal' },
    function (err, QRcode) {

        if (err) return console.log("error occurred")

        // Printing the generated code
        console.log("QRcode>>>>>>>>>>>>>",QRcode)
    })

// Converting the data into base64
QRCode.toDataURL(stringdata, function (err, code) {
    if (err) return console.log("error occurred")

    // Printing the code
    console.log("code>>>>>>>>>>>>>>>",code)
})}

module.exports = genrateQRcode;