var FCM = require('fcm-node');
const Joi = require('joi');
// const { response } = require('..');
const { addnotification, delete_notification_after10days, fetchnotification, change_status, fetchFCM_token } = require('../models/notification');



exports.testNotification = (async (req, res) => {
    try {
        const serverKey = "AAAAb1yACDc:APA91bHPa6DP2pjvWnRiQgq-XcZqLeq3r8zuJ1XzT2BlvEQH0lXJVKYlh5RVJQqjeOd0p7Im7l68n39c1NAULnzJpRhRwH7HOl9OZU7DbI4a5KJB2DXMJ1jGtj6u_9e5Xp-enXgYetuW"; // replace with your FCM server key
        const fcm = new FCM(serverKey);

        // const FCM_token = await fetchFCM_token(user_id)
        // console.log("FCM_token>>>>>>>>>",FCM_token)
        const message_1 = {
            to: 'fLjRcGM3Rq6GUqFkPeLoGB:APA91bFh7nALgCedB548-8Lqz3ry-limSeBJJX_V17asEmf47mITAes8JDfROIGmyn8y3JqnSTp4TBn3wK63kAq8t1sVSrlE8U_smEfL2H-Vj9vWvmmcrUCX84-nCiSv9fFmfoeUtt_C',
            notification: {
                title: req.body.tittle,
                body: req.body.body,
                icon: 'icon_name_here',
                click_action: 'notification_click_action_here',
                sound: "default",
                icon: "fcm_push_icon",
            },
            data: {
                key1: 'value1',
                key2: 'value2'
            }
        };

        fcm.send(message_1, (err, response) => {
            if (err) {
                // console.log('Error>>>>>>>>>>', err);
                res.json({
                    message: "Error",
                    Error: err,
                    success: false,
                    status: 500
                });
            } else {
                // console.log('Response>>>>>>>>>>>>>', response);
                // console.log('Response>>>>>>>>>>>>>', response);
                res.json({
                    message: "notification send successfull",
                    Response: response,
                    success: true,
                    status: 200
                });
            }
            // console.log('Response>>>>>>>>>>>>>', response.multicast_id);
        });
        // let notification_1 = {
        //     title: 'Title of the notification',
        //     body: 'Body of the notification',
        //     user_id: 11,
        //     device_token: 'fFidG4TdTvmGMcO-7pGMlp:APA91bFzB_uWKa7ospI_ASWD0wpXypovK2dxeuiLnEV2HfqmM0WKBL78q2lC0m4VGrS4_XFGiWFEZEauWPPwsPOMMF_xmuEHkVlLzPjqniOJKfRiIXH0Zq9a1kb1wpFQkhoGA7AuCALo',
        // }

        // const result = await addnotification(notification_1)
        // const result = await addnotification(notification_1)
        // console.log("result>>>>>>>>>>>>>>", result)

        // return res.json({
        //     message: "notification send successfull",
        //     success: true,
        //     status: 200
        // });
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


exports.getallNotification = (async (req, res) => {
    try {
        const { user_id } = req.body;

        const schema = Joi.alternatives(
            Joi.object({
                user_id: [Joi.number().empty().required()]
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
        const get_all_notification = await fetchnotification(user_id)
        const notification_seen = await change_status(user_id)
        const delete_after_10days = await delete_notification_after10days(user_id)
        // console.log("get all notification", get_all_notification)



        res.json({
            message: "successfully Get All notification",
            Response: get_all_notification,
            success: true,
            status: 200
        });

    } catch (error) {
        console.log(error);
        return res.json({
            message: "Internal server error",
            success: false,
            status: 500
        });
    }
});