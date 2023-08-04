const Joi = require('joi');
const passwordComplexity = require("joi-password-complexity");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const hbs = require('nodemailer-express-handlebars')
const path = require('path');
const localStorage = require("localStorage");
var base64url = require('base64url');
var crypto = require('crypto');
const QRCode = require('qrcode')
const { v4: uuidv4 } = require('uuid');
var base64ToImage = require('base64-to-image');
var FCM = require('fcm-node');
const { registerUser, fetchUserByToken, fetch_fcm, share, fetchUserBy_Id_1, deleteUserBy_Id, updateFCM, addnotification, updateplan, updatePassword, fetchUserByEmail, updateUser, updateToken, fetchUserByActToken, updateUserByActToken, fetchUserById, fetchUserBy_Id, updateUserById } = require('../models/users');
const { response } = require('..');
const { number } = require('joi');


const baseURL = "http://159.89.248.34:3000/profile/"
const baseurl = "http://159.89.248.34:3000/profile/"
const baseurl_QR = "http://159.89.248.34:3000/user_QR_code/"


function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}



const saltRounds = 10;

const complexityOptions = {
    min: 8,
    max: 250,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
};

function betweenRandomNumber(min, max) {
    return Math.floor(
        Math.random() * (max - min + 1) + min
    )
}

function generateToken() {
    var length = 6,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
};

var transporter = nodemailer.createTransport({
    // service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    // secure: true,
    auth: {
        user: 'stuffyclub1@gmail.com',
        pass: 'zojmuvflsirkcvbl'
    }
});

const handlebarOptions = {
    viewEngine: {

        partialsDir: path.resolve(__dirname + '/view/'),
        defaultLayout: false,
    },
    viewPath: path.resolve(__dirname + '/view/'),
};

transporter.use('compile', hbs(handlebarOptions))

exports.signUp = (async (req, res) => {
    try {
        const { full_name, phone_number, email, password } = req.body;
        // const uniqueId = uuidv4();
        const uniqueId = crypto.randomBytes(16).toString('hex');
        // console.log(uniqueId);
        const act_token = uniqueId
        // console.log("uniqueId>>>>>>",uniqueId)

        const schema = Joi.alternatives(
            Joi.object({
                full_name: [Joi.string().empty().required()],
                phone_number: [Joi.number().empty().required(), Joi.string().empty().required],
                email: [Joi.string().min(5).max(255).email({ tlds: { allow: false } }).lowercase().required()],
                // password: passwordComplexity(complexityOptions),
                password: Joi.string().min(8).max(15).required().messages({
                    "any.required": "{{#label}} is required!!",
                    "string.empty": "can't be empty!!",
                    "string.min": "minimum 8 value required",
                    "string.max": "maximum 15 values allowed",
                }),
            })
        )
        const result = schema.validate({ full_name, phone_number, email, password });
        if (result.error) {
            const message = result.error.details.map((i) => i.message).join(",");
            return res.json({
                message: result.error.details[0].message,
                error: message,
                missingParams: result.error.details[0].message,
                status: 400,
                success: false,
            });
        }
        else {
            const data = await fetchUserByEmail(email);
            if (data.length !== 0) {
                return res.json({
                    success: false,
                    message: "Already have account, Please Login",
                    status: 400
                });
            }
            else {
                if (!result.error) {
                    let mailOptions = {
                        from: 'stuffyclub1@gmail.com',
                        to: email,
                        subject: 'Activate Account',
                        template: 'signupemail',
                        context: {
                            href_url: `http://159.89.248.34:3000/verifyUser/` + `${act_token}`,
                            image_logo: `http://159.89.248.34:3000/image/logo.png`,
                            msg: `Please click below link to activate your account.`

                        }
                    };
                    transporter.sendMail(mailOptions, async function (error, info) {
                        if (error) {
                            return res.json({
                                success: false,
                                status: 400,
                                message: 'Mail Not delivered'
                            });
                        }
                        else {
                            // Creating the data
                            let data = {
                                user_name: full_name,
                                phone_number: phone_number,
                                email: email,
                            }
                            // console.log("data>>>>>")

                            // Converting the data into String format
                            let stringdata = JSON.stringify(data)

                            // Print the QR code to terminal
                            var qrcode = QRCode.toString(stringdata, { type: 'terminal' },
                                function (err, QRcode) {

                                    if (err) return console.log("error occurred")

                                    // Printing the generated code
                                    // console.log("QRcode>>>>>>>>>>>>>",QRcode)
                                })

                            // Converting the data into base64
                            var QR_code_1 = QRCode.toDataURL(stringdata, async function (err, code) {
                                if (err) return console.log("error occurred")
                                var QR_code_12 = code
                                // Printing the code
                                // console.log("code>>>>>>>>>>>>>>>",code)
                                // console.log("QR_code_1>>>>>>>>>>>>>",QR_code_1)  
                                // console.log("QR_code_12>>>>>>>>>>>>>",QR_code_12)
                                // console.log("qrcode>>>>>>>>>>>>>",qrcode)
                                var base64Str = QR_code_12;
                                var path = "public/user_QR_code/";
                                // var optionalObj = {'fileName': 'imageFileName', 'type':'png'};

                                base64ToImage(base64Str, path);

                                // Note base64ToImage function returns imageInfo which is an object with imageType and fileName.
                                var image_Info = base64ToImage(base64Str, path);
                                // console.log("image_Imfo>>>>>>>>>",image_Info.fileName)


                                const randomString = generateRandomString(10);
                                console.log("randomString", generateRandomString)

                                const hash = await bcrypt.hash(password, saltRounds);
                                const user = {
                                    full_name: full_name,
                                    phone_number: phone_number,
                                    email: email,
                                    password: hash,
                                    show_password: password,
                                    act_token: act_token,
                                    // QR_code_image: image_Info.fileName,
                                    // QR_code: randomString, // Generates a random string with 10 characters
                                    profile_image: "",
                                    token: "",
                                    fcm_token: "",


                                }
                                const create_user = await registerUser(user);
                                return res.json({
                                    success: true,
                                    message: "Please verify your account with the email we have sent to your email address.",
                                    status: 200,
                                });
                            })
                        }
                    });
                }
                else {
                    return res.json({
                        message: "user add failed",
                        status: 400,
                        success: false
                    });
                }
            }
        }
    }
    catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: "Internal server error",
            status: 500
        })
    }
});

