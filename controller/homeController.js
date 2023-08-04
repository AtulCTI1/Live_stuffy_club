
const Joi = require('joi');

const { fetchproductimage, getproduct, Get_Purchase_Qrcode, fetchprivacyPolicy, fetchterms_and_condition, get_notification_count, getnewest_stuffy, getexclusive_stuffy, getproductByCategory, getPlans } = require('../models/home');



exports.homePage = (async (req, res) => {
    try {
        const { user_id, search } = req.body;
        // console.log(user_id)
        const schema = Joi.alternatives(
            Joi.object({
                user_id: [Joi.number().empty().required()],
                search: [Joi.number().optional().allow(''), Joi.string().optional().allow('')],
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
            const baseurl = "http://159.89.248.34:3000/QR_code(product)/"
            const baseurl_category = "http://159.89.248.34:3000/category/"
            const categories = await getproductByCategory(search);

            if (categories !== 0) {
                await Promise.all(categories.map(async (item) => {

                    if (item.image) {
                        item.image = baseurl_category + item.image;
                    }


                }));
            }
            const exclusive_stuffy = await getexclusive_stuffy(search);
            if (getexclusive_stuffy !== 0) {
                await Promise.all(exclusive_stuffy.map(async (item) => {

                    let product_images = await fetchproductimage(item.id);
                    item.images = product_images

                    // if (item.QR_code_image) {
                    //     item.QR_code_image = "http://159.89.248.34:3000/QR_code(product)/BlurQR.jpeg";
                    // }
                    let product_id = item.id
                    const purchase_qrcode = await Get_Purchase_Qrcode(product_id, user_id)
                    // console.log("purchase_qrcode>>>>>>>>>", purchase_qrcode)

                    if (purchase_qrcode != 0) {

                        if (item.QR_code_image) {
                            item.QR_code_image = baseurl + purchase_qrcode[0].QR_code;
                            item.QR_purches_status = 1
                        }

                    } else {
                        if (item.QR_code_image) {
                             item.QR_code_image = baseurl + item.QR_code_image;
                          //  item.QR_code_image = "http://159.89.248.34:3000/QR_code(product)/BlurQR.jpeg";
                        }
                    }
                    // 21/06/2023
                    item.QR_code_blur_image =
                                "http://159.89.248.34:3000/QR_code(product)/BlurQR.jpeg";

                }));
            }
            const newest_stuffy = await getnewest_stuffy(search);
            if (newest_stuffy !== 0) {
                await Promise.all(newest_stuffy.map(async (item) => {

                    let product_images = await fetchproductimage(item.id);
                    item.images = product_images

                    // if (item.QR_code_image) {
                    //     item.QR_code_image = "http://159.89.248.34:3000/QR_code(product)/BlurQR.jpeg";
                    // }

                    let product_id = item.id

                    const purchase_qrcode = await Get_Purchase_Qrcode(product_id, user_id)
                    // console.log("purchase_qrcode>>>>>>>>>", purchase_qrcode)

                    if (purchase_qrcode != 0) {

                        if (item.QR_code_image) {
                            item.QR_code_image = baseurl + purchase_qrcode[0].QR_code;
                            item.QR_purches_status = 1
                        }

                    } else {
                        if (item.QR_code_image) {
                            item.QR_code_image = baseurl + item.QR_code_image;
                            //item.QR_code_image = "http://159.89.248.34:3000/QR_code(product)/BlurQR.jpeg";
                        }
                    }
                     // 21/06/2023
                    item.QR_code_blur_image =
                                "http://159.89.248.34:3000/QR_code(product)/BlurQR.jpeg";
                }));

            }

            const notification_count = await get_notification_count(user_id)
            return res.json({
                message: "fetch home details successfully",
                status: 200,
                success: true,
                categories: categories.length > 0 ? categories : [],
                exclusive_stuffy: exclusive_stuffy.length > 0 ? exclusive_stuffy : [],
                newest_stuffy: newest_stuffy.length > 0 ? newest_stuffy : [],
                notification_count: notification_count,
            })

        }
    } catch (error) {
        console.log(error)
        return res.json({
            success: false,
            message: "Internal server error",
            status: 500
        })
    }
});


exports.redirectToPP = (async (req, res) => {
    res.sendFile(__dirname + '/view/privacyPolicy.html')


});

exports.redirectTerms = (async (req, res) => {
    res.sendFile(__dirname + '/view/termsAndconditions.html');
});

exports.termsAndcondition = (async (req, res) => {
    try {
        let where = ` where id = '1'`;
        const results = await fetchterms_and_condition('terms_and_condition', where);
        if (results.length !== 0) {
            return res.json({
                message: "fetch terms and condition",
                status: 200,
                success: true,
                terms: results[0].info,
            })
        }
        else {
            return res.json({
                message: "No  terms and Condition",
                status: 200,
                success: true,
                terms: "",
            })
        }

    } catch (error) {
        console.log(error)
        return res.json({
            success: false,
            message: "Internal server error",
            status: 500
        })
    }
});

exports.privacyPolicy = (async (req, res) => {
    try {
        let where = ` where id = '2'`;
        const results = await fetchprivacyPolicy('privacyPolicy', where);
        if (results.length !== 0) {
            return res.json({
                message: "fetch terms and condition",
                status: 200,
                success: true,
                terms: results[0].info,
            })
        }
        else {
            return res.json({
                message: "No  terms and Condition",
                status: 200,
                success: true,
                terms: "",
            })
        }

    } catch (error) {
        console.log(error)
        return res.json({
            success: false,
            message: "Internal server error",
            status: 500
        })
    }
});

exports.plans = (async (req, res) => {
    try {

        const { id } = req.body;

        const schema = Joi.alternatives(
            Joi.object({
                id: [Joi.number().empty().required()]
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
            console.log("hi")
            const data = await getPlans(id);
            if (data != 0) {
                return res.json({
                    message: "fetch plan successfully",
                    success: true,
                    status: 200,
                    plan: data
                });
            }
            else {
                return res.json({
                    message: "No plans",
                    success: false,
                    status: 400
                });
            }
        }
    }
    catch (error) {
        console.log(error);
        return res.json({
            message: "Internal server error",
            success: false,
            status: 500
        });
    }
});

