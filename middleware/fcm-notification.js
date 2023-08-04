var FCM = require('fcm-node');
const { addnotification } = require('../models/notification');
function push_notification() {
    const serverKey = "AAAA94qfocM:APA91bH1_ffC0XaPAGKnik7Ww5BvzB1hXRUdIpKP35aYgMD_uAr5O6V22JFpCkzAFTSgsbvaRhTMyS_D1PPd2LyfIhyU8FboCBxh-vyuFSsdIliuBgIChdh5lv_dE6lYsxZtOmfOFxLO"; // replace with your FCM server key
    const fcm = new FCM(serverKey);

    const message = {
        to: 'fFidG4TdTvmGMcO-7pGMlp:APA91bFzB_uWKa7ospI_ASWD0wpXypovK2dxeuiLnEV2HfqmM0WKBL78q2lC0m4VGrS4_XFGiWFEZEauWPPwsPOMMF_xmuEHkVlLzPjqniOJKfRiIXH0Zq9a1kb1wpFQkhoGA7AuCALo',
        notification: {
            title: title,
            body: body,
            user_id: user_id,
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

    fcm.send(message, async (err, response) => {
        if (err) {
            console.log('Error:', err);
        } else {
            console.log('Response:', response);
        }
        const result = await addnotification(notification_1)
        console.log("result>>>>>>>>>>>>>>", result)
    })

}

module.exports = push_notification;