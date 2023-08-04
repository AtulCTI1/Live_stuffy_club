const db = require('../utils/database');

module.exports = {

    addpayment: (async (payout) => {
        return db.query('insert into payment set ?', [payout])
    }),


    addcustomer: (async (customer_info) => {
        return db.query('insert into customer set ?', [customer_info])
    }),

    add_payment: (async (idValue, user_id) => {
        return db.query(`insert into payment set payment_id='${idValue}', status = 'Done',user_id = '${user_id}' `, [idValue, user_id])
    }),

    update_Status: (async (user_id) => {
        return db.query(`update users set Membership_Plan='1' where id='${user_id}' `)
    }),

    add_payment_QRcode: (async (payment_id, user_id, product_id) => {
        return db.query(`insert into qr_code_payment set payment_id='${payment_id}', status = 'Done',user_id='${user_id}' , product_id ='${product_id}' `)
    }),

    add_payment_1: (async (idValue) => {
        return db.query(`insert into payment set payment_id='${idValue}', status = 'cancel',user_id='${user_id}' `, [idValue])
    }),

    update_QRcode: (async (user_id, product_id, QR_code) => {
        return db.query(`insert into qr_code set user_id='${user_id}' , product_id ='${product_id}' , QR_code ='${QR_code}' `)
    }),


    fetch_product: (async (product_id) => {
        return db.query(`select * from products where id = '${product_id}'`)
    }),

    Get_Purchase_Qrcode: (async (product_id, user_id) => {
        return db.query(` select * from qr_code where  product_id = '${product_id}' AND user_id = '${user_id}'
         `);
    }),

    save_CARD: (async (token_id, card_id, customer_id, user_id, fingerprint) => {
        return db.query(`insert into cards set user_id='${user_id}' , card_id ='${card_id}' , customer_id ='${customer_id}',token_id ='${token_id}',fingerprint ='${fingerprint}'  `);
    }),

    getProductbyid: (async (product_id) => {
        return db.query(`select * from products where id = '${product_id}'`);
    }),

    get_token_by_id: (async (user_id) => {
        return db.query(`select * from  cards where user_id='${user_id}' `);
    }),

    get_token: (async (token_id) => {
        return db.query(`select * from  cards where token_id='${token_id}' `);
    }),

    delete_card: (async (token_id, fingerprint) => {
        return db.query(`delete from  cards where token_id='${token_id}' OR fingerprint='${fingerprint}' `);
    }),
}