exports.verifyUser = (async (req, res) => {
    try {
        const { token, act_token } = req.body;
        const schema = Joi.alternatives(
            Joi.object({
                token: Joi.string().empty().required().messages({
                    "string.required": "token is required",
                }),
                act_token: Joi.string().empty().required().messages({
                    "string.required": "act_token is required",
                })
            })
        );
        const result = schema.validate({ token, act_token });
        if (result.error) {
            const message = result.error.details.map((i) => i.message).join(",");
            return res.json({
                message: result.error.details[0].message,
                error: message,
                missingParams: result.error.details[0].message,
                status: 400,
                success: false,
            });
        }
        else {
            const data = await fetchUserByActToken(act_token)
            if (data.length !== 0) {
                let datas = {
                    act_token: '',
                    status: true,
                };

                const result = await updateUserByActToken(token, datas.act_token, datas.status, data[0]?.id);
                return res.json({
                    success: true,
                    message: "User verify successfull please login",
                    status: 200
                })
            }
            else {
                return res.json({
                    success: false,
                    message: "User is not valid please try again",
                    status: 400
                })
            }
        }
    }
    catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: "Internal server error",
            status: 500
        })
    }
});

exports.verifyUserEmail = (async (req, res) => {
    try {
        const act_token = req.params.id;
        const token = generateToken();
        if (!act_token) {
            const message = result.error.details.map((i) => i.message).join(",");
            return res.json({
                message: result.error.details[0].message,
                error: message,
                missingParams: result.error.details[0].message,
                status: 400,
                success: false,
            });
        }
        else {
            console.log("act_token, token>>>>>>>>>>>>>", act_token, token)
            const data = await fetchUserByActToken(act_token)
            console.log(req.params.token)
            if (data.length !== 0) {
                let datas = {
                    act_token: '',
                    status: true,
                };
                const hash = await bcrypt.hash(token, saltRounds);
                const result = await updateUserByActToken(hash, datas.act_token, datas.status, data[0]?.id);
                // console.log("result>>>>>>>>", result)
                if (result.affectedRows) {
                    res.sendFile(__dirname + '/view/verify.html');
                }
                else {
                    res.sendFile(__dirname + '/view/notverify.html');
                }
            }
            else {
                res.sendFile(__dirname + '/view/notverify.html');
            }
        }
    }
    catch (error) {
        console.log(error);
        res.send(`<div class="container">
        <p>404 Error, Page Not Found</p>
        </div> `);
    }
});

