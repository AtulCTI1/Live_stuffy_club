const db = require('../utils/database');

module.exports = {

    getproductByCategory: (async (search) => {
        let where = ''
        if (search) {
            where = ` where  category_name LIKE '%${search}%'`;
        }
        return db.query(`select * from categories ${where}`);
    }),

    getexclusive_stuffy: (async (search) => {

        let where = ''
        if (search) {
            where = ` AND  product_name LIKE '%${search}%'`
        }
        return db.query(`select * from products where exclusive_stuffy ="1" ${where}`);
    }),

    getPlans: (async (id) => {
        return db.query('select * from plans where id =?', [id]);
    }),

    getnewest_stuffy: (async (search) => {

        let where = ''
        if (search) {
            where = ` where  product_name LIKE '%${search}%'`
        }
        return db.query(`SELECT * FROM products ${where} ORDER BY created_at DESC LIMIT 5`);
    }),

    dashboard_details: (async (user_id) => {
        return db.query('SELECT user_id,category_id,created_at,exclusive_stuffy FROM `products` where user_id= ? AND exclusive_stuffy="1"', [user_id]);
    }),

    fetchproductimage: (async (id) => {
        return db.query(`SELECT CONCAT('http://159.89.248.34:3000/product/', Image_names) AS Image_names FROM product_images where product_id = ?`, [id]);
    }),

    fetchterms_and_condition: (async () => {
        return db.query('select * from terms_and_condition where id = 1');
    }),

    fetchprivacyPolicy: (async () => {
        return db.query('select * from terms_and_condition where id = 2');
    }),

    getproduct: (async (search) => {
        return db.query(`select * from products where product_name =?`, [search]);
    }),

    get_notification_count: (async (user_id) => {
        return db.query(`SELECT COUNT(status)  AS count FROM notifications where status = 1 AND  user_id = ? `, [user_id]);
    }),

    Get_Purchase_Qrcode: (async (product_id, user_id) => {
        return db.query(` select * from qr_code where  product_id = '${product_id}' AND user_id = '${user_id}'`);
    }),

}