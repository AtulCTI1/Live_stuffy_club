const Joi = require("joi");
const QRCode = require("qrcode");
var FCM = require("fcm-node");
var request = require("request");
var fs = require("fs");
const removeBg = require("remove.bg");
var base64ToImage = require("base64-to-image");
// var serverKey = "AAAALnQ1O48:APA91bHaiZRbzi7v6xf57TOnvdm5mG4ioK4_f35UMlaur-1pXbJND2D5B4DXf6ls9uA-z6xO0qG1us4YigMgNX6ypuWOsuAfNVlE56JTtoL2dTFGU_3xJIC1_EfV-VjUmSkKxfnV6n4K"; // replace with your FCM server key
const stripe = require("stripe")(
    "sk_test_51N1YKlFKunSOaPwDgbiGYdeJ2xaBqgiu3sgxpKgACmblRbvQa0f0WfoPnE6soknAochykJentKkVzwoCS5lIFXMw00E4WOEFZv"
);

const {
    addCategory,
    fetchCategory,
    stripe_product,
    stripe_price,
    Get_Purchase_Qrcode,
    User_info,
    addQRcode,
    getmyfriend_1,
    delete_Product_images,
    delete_gallery_Product,
    fetchProduct_gallery,
    delete_Product,
    user_info_2,
    user_info_1,
    fetchProduct_1,
    update_Product,
    Get_all_users_1,
    all_users,
    getmyfriend_A,
    getmyfriend_2,
    delete_cancel_request,
    all_users_without_friend,
    check_sprites,
    update_friend_request,
    user_info,
    getuser_freinds,
    fetch_shareing_code,
    share_gallery,
    get_sprite_1,
    getsprites,
    get_sprite,
    fetch_friend_from_gallery,
    getmyfriend,
    get_sprite_id,
    Get_all_users,
    addfriend,
    updateQR_product,
    addtosprites,
    count_product,
    getnewest_stuffy,
    getexclusive_stuffy,
    getgallery,
    getProductbyuserid,
    fetchproductimage_1,
    addtogallery,
    send_request,
    fetchproductimage,
    getAllCategory,
    addProduct,
    fetchProduct,
    getProductbyid,
    fetchproductBycategory,
    addProduct_images,
    fetch_fcm,
    fetch_fcm_1,
    cancel_request,
    friend_request,
    getAllProduct,
    fetchFCM_token,
    get_gallery_id,
    addProduct_images_1,
    fetch_user,
    addnotification,
} = require("../models/product");
const { ifError } = require("assert");