exports.loginUser = (async (req, res) => {
    try {
        const { email, password, fcm_token, device_type } = req.body;
        const token = generateToken();
        const schema = Joi.alternatives(
            Joi.object({
                email: [Joi.string().empty().required()],
                fcm_token: [Joi.required()],
                device_type: [Joi.number().empty().required()],
                // email: [Joi.string().empty().required()],
                // password: passwordComplexity(complexityOptions),
                password: Joi.string().min(8).max(15).required().messages({
                    "any.required": "{{#label}} is required!!",
                    "string.empty": "can't be empty!!",
                    "string.min": "minimum 8 value required",
                    "string.max": "maximum 15 values allowed",
                }),
            })
        );
        const result = schema.validate({ email, password, fcm_token, device_type });
        if (result.error) {
            const message = result.error.details.map((i) => i.message).join(",");
            return res.json({
                message: result.error.details[0].message,
                error: message,
                missingParams: result.error.details[0].message,
                status: 400,
                success: false,
            });
        }
        else {
            const results_1 = await updateFCM(fcm_token, device_type, email);
            const data = await fetchUserByEmail(email);
            console.log("data", data)
            if (data.length !== 0) {
                if (data[0]?.act_token === "") {
                    if (email === data[0].email) {
                        const match = bcrypt.compareSync(password, data[0]?.password);
                        if (match) {
                            const toke = jwt.sign(
                                {
                                    data: {
                                        id: data[0].id,
                                    },
                                },
                                'SecretKey',
                                { expiresIn: "1d" }
                            );
                            bcrypt.genSalt(saltRounds, async function (err, salt) {
                                bcrypt.hash(token, salt, async function (err, hash) {
                                    if (err) throw err;
                                    const results = await updateToken(hash, email);
                                    // const results_1 = await updateFCM(fcm_token, device_type, email);
                                    return res.json({
                                        success: true,
                                        message: "Login Successfully",
                                        token: toke,
                                        data: data,
                                        status: 200
                                    });
                                });
                            });
                        }
                        else {
                            return res.json({
                                success: false,
                                message: "email or password not matches",
                                status: 400,

                            });
                        }

                    } else {

                        return res.json({
                            message: "Account not found. Please check your details",
                            status: 400,
                            success: false
                        })
                    }
                }
                else {
                    return res.json({
                        message: "Please verify the user",
                        status: 400,
                        success: false
                    })
                }
            }
            else {
                return res.json({
                    success: false,
                    message: "User Not Found Please Register",
                    status: 400,
                    token: "",
                    data: [],
                });
            }
        }
    }
    catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: "Internal server error",
            status: 500
        })
    }
});

exports.resetPassword = (async (req, res) => {
    const { user_id, password } = req.body;
    try {
        const schema = Joi.alternatives(
            Joi.object({
                password: Joi.string().min(5).max(10).required().messages({
                    "any.required": "{{#label}} is required!!",
                    "string.empty": "can't be empty!!",
                    "string.min": "minimum 5 value required",
                    "string.max": "maximum 10 values allowed",
                }),
                user_id: Joi.number().empty().required().messages({
                    "number.empty": "id can't be empty",
                    "number.required": "id  is required",
                }),

            })
        );
        const result = schema.validate(req.body);

        if (result.error) {
            const message = result.error.details.map((i) => i.message).join(",");
            return res.json({
                message: result.error.details[0].message,
                error: message,
                missingParams: result.error.details[0].message,
                status: 400,
                success: false,
            });
        }
        else {

            const result = await fetchUserById(user_id);
            if (result.length != 0) {
                const hash = await bcrypt.hash(password, saltRounds);
                const result2 = await updateUserbyPass(hash, user_id);

                if (result2) {
                    return res.json({
                        success: true,
                        status: 200,
                        message: "Password Changed Successfully"
                    })
                } else {
                    return res.json({
                        success: true,
                        status: 200,
                        message: "Some error occured. Please try again"
                    })
                }

            } else {

                return res.json({
                    success: true,
                    status: 200,
                    message: "User Not Found"
                })

            }
        }
    } catch (error) {
        console.log(error)
        return res.json({
            success: false,
            message: "Internal server error",
            status: 500

        })
    }
})

function randomStringAsBase64Url(size) {
    return base64url(crypto.randomBytes(size));
}

