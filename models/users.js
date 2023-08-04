const db = require('../utils/database');

module.exports = {

    registerUser: (async (user) => {
        return db.query('insert into users set ?', [user]);
    }),

    fetchUserByEmail: (async (email) => {
        return db.query('select * from users where email = ?', [email]);
    }),

    updateToken: (async (token, email) => {
        return db.query('Update users set token= ? where email=?', [token, email]);
    }),

    fetchUserByActToken: (async (act_token) => {
        return db.query('select * from users where act_token = ?', [act_token]);
    }),

    updateFCM: (async (fcm_token, device_type, email) => {
        return db.query('Update users set  fcm_token=?, device_type=? where email=?', [fcm_token, device_type, email]);
    }),

    updateUser: (async (token, email) => {
        return db.query('Update users set token=? where email=?', [token, email]);
    }),

    updateUserByActToken: (async (token, act_token, status, id) => {
        return db.query(`Update users set verify_user = 1, token = ?, act_token = ?, status =? where id = ?`, [token, act_token, status, id])
    }),

    fetchUserByToken: (async (token) => {
        return db.query('select * from users where token = ?', [token]);
    }),

    updatePassword: (async (password, token) => {
        return db.query('Update users set password= ? where token=?', [password, token]);
    }),

    fetchUserById: (async (id) => {
        return db.query(' select * from users where token= ?', [id])
    }),

    fetchUserBy_Id: (async (id) => {
        return db.query('select * from users where id= ?', [id])
    }),
    fetchUserBy_Id_1: (async (user_id) => {
        return db.query('select * from users where id= ?', [user_id])
    }),

    updateUserById: (async (user, user_id) => {
        return db.query('Update users set ? where id= ?', [user, user_id]);
    }),

    updateUserbyPass: (async (password, user_id) => {
        return db.query('Update users set password=? where  id =?', [password, user_id]);
    }),

    updateplan: (async (Membership_Plan, id) => {
        return db.query('Update users set Membership_Plan=? where  id =?', [Membership_Plan, id]);
    }),

    addnotification: (async (message) => {
        return db.query('insert into notifications set ?', [message])
    }),

    fetchTokenOfUser: (async (token) => {
        return db.query('select * from users where token=?', [token]);
    }),

    fetch_fcm: (async (id) => {
        return db.query('select fcm_token from users where id = ?', [id]);
    }),

    share: (async (sharing) => {
        return db.query('insert into share set ?', [sharing]);
    }),

    deleteUserBy_Id: (async (id) => {
        return db.query('delete  from users where id= ?', [id])
    }),

    deleteUserBy_Id: (async (user_id) => {
        return db.query('delete  from users where id= ?', [user_id])
    }),

}   