function generateRandomString(length) {
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

exports.addProductCategory = async (req, res) => {
    try {
        const { category_name, file } = req.body;

        const schema = Joi.alternatives(
            Joi.object({
                category_name: [Joi.string().empty().required()],
            })
        );

        const result = schema.validate({ category_name });

        if (result.error) {
            const message = result.error.details.map((i) => i.message).join(",");
            return res.json({
                message: result.error.details[0].message,
                error: message,
                missingParams: result.error.details[0].message,
                status: 400,
                success: false,
            });
        } else {
            const data = await fetchCategory(category_name);
            if (data.length !== 0) {
                return res.json({
                    message: "Category already added",
                    status: 400,
                    success: false,
                });
            } else {
                let filename = "";
                if (req.file) {
                    const file = req.file;
                    filename = file.filename;
                }
                const user = {
                    category_name: category_name,
                    image: filename,
                    // category_name: category_name ? category_name : user[0].category_name,
                    // image: filename ? filename : user[0].image,
                };
                const datas = await addCategory(user);
                if (datas.affectedRows) {
                    return res.json({
                        message: "Category added successfull",
                        success: true,
                        status: 200,
                    });
                } else {
                    return res.json({
                        message: "Category Not Added",
                        success: false,
                        status: 400,
                    });
                }
            }
        }
    } catch (error) {
        console.log(error);
        return res.json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

exports.getProductCategory = async (req, res) => {
    try {
        const data = await getAllCategory();
        if (data.length !== 0) {
            return res.json({
                message: "Category Found successfull",
                success: true,
                status: 200,
                data: data,
            });
        } else {
            return res.json({
                message: "No Data Found",
                success: false,
                status: 400,
                data: [],
            });
        }
    } catch (error) {
        console.log(error);
        return res.json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

exports.getProducts = async (req, res) => {
    try {
        const data = await getAllProduct();
        const baseurl = "http://159.89.248.34:3000/QR_code(product)/";
        await Promise.all(
            data.map(async (item) => {
                let product_images = await fetchproductimage(item.id);
                item.images = product_images;

                if (item.QR_code_image) {
                    item.QR_code_image = baseurl + item.QR_code_image;
                }
            })
        );

        if (data.length !== 0) {
            return res.json({
                message: "Products Found successfull",
                success: true,
                status: 200,
                data: data,
            });
        } else {
            return res.json({
                message: "No Data Found",
                success: false,
                status: 400,
                data: [],
            });
        }
    } catch (error) {
        console.log(error);
        return res.json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

exports.getproductBycategory = async (req, res) => {
    try {
        const { category_id, user_id } = req.body;

        const schema = Joi.alternatives(
            Joi.object({
                category_id: [Joi.number().empty().required()],
                user_id: [Joi.number().empty().required()],
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
        } else {
            const data = await fetchproductBycategory(category_id);
            const baseurl = "http://159.89.248.34:3000/QR_code(product)/";
            if (data.length !== 0) {
                await Promise.all(
                    data.map(async (item) => {
                        let product_images = await fetchproductimage(item.id);
                        item.images = product_images;

                        let product_id = item.id;
                        const purchase_qrcode = await Get_Purchase_Qrcode(
                            product_id,
                            user_id
                        );
                        // console.log("purchase_qrcode>>>>>>>>>", purchase_qrcode)

                        if (purchase_qrcode != 0) {
                            if (item.QR_code_image) {
                                item.QR_code_image = baseurl + purchase_qrcode[0].QR_code;
                                item.QR_purches_status = 1;
                            }
                        } else {
                            if (item.QR_code_image) {
                                item.QR_code_image =
                                    "http://159.89.248.34:3000/QR_code(product)/BlurQR.jpeg";
                            }
                        }
                    })
                );
                return res.json({
                    message: "successfully",
                    success: true,
                    status: 200,
                    data: data.length > 0 ? data : [],
                });
            } else {
                return res.json({
                    message: "No Data Found",
                    success: false,
                    status: 400,
                    data: [],
                });
            }
        }
    } catch (error) {
        console.log(error);
        return res.json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

exports.getProductbyid = async (req, res) => {
    try {
        const { product_id, user_id } = req.body;
        // console.log("req.body>>>>>>>", req.body)

        const schema = Joi.alternatives(
            Joi.object({
                product_id: [Joi.number().empty().required()],
                user_id: [Joi.number().empty().required()],
            })
        );
        const data = await getProductbyid(product_id);
        // console.log("data>>>>>>>>>", data)
        // console.log("data>>>>>>>>>", data[0].QR_code_image)

        const baseurl = "http://159.89.248.34:3000/QR_code(product)/";
        if (data.length !== 0) {
            await Promise.all(
                data.map(async (item) => {
                    let product_images = await fetchproductimage(item.id);
                    item.images = product_images;

                    const purchase_qrcode = await Get_Purchase_Qrcode(
                        product_id,
                        user_id
                    );
                    // console.log("purchase_qrcode>>>>>>>>>", purchase_qrcode)

                    if (purchase_qrcode != 0) {
                        if (item.QR_code_image) {
                            item.QR_code_image = baseurl + purchase_qrcode[0].QR_code;
                            item.QR_purches_status = 1;
                        }
                    } else {
                        if (item.QR_code_image) {
                            item.QR_code_image =
                                "http://159.89.248.34:3000/QR_code(product)/BlurQR.jpeg";
                        }
                    }
                })
            );
        }
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
        if (data.length !== 0) {
            return res.json({
                message: "Products Found successfull",
                success: true,
                status: 200,
                data: data,
            });
        } else {
            return res.json({
                message: "No Data Found",
                success: false,
                status: 400,
                data: [],
            });
        }
    } catch (error) {
        console.log(error);
        return res.json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

exports.getProductbyuserid = async (req, res) => {
    try {
        const { user_id } = req.body;
        // console.log("req.body>>>>>>>", req.body)

        const schema = Joi.alternatives(
            Joi.object({
                user_id: [Joi.number().empty().required()],
            })
        );
        const data = await getProductbyuserid(user_id);
        // console.log("data>>>>>>>>>", data)
        const baseurl = "http://159.89.248.34:3000/QR_code(product)/";

        if (data.length !== 0) {
            await Promise.all(
                data.map(async (item) => {
                    let product_images = await fetchproductimage(item.id);
                    item.images = product_images;

                    let product_id = item.id;
                    const purchase_qrcode = await Get_Purchase_Qrcode(
                        product_id,
                        user_id
                    );
                     console.log("purchase_qrcode>>>>>>>>>", purchase_qrcode)

                    if (purchase_qrcode.length != 0) {
                        if (item.QR_code_image) {
                            item.QR_code_image = baseurl + purchase_qrcode[0].QR_code;
                            item.QR_purches_status = 1;
                        }
                    } else {
                        if (item.QR_code_image) {
                        	 item.QR_code_image = baseurl + item.QR_code_image;
                        }
              
                    }
                    // 21/06/2023
                     item.QR_code_blur_image =
                                "http://159.89.248.34:3000/QR_code(product)/BlurQR.jpeg";
                })
            );
        }
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
        if (data.length !== 0) {
            return res.json({
                message: "Products Found successfull",
                success: true,
                status: 200,
                data: data,
            });
        } else {
            return res.json({
                message: "No Data Found",
                data: [],
                success: false,
                status: 400,
            });
        }
    } catch (error) {
        console.log(error);
        return res.json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

exports.getQRcode = async (req, res) => {
    try {
        // Creating the data
        let data = {
            link: "https://play.google.com/store/games?utm_source=apac_med&utm_medium=hasem&utm_content=Oct0121&utm_campaign=Evergreen&pcampaignid=MKT-EDR-apac-in-1003227-med-hasem-py-Evergreen-Oct0121-Text_Search_BKWS-BKWS%7CONSEM_kwid_43700065205026415_creativeid_535350509936_device_c&gclid=CjwKCAjwiOCgBhAgEiwAjv5whJeJwHwjtjgSTPpDcqmxde9g6UA6s32F5S8424ixlOsZfpvKKYyyjhoC2GcQAvD_BwE&gclsrc=aw.ds&pli=1",
        };
        // console.log("data>>>>>")

        // Converting the data into String format
        let stringdata = JSON.stringify(data);

        // Print the QR code to terminal
        var qrcode = QRCode.toString(
            stringdata,
            { type: "terminal" },
            function (err, QRcode) {
                if (err) return console.log("error occurred");
            }
        );

        console.log(">>>>>.", qrcode);

        // Converting the data into base64
        var QR_code_1 = QRCode.toDataURL(stringdata, async function (err, code) {
            if (err) return console.log("error occurred");
            var QR_code_12 = code;

            console.log("QR_code>>>>>>>>", QR_code_12);
            var base64Str = QR_code_12;
            var path = "public/uploads/";
            base64ToImage(base64Str, path);
            console.log("QR_code_1>>>>>>>>>>", QR_code_1);

            var image_Info = base64ToImage(base64Str, path);

            console.log("imageImfo>>>>", image_Info.fileName);

            console.log("imageImfo>>>>", image_Info);
            const user = {};
            // console.log("user>>>>>>>>>>>>>>>>>>>", user)
            const datas = await addQRcode(user);
            // console.log("<<<<<<<<<<<<<<datas<<<<", datas)
            // console.log("<<<<<<<<<<<<<<datas.insertId<<<<", datas.insertId)
            if (datas.affectedRows) {
                await Promise.all(
                    images_24.map(async (item) => {
                        let images_info = {
                            Image_names: item,
                            product_id: datas.insertId,
                            user_id: user_id,
                        };

                        // console.log("user_info>>>>>>>>>>>>>>>", images_info)
                        const datass = await addProduct_images(images_info);
                    })
                );

                return res.json({
                    message: "successfull",
                    success: true,
                    image: qrcode,
                    status: 200,
                });
            }
        });

        // const userInfo = await fetchUserById(user_id);

        return res.json({
            message: "QRcode  gentrated successfully",
            success: true,
            status: 400,
        });
    } catch (error) {
        console.log(error);
        return res.json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

exports.addgallery = async (req, res) => {
    try {
        const { product_id, user_id } = req.body;

        const schema = Joi.alternatives(
            Joi.object({
                product_id: [Joi.number().empty().required()],
                user_id: [Joi.number().empty().required()],
            })
        );

        const result = schema.validate({ product_id, user_id });

        if (result.error) {
            const message = result.error.details.map((i) => i.message).join(",");
            return res.json({
                message: result.error.details[0].message,
                error: message,
                missingParams: result.error.details[0].message,
                status: 400,
                success: false,
            });
        } else {
            const data = {
                product_id: product_id,
                user_id: user_id,
            };
            // console.log("data product count>>>>>>>")
            const count = await count_product(user_id);
            console.log("count>>>>>>", count);
            console.log("count>>>>>!!!!!!", count[0].count);
            const user_info = await User_info(user_id);
            const purchase_qrcode = await Get_Purchase_Qrcode(product_id, user_id);
            // console.log("purchase_qrcode>>>>>>>>>", purchase_qrcode)

            if (count[0].count >= 20 && user_info[0].Membership_Plan == 0) {
                res.json({
                    message: "Upgrade to Premium Plan to add more products in gallery",
                    success: true,
                    status: 200,
                });
            }
            //21/06/2023
           // if (purchase_qrcode == 0) {
                // return res.json({
                //     message: " You have not purched this QR_code ",
                //     success: false,
                //     status: 200,
                // });
            //} else {
                const added_to_gallery = await addtogallery(data);

                return res.json({
                    message: "product added successfully in gallery",
                    success: true,
                    status: 200,
                });
           // }
        }
    } catch (error) {
        console.log(error);
        return res.json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

exports.getgallery = async (req, res) => {
    try {
        const { user_id } = req.body;

        const schema = Joi.alternatives(
            Joi.object({
                user_id: [Joi.number().empty().required()],
            })
        );

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
        } else {
            const data = await getgallery(user_id);
            // console.log("gallery>>>>>>>>", data)

            const baseurl = "http://159.89.248.34:3000/QR_code(product)/";
            if (data.length !== 0) {
                await Promise.all(
                    data.map(async (item) => {
                        // console.log("item>>>>>",item)
                        // console.log("item>>>>>",item.product_id)
                        let product_images = await fetchproductimage_1(item.product_id);
                        item.images = product_images;

                        let product_id = item.product_id;
                        const purchase_qrcode = await Get_Purchase_Qrcode(
                            product_id,
                            user_id
                        );
                        // console.log("purchase_qrcode>>>>>>>>>", purchase_qrcode)

                        if (purchase_qrcode != 0) {
                            if (item.QR_code_image) {
                                item.QR_code_image = baseurl + purchase_qrcode[0].QR_code;
                                item.QR_purches_status = 1;
                            }
                        } else {
                            if (item.QR_code_image) {
                                item.QR_code_image =
                                    "http://159.89.248.34:3000/QR_code(product)/BlurQR.jpeg";
                                item.QR_purches_status = 0
                            }
                        }
                    })
                );
            }
            if (data.length != 0) {
                return res.json({
                    message: "successfully get all product from gallery",
                    response: data,
                    success: true,
                    status: 200,
                });
            } else {
                return res.json({
                    message: "No data found",
                    response: [],
                    success: true,
                    status: 200,
                });
            }
        }
    } catch (error) {
        console.log(error);
        return res.json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

exports.getnewest_stuffy = async (req, res) => {
    try {
        const { user_id } = req.body;

        const schema = Joi.alternatives(
            Joi.object({
                user_id: [Joi.number().empty().required()],
            })
        );

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
        } else {
            const data = await getnewest_stuffy();
            // console.log("gallery>>>>>>>>", data)
            const baseurl = "http://159.89.248.34:3000/QR_code(product)/";
            if (data !== 0) {
                await Promise.all(
                    data.map(async (item) => {
                        let product_images = await fetchproductimage(item.id);
                        item.images = product_images;

                        let product_id = item.id;

                        const purchase_qrcode = await Get_Purchase_Qrcode(
                            product_id,
                            user_id
                        );
                        // console.log("purchase_qrcode>>>>>>>>>", purchase_qrcode)

                        if (purchase_qrcode != 0) {
                            if (item.QR_code_image) {
                                item.QR_code_image = baseurl + purchase_qrcode[0].QR_code;
                                item.QR_purches_status = 1;
                            }
                        } else {
                            if (item.QR_code_image) {
                                item.QR_code_image =
                                    "http://159.89.248.34:3000/QR_code(product)/BlurQR.jpeg";
                            }
                        }
                    })
                );

                return res.json({
                    message: "successfully",
                    response: data,
                    success: true,
                    status: 200,
                });
            } else {
                return res.json({
                    message: "No data found",
                    response: [],
                    success: false,
                    status: 400,
                });
            }
        }
    } catch (error) {
        console.log(error);
        return res.json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

exports.getexclusive_stuffy = async (req, res) => {
    try {
        const { user_id } = req.body;

        const schema = Joi.alternatives(
            Joi.object({
                user_id: [Joi.number().empty().required()],
            })
        );

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
        } else {
            const data = await getexclusive_stuffy();
            // console.log("gallery>>>>>>>>", data)

            const baseurl = "http://159.89.248.34:3000/QR_code(product)/";
            if (data !== 0) {
                await Promise.all(
                    data.map(async (item) => {
                        let product_images = await fetchproductimage(item.id);
                        item.images = product_images;

                        // console.log("purchase_qrcode>>>>>>>>>", purchase_qrcode)

                        // if (item.QR_code_image) {
                        //     item.QR_code_image = "http://159.89.248.34:3000/QR_code(product)/BlurQR.jpeg";
                        // }

                        let product_id = item.id;

                        const purchase_qrcode = await Get_Purchase_Qrcode(
                            product_id,
                            user_id
                        );
                        // console.log("purchase_qrcode>>>>>>>>>", purchase_qrcode)

                        if (purchase_qrcode != 0) {
                            if (item.QR_code_image) {
                                item.QR_code_image = baseurl + purchase_qrcode[0].QR_code;
                                item.QR_purches_status = 1;
                            }
                        } else {
                            if (item.QR_code_image) {
                                item.QR_code_image =
                                    "http://159.89.248.34:3000/QR_code(product)/BlurQR.jpeg";
                            }
                        }
                    })
                );

                return res.json({
                    message: "successfully",
                    response: data,
                    success: true,
                    status: 200,
                });
            } else {
                return res.json({
                    message: "No data found",
                    response: [],
                    success: false,
                    status: 400,
                });
            }
        }
    } catch (error) {
        console.log(error);
        return res.json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

exports.add_product_admin = async (req, res) => {
    try {
        const { product_name, user_id, category_id, Description, status, price } = req.body;
        const schema = Joi.alternatives(
            Joi.object({
                category_id: [Joi.number().empty().required()],
                product_name: [Joi.string().empty().required()],
                user_id: [Joi.string().empty().required()],
                Description: [Joi.string().empty().required()],
                status: [Joi.string().empty().required()],
                price: [Joi.number().empty().required()],
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
        } else {
            let filename = "";
            // console.log(">>>>>>>>>>req.files", req.files)
            if (req.files) {
                const file = req.files;
                var images_24 = [];
                for (let i = 0; i < file.length; i++) {
                    // console.log("filename>>>>>>>>>>>>>>", req.files[i].filename)
                    var image_names_1 = req.files[i].filename;
                    images_24.push(req.files[i].filename);
                }
                // console.log("images>>>>>>>>", images_24)
            }
            if (images_24.length >= 6) {
                res.json({
                    message: " you can't select images more than 5 ",
                    success: true,
                    status: 200,
                });
            } else {
                const data = await fetchProduct(product_name);
                // console.log(data)
                if (data.length !== 0) {
                    return res.json({
                        message: "Product already added",
                        status: 400,
                        success: false,
                    });
                }

                const randomString = generateRandomString(10);
                // console.log("randomString", generateRandomString)

                const user = {
                    category_id: category_id,
                    product_name: product_name,
                    user_id: user_id,
                    Description: Description,
                    status: status,
                    // QR_code_image: image_Info.fileName,
                    QR_code: randomString, // Generates a random string with 10 characters
                    price: price,
                    // product_image: imageTostring
                };

                const datas = await addProduct(user);
                var id = datas.insertId;
                console.log("datas>>>>>>>>>>>>>>>>>>>", datas);

                

                if (datas.length != 0) {
                    await Promise.all(
                        images_24.map(async (item) => {
                            let images_info = {
                                Image_names: item,
                                product_id: datas.insertId,
                                user_id: user_id,
                            };

                            console.log("images_info>>>>>>>>>>>>>>>", images_info);
                            const datass = await addProduct_images_1(images_info);

                            console.log("datass>>>>>>>>>>", datass);
                        })
                    );

                    // Creating the data for QR_code
                    let data = {
                        product_id: datas.insertId,
                        category_id: category_id,
                        product_name: product_name,
                        Description: Description,
                    };
                    // console.log("data>>>>>", data)

                    // Converting the data into String format
                    let stringdata = JSON.stringify(data);

                    // Print the QR code to terminal
                    var qrcode = QRCode.toString(
                        stringdata,
                        { type: "terminal" },
                        function (err, QRcode) {
                            if (err) return console.log("error occurred");
                        }
                    );

                    // Converting the data into base64
                    var QR_code_1 = QRCode.toDataURL(
                        stringdata,
                        async function (err, code) {
                            if (err) return console.log("error occurred");
                            var QR_code_12 = code;
                            var base64Str = QR_code_12;
                            var path = "public/QR_code(product)/";
                            base64ToImage(base64Str, path);
                            var image_Info = base64ToImage(base64Str, path);
                            // console.log("image_Info>>>>>", image_Info)
                            // console.log("imageImfo_1>>>>", image_Info.fileName)

                            var id = datas.insertId;

                            var QR_code_image = image_Info.fileName;

                            const product_update_QR = await updateQR_product( QR_code_image,id);
                            
                        }
                    );

                    res.json({
                        message: "Product with category added successfull",
                        success: true,
                        status: 200,
                    });
                }
            }
        }
    } catch (error) {
        console.log(error);
        return res.json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};
exports.add_product = async (req, res) => {
    try {
        const { product_name, user_id, category_id, Description, status, price } =
            req.body;
        const schema = Joi.alternatives(
            Joi.object({
                category_id: [Joi.number().empty().required()],
                product_name: [Joi.string().empty().required()],
                user_id: [Joi.string().empty().required()],
                Description: [Joi.string().empty().required()],
                status: [Joi.string().empty().required()],
                price: [Joi.number().empty().required()],
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
        } else {
            let filename = "";
            // console.log(">>>>>>>>>>req.files", req.files)
            if (req.files) {
                const file = req.files;
                var images_24 = [];
                for (let i = 0; i < file.length; i++) {
                    // console.log("filename>>>>>>>>>>>>>>", req.files[i].filename)
                    var image_names_1 = req.files[i].filename;
                    images_24.push(req.files[i].filename);
                }
                // console.log("images>>>>>>>>", images_24)
            }
            if (images_24.length >= 6) {
                res.json({
                    message: " you can't select images more than 5 ",
                    success: true,
                    status: 200,
                });
            } else {
                const data = await fetchProduct(product_name);
                // console.log(data)
                if (data.length !== 0) {
                    return res.json({
                        message: "Product already added",
                        status: 400,
                        success: false,
                    });
                }

                const randomString = generateRandomString(10);
                // console.log("randomString", generateRandomString)

                const user = {
                    category_id: category_id,
                    product_name: product_name,
                    user_id: user_id,
                    Description: Description,
                    status: status,
                    // QR_code_image: image_Info.fileName,
                    QR_code: randomString, // Generates a random string with 10 characters
                    price: price,
                    // product_image: imageTostring
                };

                const datas = await addProduct(user);
                var id = datas.insertId;
                console.log("datas>>>>>>>>>>>>>>>>>>>", datas);

                // stripe.products
                //     .create({
                //         name: product_name,
                //         description: Description,
                //         // Add more parameters as needed
                //     })

                //     .then(async (products) => {
                //         let product_id = products.id
                //         const Product = await stripe_product(product_id, id)
                //         console.log(products);
                //         stripe.prices.create({
                //             unit_amount: amount + "00",
                //             currency: 'usd',
                //             product: products.id,
                //         })

                //             .then(async (price) => {
                //                 console.log(price);
                //                 let price_id = price.id
                //                 const Price = await stripe_price(price_id, id)
                //             })
                //             .catch((error) => {
                //                 res.json(error);
                //             });
                //     })
                //     .catch((error) => {
                //         console.log(error);
                //     })

                if (datas.length != 0) {
                    await Promise.all(
                        images_24.map(async (item) => {
                            let images_info = {
                                Image_names: item,
                                product_id: datas.insertId,
                                user_id: user_id,
                            };

                            console.log("images_info>>>>>>>>>>>>>>>", images_info);
                            const datass = await addProduct_images_1(images_info);

                            console.log("datass>>>>>>>>>>", datass);
                        })
                    );

                    // Creating the data for QR_code
                    let data = {
                        product_id: datas.insertId,
                        category_id: category_id,
                        product_name: product_name,
                        Description: Description,
                    };
                    // console.log("data>>>>>", data)

                    // Converting the data into String format
                    let stringdata = JSON.stringify(data);

                    // Print the QR code to terminal
                    var qrcode = QRCode.toString(
                        stringdata,
                        { type: "terminal" },
                        function (err, QRcode) {
                            if (err) return console.log("error occurred");
                        }
                    );

                    // Converting the data into base64
                    var QR_code_1 = QRCode.toDataURL(
                        stringdata,
                        async function (err, code) {
                            if (err) return console.log("error occurred");
                            var QR_code_12 = code;
                            var base64Str = QR_code_12;
                            var path = "public/QR_code(product)/";
                            base64ToImage(base64Str, path);
                            var image_Info = base64ToImage(base64Str, path);
                            // console.log("image_Info>>>>>", image_Info)
                            // console.log("imageImfo_1>>>>", image_Info.fileName)

                            var id = datas.insertId;

                            var QR_code_image = image_Info.fileName;

                            const product_update_QR = await updateQR_product(
                                QR_code_image,
                                id
                            );
                            // console.log(">>>>>>>>>>>>>>!!!!!product_update_QR", product_update_QR)
                        }
                    );

                    res.json({
                        message: "Product with category added successfull",
                        success: true,
                        status: 200,
                    });
                }
            }
        }
    } catch (error) {
        console.log(error);
        return res.json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

exports.addsprite = async (req, res) => {
    try {
        const { product_id, user_id } = req.body;

        const schema = Joi.alternatives(
            Joi.object({
                product_id: [Joi.number().empty().required()],
                user_id: [Joi.number().empty().required()],
            })
        );

        const result = schema.validate({ product_id, user_id });

        if (result.error) {
            const message = result.error.details.map((i) => i.message).join(",");
            return res.json({
                message: result.error.details[0].message,
                error: message,
                missingParams: result.error.details[0].message,
                status: 400,
                success: false,
            });
        } else {
            const check = await check_sprites(user_id, product_id);
            if (check.length == 0) {
                const data = {
                    product_id: product_id,
                    user_id: user_id,
                };

                const added_to_sprites = await addtosprites(data);

                return res.json({
                    message: "product added successfully in sprites",
                    success: true,
                    status: 200,
                });
            } else {
                return res.json({
                    message: "product is already added  in sprites",
                    success: true,
                    status: 200,
                });
            }
        }
    } catch (error) {
        console.log(error);
        return res.json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

exports.getsprites = async (req, res) => {
    try {
        const { user_id } = req.body;

        const schema = Joi.alternatives(
            Joi.object({
                user_id: [Joi.number().empty().required()],
            })
        );

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
        } else {
            const data = await getsprites(user_id);
            const images = await get_sprite(user_id);
            console.log("data_1>>>>>>>>", images);
            // console.log("data_1>>>>>>>>", data_1[0].id)
            // if (data_1 != 0) {

            //     let sprite_id = data_1[0].id
            //     var images = await get_sprite_1(sprite_id)
            // }
            // console.log("data_3>>>>>>>>", data_3)

            if (data.length !== 0) {
                await Promise.all(
                    data.map(async (item) => {
                        // console.log("item>>>>>",item)
                        // console.log("item>>>>>",item.product_id)
                        let product_images = await fetchproductimage_1(item.product_id);
                        item.images = product_images;
                    })
                );
            }

            if (data.length != 0) {
                return res.json({
                    message: "successfully",
                    response: data,
                    images,
                    success: true,
                    status: 200,
                });
            }
            if (images.length != 0) {
                return res.json({
                    message: "successfully",
                    response: data,
                    images,
                    success: true,
                    status: 200,
                });
            } else {
                return res.json({
                    message: "No data found",
                    response: [],
                    images: [],
                    success: true,
                    status: 200,
                });
            }
        }
    } catch (error) {
        console.log(error);
        return res.json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

exports.add_friend = async (req, res) => {
    try {
        const { reciver_id, sender_id, status } = req.body;

        const schema = Joi.alternatives(
            Joi.object({
                reciver_id: [Joi.number().empty().required()],
                sender_id: [Joi.number().empty().required()],
                status: [Joi.number().empty().required()],
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
        } else {
            const check_friend_request = await friend_request(sender_id, reciver_id);

            console.log("check_friend_request", check_friend_request);
            // const check = await
            if (status == 1 && check_friend_request != 0) {
                const add_friend = await addfriend(sender_id, reciver_id);
                const update_notification = await cancel_request(sender_id, reciver_id);

                // const serverKey = "AAAAb1yACDc:APA91bHPa6DP2pjvWnRiQgq-XcZqLeq3r8zuJ1XzT2BlvEQH0lXJVKYlh5RVJQqjeOd0p7Im7l68n39c1NAULnzJpRhRwH7HOl9OZU7DbI4a5KJB2DXMJ1jGtj6u_9e5Xp-enXgYetuW"; // replace with your FCM server key

                const serverKey =
                    "AAAALnQ1O48:APA91bHaiZRbzi7v6xf57TOnvdm5mG4ioK4_f35UMlaur-1pXbJND2D5B4DXf6ls9uA-z6xO0qG1us4YigMgNX6ypuWOsuAfNVlE56JTtoL2dTFGU_3xJIC1_EfV-VjUmSkKxfnV6n4K"; // replace with your FCM server key

                const fcm = new FCM(serverKey);

                const Get_fcm = await fetch_fcm_1(sender_id);

                // console.log("Get_fcm>>>>>>>>>>>>>", Get_fcm)
                // console.log("=============>>>>>>>>>", Get_fcm[0].fcm_token)
                // console.log("Get_fcm>>!!!!!!!!!!!", Get_fcm.RowDataPacket.fcm_token)

                const reciver_info = await user_info_1(reciver_id);
                // console.log("sender_info", sender_info)
                if (reciver_info != 0) {
                    const message = {
                        to: Get_fcm[0].fcm_token,
                        notification: {
                            user_id: sender_id,
                            title: "Friend accepted",
                            body: reciver_info[0].full_name + " accept your friend request.",
                            icon: "icon_name_here",
                            click_action: "notification_click_action_here",
                            sound: "default",
                            icon: "fcm_push_icon",
                        },

                        data: {
                            sender_id: sender_id,
                            reciver_id: reciver_id,
                        },
                    };
                    const send_notification = {
                        user_id: sender_id,
                        sender_id: sender_id,
                        reciver_id: reciver_id,
                        body: reciver_info[0].full_name + " accept your friend request.",
                        notification_type: 1,
                        friend_request_status: 2,
                    };

                    const result = await addnotification(send_notification);
                    // console.log("result>>>>>>>>>>>>>>", result)
                    // })
                    fcm.send(message, async (err, response) => {
                        if (err) {
                            res.json({
                                message: "FCM token error Error",
                                notification_Error: err,
                                success: false,
                                status: 500,
                            });
                        } else {
                            res.json({
                                message: "friend request accpeted  successfully",
                                notification_status: response,
                                success: true,
                                status: 200,
                            });
                        }
                    });
                } else {
                    res.json({
                        message: "user not found",
                        success: true,
                        status: 200,
                    });
                }
            } else {
                const add_friend_1 = await delete_cancel_request(sender_id, reciver_id);
                const update_notification = await cancel_request(sender_id, reciver_id);
                return res.json({
                    message: "Request is cancel",
                    success: true,
                    status: 200,
                });
            }
        }
    } catch (error) {
        console.log(error);
        return res.json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

exports.get_my_friend = async (req, res) => {
    try {
        const { user_id } = req.body;

        const schema = Joi.alternatives(
            Joi.object({
                user_id: [Joi.number().empty().required()],
            })
        );

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
        } else {
            const data = await getmyfriend(user_id);
            const data_1 = await getmyfriend_1(user_id);

            const baseurl = "http://159.89.248.34:3000/profile/";
            const baseurl_QR = "http://159.89.248.34:3000/user_QR_code/";
            // const data_1 = await getmyfriend_1(user_id)

            await Promise.all(
                data.map(async (item) => {
                    if (item.profile_image) {
                        item.profile_image = baseurl + item.profile_image;
                    }

                    if (item.QR_code_image) {
                        item.QR_code_image = baseurl_QR + item.QR_code_image;
                    }
                })
            );

            await Promise.all(
                data_1.map(async (item) => {
                    if (item.profile_image) {
                        item.profile_image = baseurl + item.profile_image;
                    }

                    if (item.QR_code_image) {
                        item.QR_code_image = baseurl_QR + item.QR_code_image;
                    }
                })
            );

            const friend_list = data.concat(data_1);

            if (friend_list.length == 0) {
                return res.json({
                    message: "No data found ",
                    my_friends: [],
                    success: true,
                    status: 200,
                });
            } else {
                return res.json({
                    message: "successfully ",
                    my_friends: friend_list,
                    success: true,
                    status: 200,
                });
            }

            // if(friend_list.length == 0) {
            //     return res.json({
            //         message: "No data found ",
            //         my_friends: [],
            //         success: true,
            //         status: 200
            //     });
            // }
        }
    } catch (error) {
        console.log(error);
        return res.json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

exports.update_sprites = async (req, res) => {
    try {
        const { user_id } = req.body;
        const schema = Joi.alternatives(
            Joi.object({
                user_id: [Joi.string().empty().required()],
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
        } else {
            let filename = "";
            console.log(">>>>>>>>>>req.files", req.files)
            if (req.files) {
                const file = req.files;
                var images_24 = [];
                for (let i = 0; i < file.length; i++) {
                    // console.log("filename>>>>>>>>>>>>>>", req.files[i].filename)
                    // var image_names_1 = req.files[i].filename
                    images_24.push(req.files[i].filename);
                }
                console.log("images>>>>>>>>", images_24)
            }
            // const datas = await get_sprite_id(user_id);
            // console.log("<<<<<<<<<<<<<<<<!!!!!!!datas", datas)
            // console.log("<<<<<<<<<<<<<<datas.insertId<<<<", datas[0].id)

            if (images_24.length >= 6) {
                res.json({
                    message: " you can't select images more than 5 ",
                    success: true,
                    status: 200,
                });
            } else {
                await Promise.all(
                    images_24.map(async (item) => {
                        let images_info = {
                            Image_names: item,
                            user_id: user_id,
                        };

                        // console.log("images_info>>>>>>>>>>>>>>>", images_info)
                        const datass = await addProduct_images(images_info);

                        // console.log("datass>>>>>>>>>>", datass)
                    })
                );

                res.json({
                    message: " image uploaded successfullly ",
                    success: true,
                    status: 200,
                });
            }
        }
    } catch (error) {
        console.log(error);
        return res.json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

exports.get_share_gallery = async (req, res) => {
    try {
        const { user_id } = req.body;

        const schema = Joi.alternatives(
            Joi.object({
                // shareing_code: [Joi.required()]
                user_id: [Joi.string().empty().required()],
            })
        );

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
        } else {
            // const get_gallery_info = await fetch_shareing_code(user_id)

            const get_friend_info = await fetch_friend_from_gallery(user_id);

            console.log("get_friend_info>>>>", get_friend_info)
            let users = [];
            let users_info = [];
            for (let i = 0; i < get_friend_info.length; i++) {
                console.log("loop>>>>>>", get_friend_info[i]);
                let users_1 = get_friend_info[i].user_id;

                
                const get_user = await fetch_user(users_1);

                const baseurl = "http://159.89.248.34:3000/profile/";

                // const baseurl_product = "http://159.89.248.34:3000/QR_code(product)/";

                const baseurl_1 = "http://159.89.248.34:3000/user_QR_code/";

                await Promise.all(
                    get_user.map(async (item) => {
                        if (item.profile_image) {
                            item.profile_image = baseurl + item.profile_image;
                        }

                        if (item.QR_code_image) {
                            item.QR_code_image = baseurl_1 + item.QR_code_image

                        }


                    })
                );
                users.push(get_friend_info[i].user_id);
                users_info.push(get_user[0]);

                // console.log("get_user",get_user)
            }
         
            return res.json({
                message: "successfully get all product from friends  gallery",
                response: users_info,
                success: true,
                status: 200,
            });
        }
    } catch (error) {
        console.log(error);
        return res.json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

exports.friend_request = async (req, res) => {
    try {
        const { reciver_id, sender_id } = req.body;

        const schema = Joi.alternatives(
            Joi.object({
                reciver_id: [Joi.number().empty().required()],
                sender_id: [Joi.number().empty().required()],
            })
        );

        const result = schema.validate({ reciver_id, sender_id });

        if (result.error) {
            const message = result.error.details.map((i) => i.message).join(",");
            return res.json({
                message: result.error.details[0].message,
                error: message,
                missingParams: result.error.details[0].message,
                status: 400,
                success: false,
            });
        } else {
            const check_friend_request = await friend_request(sender_id, reciver_id);

            console.log("check_friend_request", check_friend_request);

            if (check_friend_request.length != 0) {
                return res.json({
                    message: "Request is already send",
                    status: 400,
                    success: false,
                });
            } else {
                // const serverKey = "AAAAb1yACDc:APA91bHPa6DP2pjvWnRiQgq-XcZqLeq3r8zuJ1XzT2BlvEQH0lXJVKYlh5RVJQqjeOd0p7Im7l68n39c1NAULnzJpRhRwH7HOl9OZU7DbI4a5KJB2DXMJ1jGtj6u_9e5Xp-enXgYetuW"; // replace with your FCM server key
                const serverKey =
                    "AAAALnQ1O48:APA91bHaiZRbzi7v6xf57TOnvdm5mG4ioK4_f35UMlaur-1pXbJND2D5B4DXf6ls9uA-z6xO0qG1us4YigMgNX6ypuWOsuAfNVlE56JTtoL2dTFGU_3xJIC1_EfV-VjUmSkKxfnV6n4K"; // replace with your FCM server key

                const fcm = new FCM(serverKey);

                const Get_fcm = await fetch_fcm(reciver_id);

                // console.log("Get_fcm>>>>>>>>>>>>>", Get_fcm)
                // console.log("=============>>>>>>>>>", Get_fcm[0].fcm_token)
                // console.log("Get_fcm>>!!!!!!!!!!!", Get_fcm.RowDataPacket.fcm_token)
                if (Get_fcm[0].fcm_token != 0) {
                    const sender_info = await user_info(sender_id);
                    // console.log("sender_info", sender_info)
                    if (sender_info != 0) {
                        const message = {
                            to: Get_fcm[0].fcm_token,
                            notification: {
                                user_id: sender_id,
                                title: "Friend request",
                                body: sender_info[0].full_name + " sent you a friend request.",
                                icon: "icon_name_here",
                                click_action: "notification_click_action_here",
                                sound: "default",
                                icon: "fcm_push_icon",
                            },

                            data: {
                                sender_id: sender_id,
                                reciver_id: reciver_id,
                            },
                        };
                        const send_notification = {
                            user_id: reciver_id,
                            sender_id: sender_id,
                            reciver_id: reciver_id,
                            body: sender_info[0].full_name + " send you friend request",
                            notification_type: 1,
                            friend_request_status: 0,
                        };

                        const result = await addnotification(send_notification);
                        // console.log("result>>>>>>>>>>>>>>", result)
                        // })
                        fcm.send(message, async (err, response) => {
                            if (err) {
                                const data = {
                                    sender_id: sender_id,
                                    reciver_id: reciver_id,
                                    status: 0,
                                };

                                const send_friend_request = await send_request(data);

                                res.json({
                                    message: "FCM token error Error",
                                    notification_Error: err,
                                    success: false,
                                    status: 500,
                                });
                            } else {
                                const data = {
                                    sender_id: sender_id,
                                    reciver_id: reciver_id,
                                    status: 0,
                                };

                                const send_friend_request = await send_request(data);
                                res.json({
                                    message: "request sent successfully",
                                    notification_status: response,
                                    success: true,
                                    status: 200,
                                });
                            }
                        });
                    } else {
                        res.json({
                            message: "User not found",
                            success: true,
                            status: 200,
                        });
                    }
                } else {
                    res.json({
                        message: "user does't have FCM token",
                        success: true,
                        status: 200,
                    });
                }
            }
        }
    } catch (error) {
        console.log(error);
        return res.json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

exports.share_my_gallery = async (req, res) => {
    try {
        const { user_id, friend_id } = req.body;

        const schema = Joi.alternatives(
            Joi.object({
                user_id: [Joi.number().empty().required()],
                friend_id: [Joi.number().empty().required()],
            })
        );

        const result = schema.validate({ user_id, friend_id });

        if (result.error) {
            const message = result.error.details.map((i) => i.message).join(",");
            return res.json({
                message: result.error.details[0].message,
                error: message,
                missingParams: result.error.details[0].message,
                status: 400,
                success: false,
            });
        } else {
            // const get_gallery_id_2 = await get_gallery_id(user_id)

            // console.log("get_gallery_id_2>>>>>>", get_gallery_id_2)

            const gallery = await getgallery(user_id);
            if (gallery.length != 0) {
                // const serverKey = "AAAAb1yACDc:APA91bHPa6DP2pjvWnRiQgq-XcZqLeq3r8zuJ1XzT2BlvEQH0lXJVKYlh5RVJQqjeOd0p7Im7l68n39c1NAULnzJpRhRwH7HOl9OZU7DbI4a5KJB2DXMJ1jGtj6u_9e5Xp-enXgYetuW"; // replace with your FCM server key
                const serverKey =
                    "AAAALnQ1O48:APA91bHaiZRbzi7v6xf57TOnvdm5mG4ioK4_f35UMlaur-1pXbJND2D5B4DXf6ls9uA-z6xO0qG1us4YigMgNX6ypuWOsuAfNVlE56JTtoL2dTFGU_3xJIC1_EfV-VjUmSkKxfnV6n4K"; // replace with your FCM server key
                const fcm = new FCM(serverKey);

                const Get_fcm = await fetch_fcm_1(friend_id);
                // console.log("Get_fcm>>>>>>>>>>>>>", Get_fcm)
                // console.log("=============>>>>>>>>>", Get_fcm[0].fcm_token)
                // console.log("Get_fcm>>!!!!!!!!!!!", Get_fcm.RowDataPacket.fcm_token)

                const user_info = await user_info_2(user_id);

                const message = {
                    to: Get_fcm[0].fcm_token,
                    notification: {
                        user_id: friend_id,
                        title: user_info[0].full_name + " share his gallery ",
                        body: " Your friend share his gallery",
                        icon: "icon_name_here",
                        click_action: "notification_click_action_here",
                        sound: "default",
                        icon: "fcm_push_icon",
                    },

                    data: {
                        user_id: user_id,
                        friend_id: friend_id,
                    },
                };
                const send_notification = {
                    user_id: friend_id,
                    body: user_info[0].full_name + " share his gallery ",
                    notification_type: 3,
                };

                const result = await addnotification(send_notification);
                // console.log("result>>>>>>>>>>>>>>", result)
                // })
                fcm.send(message, async (err, response) => {
                    if (err) {
                        var code = generateRandomString(7);
                        const data = {
                            user_id: user_id,
                            friend_id: friend_id,
                            shareing_code: code,
                        };
                        const share = await share_gallery(data);
                        res.json({
                            message: " FCM token error Error",
                            notification_Error: err,
                            success: false,
                            status: 500,
                        });
                    } else {
                        var code = generateRandomString(7);
                        const data = {
                            user_id: user_id,
                            friend_id: friend_id,
                            shareing_code: code,
                        };
                        const share = await share_gallery(data);
                        res.json({
                            message: "share gallery notification sended to friend.",
                            notification_status: response,
                            success: true,
                            status: 200,
                        });
                    }
                });
            } else {
                return res.json({
                    message: "your gallery is empty ",
                    success: true,
                    status: 200,
                });
            }
        }
    } catch (error) {
        console.log(error);
        return res.json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

exports.get_all_friends = async (req, res) => {
    try {
        const { user_id } = req.body;

        const schema = Joi.alternatives(
            Joi.object({
                user_id: [Joi.number().empty().required()],
            })
        );

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
        } else {
            const data = await getmyfriend_A(user_id);
            const data_1 = await getmyfriend_2(user_id);

            if (data.length == 0 && data_1.length == 0) {
                let all_user_2 = [];
                const get_all_users_1 = await all_users();
                for (let i = 0; i < get_all_users_1.length; i++) {
                    if (get_all_users_1[i].id != user_id)
                        all_user_2.push(get_all_users_1[i]);
                }

                return res.json({
                    message: "successfully ",
                    my_friends: all_user_2,
                    success: true,
                    status: 200,
                });
            } else {
                const baseurl = "http://159.89.248.34:3000/profile/";
                const baseurl_QR = "http://159.89.248.34:3000/user_QR_code/";
                // const data_1 = await getmyfriend_1(user_id)

                await Promise.all(
                    data.map(async (item) => {
                        if (item.profile_image) {
                            item.profile_image = baseurl + item.profile_image;
                        }

                        if (item.QR_code_image) {
                            item.QR_code_image = baseurl_QR + item.QR_code_image;
                        }
                    })
                );

                await Promise.all(
                    data_1.map(async (item) => {
                        if (item.profile_image) {
                            item.profile_image = baseurl + item.profile_image;
                        }

                        if (item.QR_code_image) {
                            item.QR_code_image = baseurl_QR + item.QR_code_image;
                        }
                    })
                );

                const friend_list = data.concat(data_1);

                // const get_all_users = get_all_users()

                let all_user = [];

                for (let i = 0; i < friend_list.length; i++) {
                    all_user.push(friend_list[i].friend_id);
                }
                const get_all_users = await all_users_without_friend(all_user);

                let all_user_1 = [];

                for (let i = 0; i < get_all_users.length; i++) {
                    if (get_all_users[i].id != user_id) all_user_1.push(get_all_users[i]);
                }

                console.log("get_all_users", get_all_users);

                return res.json({
                    message: "successfully ",
                    my_friends: all_user_1,
                    success: true,
                    status: 200,
                });
            }

            // if(friend_list.length == 0) {
            //     return res.json({
            //         message: "No data found ",
            //         my_friends: [],
            //         success: true,
            //         status: 200
            //     });
            // }
        }
    } catch (error) {
        console.log(error);
        return res.json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

exports.edit_product = async (req, res) => {
    try {
        const { product_name, user_id, Description, status, product_id } = req.body;
        const schema = Joi.alternatives(
            Joi.object({
                product_id: [Joi.number().empty()],
                product_name: [Joi.string().empty()],
                user_id: [Joi.string().empty()],
                Description: [Joi.string().empty()],
                status: [Joi.string().empty()],
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
        } else {
            let filename = "";
            // console.log(">>>>>>>>>>req.files", req.files)
            if (req.files) {
                const file = req.files;
                var images_24 = [];
                for (let i = 0; i < file.length; i++) {
                    // console.log("filename>>>>>>>>>>>>>>", req.files[i].filename)
                    var image_names_1 = req.files[i].filename;
                    images_24.push(req.files[i].filename);
                }
                // console.log("images>>>>>>>>", images_24)
            }
            if (images_24.length >= 6) {
                res.json({
                    message: " you can't select images more than 5 ",
                    success: true,
                    status: 200,
                });
            } else {
                const product_info = await fetchProduct_1(product_id, user_id);
                // console.log(data)
                if (product_info.length == 0) {
                    return res.json({
                        message: " Product does't exsit ",
                        status: 400,
                        success: false,
                    });
                } else {
                    let user = {
                        product_name: product_name
                            ? product_name
                            : product_info[0].product_name,
                        Description: Description
                            ? Description
                            : product_info[0].Description,
                        status: status ? status : product_info[0].status,
                    };

                    let id = product_id;
                    // console.log("user>>>>>>>>>>>>>>>>>>>", user)
                    // const datas = await update_Product(product_name, product_id, Description, status);
                    const datas = await update_Product(user, user_id, id);
                    // console.log("<<<<<<<<<<<<<<<<!!!!!!!datas", datas)
                    //console.log("<<<<<<<<<<<<<<datas.insertId<<<<", datas.insertId)

                    await Promise.all(
                        images_24.map(async (item) => {
                            let images_info = {
                                Image_names: item,
                                product_id: product_id,
                                user_id: user_id,
                            };

                            console.log("images_info>>>>>>>>>>>>>>>", images_info);
                            const datass = await addProduct_images_1(images_info);

                            // console.log("datass>>>>>>>>>>", datass)
                        })
                    );

                    // Creating the data for QR_code
                    let data_1 = {
                        product_id: product_id,
                        product_name: product_name,
                        Description: Description,
                    };
                    // console.log("data>>>>>", data)

                    // Converting the data into String format
                    let stringdata = JSON.stringify(data_1);

                    // Print the QR code to terminal
                    var qrcode = QRCode.toString(
                        stringdata,
                        { type: "terminal" },
                        function (err, QRcode) {
                            if (err) return console.log("error occurred");
                        }
                    );

                    // Converting the data into base64
                    var QR_code_1 = QRCode.toDataURL(
                        stringdata,
                        async function (err, code) {
                            if (err) return console.log("error occurred");
                            var QR_code_12 = code;
                            var base64Str = QR_code_12;
                            var path = "public/QR_code(product)/";
                            base64ToImage(base64Str, path);
                            var image_Info = base64ToImage(base64Str, path);
                            // console.log("image_Info>>>>>", image_Info)
                            // console.log("imageImfo_1>>>>", image_Info.fileName)

                            var id = product_id;

                            var QR_code_image = image_Info.fileName;

                            const product_update_QR = await updateQR_product(
                                QR_code_image,
                                id
                            );
                            // console.log(">>>>>>>>>>>>>>!!!!!product_update_QR", product_update_QR)
                        }
                    );

                    res.json({
                        message: "stuffy updated successfully",
                        success: true,
                        status: 200,
                    });
                }
            }
        }
    } catch (error) {
        console.log(error);
        return res.json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

exports.delete_product = async (req, res) => {
    try {
        const { user_id, product_id } = req.body;

        const schema = Joi.alternatives(
            Joi.object({
                user_id: [Joi.number().empty().required()],
                product_id: [Joi.number().empty().required()],
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
        } else {
            const data = await fetchProduct_1(product_id, user_id);
            // console.log(data)
            if (data.length == 0) {
                return res.json({
                    message: " Product does't exsit ",
                    status: 200,
                    success: true,
                });
            } else {
                let id = product_id;
                const delete_product = await delete_Product(id, user_id);

                const delete_product_images = await delete_Product_images(
                    user_id,
                    product_id
                );

                return res.json({
                    message: " stuffy delete successfully",
                    status: 200,
                    success: true,
                });
            }
        }
    } catch (error) {
        console.log(error);
        return res.json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

exports.delete_mygallery_product = async (req, res) => {
    try {
        const { user_id, product_id } = req.body;

        const schema = Joi.alternatives(
            Joi.object({
                user_id: [Joi.number().empty().required()],
                product_id: [Joi.number().empty().required()],
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
        } else {
            const data = await fetchProduct_gallery(product_id, user_id);
            // console.log(data)
            if (data.length == 0) {
                return res.json({
                    message: " Stuffy does't exsit in gallery ",
                    status: 200,
                    success: true,
                });
            } else {
                const delete_product_gallery = await delete_gallery_Product(
                    product_id,
                    user_id
                );

                return res.json({
                    message: " stuffy delete successfully",
                    status: 200,
                    success: true,
                });
            }
        }
    } catch (error) {
        console.log(error);
        return res.json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};

exports.delete_stripe_image = async (req, res) => {
    try {
        const { user_id, image_name } = req.body;

        const schema = Joi.alternatives(
            Joi.object({
                user_id: [Joi.number().empty().required()],
                image_name: [Joi.string().empty().required()],
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
        } else {
            const data = await fetchProduct_gallery(product_id, user_id);
            // console.log(data)
            if (data.length == 0) {
                return res.json({
                    message: " Stuffy does't exsit in gallery ",
                    status: 200,
                    success: true,
                });
            } else {
                const delete_product_gallery = await delete_gallery_Product(
                    product_id,
                    user_id
                );

                return res.json({
                    message: " stuffy delete successfully",
                    status: 200,
                    success: true,
                });
            }
        }
    } catch (error) {
        console.log(error);
        return res.json({
            message: "Internal server error",
            success: false,
            status: 500,
        });
    }
};