exports.forgotPassword = (async (req, res) => {
    try {
        const { email } = req.body;
        const schema = Joi.alternatives(
            Joi.object({
                email: [Joi.string().empty().required()],
            })
        )
        const result = schema.validate({ email });
        if (result.error) {
            const message = result.error.details.map((i) => i.message).join(",");
            return res.json({
                message: result.error.details[0].message,
                error: message,
                missingParams: result.error.details[0].message,
                status: 400,
                success: false,
            });
        }
        else {
            const data = await fetchUserByEmail(email);
            if (data.length !== 0) {
                const genToken = randomStringAsBase64Url(20);
                await updateUser(genToken, email);

                const result = await fetchUserByEmail(email);

                let token = result[0].token;

                if (!result.error) {
                    let mailOptions = {
                        from: 'stuffyclub1@gmail.com',
                        to: req.body.email,
                        subject: 'Forget Password',
                        template: 'forget_template',
                        context: {
                            href_url: `http://159.89.248.34:3000/verifyPassword/${token}`,
                            msg: `Please click below link to change password.`
                        }
                    };
                    transporter.sendMail(mailOptions, async function (error, info) {
                        if (error) {
                            return res.json({
                                success: false,
                                message: error
                            })
                        } else {
                            return res.json({
                                success: true,
                                message: "Thank you, You will receive an e-mail in few minutes."
                            })
                        }
                    });
                }
            }
            else {
                return res.json({
                    success: false,
                    message: "Email not found",
                    status: 400
                })
            }
        }
    }
    catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: "Internal server error",
            status: 500
        })
    }
});


exports.verifyPassword = (async (req, res) => {
    try {
        const id = req.params.token;

        console.log(id)

        if (!id) {
            return res.status(400).send("Invalid link");
        }
        else {
            const result = await fetchUserById(id);
            const token = result[0]?.token;
            if (result.length !== 0) {
                localStorage.setItem('vertoken', JSON.stringify(token));
                res.render(path.join(__dirname, '/view/', 'forgetPassword.ejs'), { msg: "" });
            }
            else {
                res.render(path.join(__dirname, '/view/', 'forgetPassword.ejs'), { msg: "This User is not Registered" });

                //     res.send(`<div class="container">
                //         <p> This User is not Registered </p>
                // </div>`);
            }
        }
    }
    catch (err) {
        console.log(err);
        res.send(`<div class="container">
          <p>404 Error, Page Not Found</p>
          </div> `);
    }
});


exports.changePassword = (async (req, res) => {
    try {
        const { password, confirm_password } = req.body;
        const token = JSON.parse(localStorage.getItem('vertoken'));
        const schema = Joi.alternatives(
            Joi.object({
                // password: passwordComplexity(complexityOptions),
                // confirm_password: passwordComplexity(complexityOptions),

                password: Joi.string().min(8).max(10).required().messages({
                    "any.required": "{{#label}} is required!!",
                    "string.empty": "can't be empty!!",
                    "string.min": "minimum 8 value required",
                    "string.max": "maximum 10 values allowed",
                }),
                confirm_password: Joi.string().min(8).max(10).required().messages({
                    "any.required": "{{#label}} is required!!",
                    "string.empty": "can't be empty!!",
                    "string.min": "minimum 8 value required",
                    "string.max": "maximum 10 values allowed",
                }),
            })
        )
        const result = schema.validate({ password, confirm_password });
        if (result.error) {
            const message = result.error.details.map((i) => i.message).join(",");
            res.render(path.join(__dirname + '/view/', 'forgetPassword.ejs'), {
                message: result.error.details[0].message,
                error: message,
                missingParams: result.error.details[0].message,
                msg: message
            });

        }
        else {
            if (password == confirm_password) {


                const data = await fetchUserByToken(token);

                if (data.length !== 0) {
                    const hash = await bcrypt.hash(password, saltRounds);
                    const result2 = await updatePassword(hash, token);
                    // console.log("result2",result2)
                    if (result2) {
                        res.sendFile(path.join(__dirname + '/view/message.html'), { msg: "" });
                    }
                    else {
                        res.render(path.join(__dirname, '/view/', 'forgetPassword.ejs'), { msg: "Internal Error Occured, Please contact Support." });
                    }
                }
                else {
                    return res.json({
                        message: "User not found please register your account",
                        success: false,
                        status: 400,
                    })
                }
            }
            else {
                res.render(path.join(__dirname, '/view/', 'forgetPassword.ejs'),
                    { msg: "Password and Confirm Password do not match" });
            }
        }
    }
    catch (error) {
        console.log(error);

        res.render(path.join(__dirname, '/view/', 'forgetPassword.ejs'),
            { msg: "Internal server error" })
        // return res.json({
        //     success: false,
        //     message: "Internal server error",
        //     status: 500
        // })
    }
});


