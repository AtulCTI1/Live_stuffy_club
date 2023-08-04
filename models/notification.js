const db = require('../utils/database');

module.exports = {

    addnotification: (async (notification_1) => {
        return db.query('insert into notifications set ?', [notification_1])
    }),

    fetchFCM_token: (async (user_id) => {
        return db.query('select fcm_token from users where user_id = ?', [user_id])
    }),

    fetchnotification: (async (user_id) => {
        return db.query('select * from notifications where user_id = ?', [user_id]);
    }),

    change_status: (async (user_id) => {
        return db.query('UPDATE notifications  SET status = 0 where user_id = ?', [user_id]);
    }),

    delete_notification_after10days: (async (user_id) => {
        return db.query('DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL 10 DAY ) AND user_id =?', [user_id])
    })
}