exports.myProfile = (async (req, res) => {
    try {
        const { id } = req.body;
        console.log(id)
        const schema = Joi.alternatives(
            Joi.object({
                id: Joi.number().required()
            })
        )
        const result = schema.validate({ id });
        if (result.error) {
            const message = result.error.details.map((i) => i.message).join(",");
            return res.json({
                message: result.error.details[0].message,
                error: message,
                missingParams: result.error.details[0].message,
                status: 400,
                success: false,
            });
        }
        else {
            const data = await fetchUserBy_Id(id);



            await Promise.all(data.map(async (item) => {

                if (item.profile_image) {
                    item.profile_image = baseurl + item.profile_image;
                }


                if (item.QR_code_image) {
                    item.QR_code_image = baseurl_QR + item.QR_code_image;
                }
            }));
            // console.log("profile_image",baseURL+data[0].profile_image)
            if (data.length !== 0) {
                return res.json({
                    status: 200,
                    success: true,
                    message: "User Found Successfull",
                    data: data,
                });
            }
            else {
                return res.json({
                    status: 400,
                    success: false,
                    message: "User Not Found",
                    data: [],
                });
            }
        }
    }
    catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: "Internal server error",
            status: 500
        })
    }
});


exports.editProfile = (async (req, res) => {
    try {

        const { full_name, phone_number, user_id, status, Membership_Plan } = req.body;
        const schema = Joi.alternatives(
            Joi.object({
                full_name: [Joi.number().empty(), Joi.string().empty()],
                phone_number: [Joi.number().optional().allow(''), Joi.string().optional().allow('')],
                user_id: [Joi.number().empty(), Joi.string().empty()],
                user_id: [Joi.number().empty(), Joi.string().empty()],
                status: [Joi.number().empty(), Joi.string().empty()],
                Membership_Plan: [Joi.number().empty(), Joi.string().empty()],
            })
        );
        const result = schema.validate({ full_name, phone_number, user_id, status, Membership_Plan });
        if (result.error) {
            const message = result.error.details.map((i) => i.message).join(",");
            return res.json({
                message: result.error.details[0].message,
                error: message,
                missingParams: result.error.details[0].message,
                status: 200,
                success: true,
            });
        } else {

            let filename = '';
            if (req.file) {
                const file = req.file
                filename = file.filename;
            }
            const userInfo = await fetchUserBy_Id(user_id);
            // console.log("userInfo>>>>>>>>>>", userInfo)
            if (userInfo.length !== 0) {
                let user = {
                    full_name: full_name ? full_name : userInfo[0].full_name,
                    status: status ? status : userInfo[0].status,
                    phone_number: phone_number ? phone_number : userInfo[0].phone_number,
                    profile_image: filename ? filename : userInfo[0].profile_image,
                    Membership_Plan: Membership_Plan ? Membership_Plan : userInfo[0].Membership_Plan,

                };
                const result = await updateUserById(user, user_id);
                const userInfo_1 = await fetchUserBy_Id(user_id);
                // console.log("userInfo_1>>>>>>>>>>",userInfo_1.RowDataPacket[0].Membership_Plan)
                // console.log("result>>>>>>", result)
                await Promise.all(userInfo_1.map(async (item) => {

                    if (item.profile_image) {
                        item.profile_image = baseurl + item.profile_image;
                    }


                    if (item.QR_code_image) {
                        item.QR_code_image = baseurl_QR + item.QR_code_image;
                    }
                }));

                if (result.affectedRows) {
                    return res.json({
                        message: "update user successfully",
                        profile_image: filename,
                        updated_profile: userInfo_1,
                        status: 200,
                        success: true
                    })
                }
                else {
                    return res.json({
                        message: "update user failed ",
                        status: 200,
                        success: true
                    })
                }
            }
            else {
                return res.json({
                    messgae: "data not found",
                    profile_image: "",
                    updated_profile: [],
                    status: 200,
                    success: true
                })
            }
        }
    } catch (err) {
        console.log(err);

        return res.json({
            success: false,
            message: "Internal server error",
            error: err,
            status: 500
        })
    }

});


exports.updateplan = (async (req, res) => {
    try {
        const { id, Membership_Plan } = req.body;
        console.log(id)
        const schema = Joi.alternatives(
            Joi.object({
                id: Joi.number().required()
            })
        )
        const result = schema.validate({ id });
        if (result.error) {
            const message = result.error.details.map((i) => i.message).join(",");
            return res.json({
                message: result.error.details[0].message,
                error: message,
                missingParams: result.error.details[0].message,
                status: 400,
                success: false,
            });
        }
        else {
            const data = await updateplan(Membership_Plan, id);

            const serverKey = "AAAAb1yACDc:APA91bHPa6DP2pjvWnRiQgq-XcZqLeq3r8zuJ1XzT2BlvEQH0lXJVKYlh5RVJQqjeOd0p7Im7l68n39c1NAULnzJpRhRwH7HOl9OZU7DbI4a5KJB2DXMJ1jGtj6u_9e5Xp-enXgYetuW"; // replace with your FCM server key
            const fcm = new FCM(serverKey);

            const Get_fcm = await fetch_fcm(id)
            // console.log("Get_fcm>>>>>>>>>>>>>", Get_fcm)
            // console.log("=============>>>>>>>>>", Get_fcm[0].fcm_token)
            // console.log("Get_fcm>>!!!!!!!!!!!", Get_fcm.RowDataPacket.fcm_token)


            const message = {
                to: Get_fcm[0].fcm_token,
                notification: {
                    user_id: id,
                    title: "Plan upgrade",
                    body: "Plan has been upgrade",
                    icon: 'icon_name_here',
                    click_action: 'notification_click_action_here',
                    sound: "default",
                    icon: "fcm_push_icon",
                },
            };
            const send_notification = {
                user_id: id,
                body: "Plan has been upgrade",
                notification_type: "upgrade plan"
            }

            const result = await addnotification(send_notification)
            // console.log("result>>>>>>>>>>>>>>", result)
            // })
            fcm.send(message, (err, response) => {
                if (err) {
                    res.json({
                        message: "Error",
                        notification_Error: err,
                        success: false,
                        status: 500
                    });
                } else {
                    res.json({
                        message: "Congratulations! your premium plan purchase activated.",
                        notification_status: response,
                        success: true,
                        status: 200
                    });
                }
            });
        }
    }
    catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: "Internal server error",
            status: 500
        })
    }
});

exports.sharing = (async (req, res) => {
    try {
        const { sender_id, reciver_id, QR_code } = req.body;
        // console.log(id)
        const schema = Joi.alternatives(
            Joi.object({
                sender_id: Joi.string().required(),
                reciver_id: Joi.string().required(),
                QR_code: Joi.string().required()
            })
        )
        const result = schema.validate({ sender_id, reciver_id, QR_code });
        if (result.error) {
            const message = result.error.details.map((i) => i.message).join(",");
            return res.json({
                message: result.error.details[0].message,
                error: message,
                missingParams: result.error.details[0].message,
                status: 400,
                success: false,
            });
        }
        else {

            let filename = '';
            if (req.file) {
                const file = req.file
                filename = file.filename;
            }

            const shareing = {
                sender_id: sender_id,
                reciver_id: reciver_id,
                QR_code: QR_code,
                QR_code_image: filename,


            }

            const share_1 = await share(shareing);



            res.json({
                message: "App is successfully shared",
                notification_status: response,
                success: true,
                status: 200
            });
        }

    }
    catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: "Internal server error",
            status: 500
        })
    }
});

exports.delete_myProfile = (async (req, res) => {
    try {
        const { user_id } = req.body;
        // console.log(id)
        const schema = Joi.alternatives(
            Joi.object({
                user_id: Joi.number().required()
            })
        )
        const result = schema.validate({ user_id });
        if (result.error) {
            const message = result.error.details.map((i) => i.message).join(",");
            return res.json({
                message: result.error.details[0].message,
                error: message,
                missingParams: result.error.details[0].message,
                status: 400,
                success: false,
            });
        }
        else {


            const user_info = await fetchUserBy_Id_1(user_id);

            if (user_info.length != 0) {
                const data = await deleteUserBy_Id(user_id);


                // console.log("profile_image",baseURL+data[0].profile_image)
                return res.json({
                    message: "User delete Successfull",
                    status: 200,
                    success: true,
                });
            }
            else {
                return res.json({
                    message: "User Not Found",
                    status: 400,
                    success: false,
                });
            }
        }
    }
    catch (error) {
        console.log(error);
        return res.json({
            success: false,
            message: "Internal server error",
            status: 500
        })
    }
});




