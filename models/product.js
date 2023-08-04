const db = require('../utils/database');

module.exports = {

    addCategory: (async (user) => {
        return db.query('insert into categories set ?', [user])
    }),

    addImage: (async (user_1) => {
        return db.query('insert into products where product_image = ?', [user_1])
    }),

    addProduct: (async (user) => {
        return db.query('insert into products set ?', [user])
    }),

    get_sprite_id: (async (user_id) => {
        return db.query('select * from sprites where user_id=?', [user_id])
    }),

    addQRcode: (async (user) => {
        return db.query('insert into qr_code set ?', [user])
    }),

    addProductimage: (async (product_image) => {
        return db.query('insert into products set ?', [product_image])
    }),

    addProduct_images: (async (images_info) => {
        return db.query('insert into sprites set ?', [images_info])
    }),

    addProduct_images_1: (async (images_info) => {
        return db.query('insert into product_images set ?', [images_info])
    }),

    fetchCategory: (async (category_name) => {
        return db.query('select * from categories where category_name = ?', [category_name]);
    }),

    fetchproductBycategory: (async (category_id) => {
        return db.query('select * from products where category_id = ?', [category_id]);
    }),

    getAllProduct: (async () => {
        return db.query('select * from products',);
    }),

    getAllProductimage: (async () => {
        return db.query('select * from product_image',);
    }),

    getProductbyid: (async (id) => {
        return db.query('select * from products where id = ? ', [id]);
    }),

    getProductbyuserid: (async (user_id) => {
        return db.query('select * from products where user_id = ? ', [user_id]);
    }),

    fetchProduct: (async (product_name) => {
        return db.query('select * from products where product_name = ?', [product_name]);
    }),

    fetchProduct_1: (async (product_id, user_id) => {
        return db.query('select * from products where id = ? AND user_id =?', [product_id, user_id]);
    }),

    fetchProduct_gallery: (async (product_id, user_id) => {
        return db.query('select * from gallery where product_id = ? AND user_id =?', [product_id, user_id]);
    }),


    getAllCategory: (async () => {
        return db.query('select * from `categories`');
    }),

    getproductByCategory: (async () => {
        return db.query('select * from categories ');
    }),

    getexclusive_stuffy: (async (user_id) => {
        return db.query('select * from products where exclusive_stuffy ="1" and user_id =?', [user_id]);
    }),

    getnewest_stuffy: (async () => {
        return db.query('SELECT * FROM products ORDER BY created_at DESC LIMIT 5');
    }),

    dashboard_details: (async (user_id) => {
        return db.query('SELECT user_id,category_id,created_at,exclusive_stuffy FROM `products` where user_id= ? AND exclusive_stuffy="1"', [user_id]);
    }),

    fetchterms_and_condition: (async () => {
        return db.query('select * from terms_and_condition where id = 1');
    }),

    fetchprivacyPolicy: (async () => {
        return db.query('select * from terms_and_condition where id = 2');
    }),


    fetchproductimage: (async (id) => {
        return db.query(`SELECT CONCAT('http://159.89.248.34:3000/product/', Image_names) AS Image_names FROM product_images where product_id = ?`, [id]);
    }),

    fetchproductimage_1: (async (product_id) => {
        return db.query(`SELECT CONCAT('http://159.89.248.34:3000/product/', Image_names) AS Image_names FROM product_images where product_id = ?`, [product_id]);
    }),


    addtogallery: (async (data) => {
        return db.query('insert into gallery set ?', [data])
    }),

    addtosprites: (async (data) => {
        return db.query('insert into sprites set ?', [data])
    }),

    check_sprites: (async (user_id, product_id) => {
        return db.query('select * from sprites where user_id =? AND product_id = ?', [user_id, product_id])
    }),

    addfriend: (async (sender_id, reciver_id) => {
        return db.query('UPDATE friends SET status = 1 where sender_id=? AND reciver_id=?', [sender_id, reciver_id])
    }),

    share_gallery: (async (data) => {
        return db.query('insert into share_gallery set ?', [data])
    }),

    get_sprite: (async (user_id) => {
        return db.query('select * from sprites where user_id = ?', [user_id])
    }),

    get_sprite_1: (async (sprite_id) => {
        return db.query(`SELECT CONCAT('http://159.89.248.34:3000/sprites/', Image_names) AS Image_names FROM product_images where sprite_id = ?`, [sprite_id])
    }),


    Get_all_users: (async (user_id) => {
        return db.query(`SELECT A.* ,(exists (select 1
            from friends B where B.reciver_id= A.id  and
             B.sender_id = '${user_id}'  ) ) as is_friends FROM users A `)
    }),

    Get_all_users_1: (async (user_id) => {
        return db.query(`SELECT A.* ,(exists (select 1
            from friends B where B.sender_id= A.id and
             B.reciver_id = '${user_id}' ) ) as is_friends FROM users A `)
    }),

    getuser_freinds: (async (user_id) => {
        return db.query('select * from friends where user_id = ?', [user_id])
    }),

    getgallery: (async (user_id) => {
        return db.query('SELECT products.user_id,gallery.user_id as gallery_user_id ,products.product_name AS product_name, products.id AS product_id, products.Description AS Description, products.status AS status , products.QR_Code AS QR_code , products.QR_code_image AS QR_code_image   FROM products  JOIN gallery ON products.id = gallery.product_id  where gallery.user_id = ?', [user_id])
    }),

    getsprites: (async (user_id) => {
        return db.query('SELECT sprites.user_id,products.product_name AS product_name, products.id AS product_id   FROM products  JOIN sprites ON products.id = sprites.product_id  where sprites.user_id = ? AND Image_names = 0', [user_id])
    }),

    get_sprite: (async (user_id) => {
        return db.query(`SELECT CONCAT('http://159.89.248.34:3000/sprites/', Image_names) AS Image_names FROM sprites where user_id = ? AND product_id = 0`, [user_id])
    }),

    getmyfriend: (async (user_id) => {
        return db.query('SELECT users.id AS friend_id,users.full_name AS friend_name , users.profile_image AS profile_image   FROM users  JOIN friends ON users.id = friends.reciver_id  where friends.sender_id = ? AND friends.status = 1', [user_id])
    }),

    getmyfriend_A: (async (user_id) => {
        return db.query('SELECT users.id AS friend_id,users.full_name AS friend_name , users.profile_image AS profile_image   FROM users  JOIN friends ON users.id = friends.reciver_id  where friends.sender_id = ? AND friends.status = 1 OR friends.status = 0', [user_id])
    }),

    getmyfriend_1: (async (user_id) => {
        return db.query('SELECT users.id AS friend_id,users.full_name AS friend_name , users.profile_image AS profile_image   FROM users  JOIN friends ON users.id = friends.sender_id  where friends.reciver_id = ? AND friends.status = 1', [user_id])
    }),
    getmyfriend_2: (async (user_id) => {
        return db.query('SELECT users.id AS friend_id,users.full_name AS friend_name , users.profile_image AS profile_image   FROM users  JOIN friends ON users.id = friends.sender_id  where friends.reciver_id = ? AND friends.status = 1 OR friends.status = 0 ', [user_id])
    }),

    getexclusive_stuffy: (async () => {
        return db.query('select * from products where exclusive_stuffy =1',)
    }),

    count_product: (async (user_id) => {
        return db.query('SELECT COUNT(user_id)  AS count FROM gallery where user_id = ?', [user_id])
    }),

    updateQR_product: (async (QR_code_image, id) => {
        return db.query('Update products set QR_code_image = ? where id = ?', [QR_code_image, id]);
    }),

    getnewest_stuffy: (async () => {
        return db.query('SELECT * FROM products ORDER BY created_at DESC LIMIT 10');
    }),

    fetchproductimage: (async (id) => {
        return db.query(`SELECT CONCAT('http://159.89.248.34:3000/product/', Image_names) AS Image_names FROM product_images where product_id = ?`, [id]);
    }),

    fetch_shareing_code: (async (shareing_code) => {
        return db.query('select * from share_gallery where shareing_code = ? ', [shareing_code]);
    }),

    fetchFCM_token: (async (user_id) => {
        return db.query('select fcm_token from users where id = ?', [user_id])
    }),

    addnotification: (async (notification_1) => {
        return db.query('insert into notifications set ?', [notification_1])
    }),

    get_gallery_id: (async (user_id) => {
        return db.query('select * from  gallery where user_id =?', [user_id])
    }),

    fetch_user: (async (users_1) => {
        return db.query('select * from users where id = ?', [users_1])
    }),

    fetch_friend_from_gallery: (async (user_id) => {
        return db.query('select * from share_gallery where friend_id = ? ', [user_id]);
    }),

    friend_request: (async (sender_id, reciver_id) => {
        return db.query('select * from  friends where sender_id = ? AND reciver_id = ?', [sender_id, reciver_id])
    }),

    send_request: (async (data) => {
        return db.query('insert into friends set ?', [data])
    }),

    fetch_fcm: (async (reciver_id) => {
        return db.query('select fcm_token from users where id = ?', [reciver_id]);
    }),

    fetch_fcm_1: (async (sender_id) => {
        return db.query('select fcm_token from users where id = ?', [sender_id]);
    }),


    fetch_fcm_1: (async (friend_id) => {
        return db.query('select fcm_token from users where id = ?', [friend_id]);
    }),

    user_info: (async (sender_id) => {
        return db.query('select * from users where id =? ', [sender_id]);
    }),

    user_info_1: (async (reciver_id) => {
        return db.query('select * from users where id =? ', [reciver_id]);
    }),

    user_info_2: (async (user_id) => {
        return db.query('select * from users where id =? ', [user_id]);
    }),

    cancel_request: (async (sender_id, reciver_id) => {
        return db.query(' UPDATE notifications  SET friend_request_status = 1  where sender_id=? AND reciver_id=?', [sender_id, reciver_id]);
    }),

    update_friend_request: (async (sender_id, reciver_id) => {
        return db.query('UPDATE friends SET status = 2 where sender_id=? AND reciver_id=?', [sender_id, reciver_id]);
    }),

    all_users_without_friend: (async (all_user) => {
        return db.query(`SELECT *  FROM users WHERE id NOT IN (${all_user})`);
    }),

    all_users: (async () => {
        return db.query(`SELECT *  FROM users`);
    }),

    delete_cancel_request: (async (sender_id, reciver_id) => {
        return db.query(` delete  from friends where  sender_id=? AND reciver_id=? `, [sender_id, reciver_id]);
    }),

    // update_Product: (async (product_name, product_id, Description, status) => {
    //     return db.query(`UPDATE products SET product_name ='${product_name}', Description ='${Description}', status='${status}' where id=${product_id}`, [product_name, product_id, Description, status])
    // }),

    update_Product: (async (user, user_id, id) => {
        return db.query('Update products set ? where user_id= ? AND id=? ', [user, user_id, id]);
    }),

    updateUserById: (async (user, user_id) => {
        return db.query('Update users set ? where id= ?', [user, user_id]);
    }),

    delete_Product: (async (id, user_id) => {
        return db.query(`delete from products  where id=? AND user_id=?`, [id, user_id])
    }),

    delete_gallery_Product: (async (product_id, user_id) => {
        return db.query(`delete from gallery  where product_id=? AND user_id=?`, [product_id, user_id])
    }),

    delete_Product_images: (async (product_id, user_id) => {
        return db.query(`delete from  product_images where product_id=? AND user_id=?`, [product_id, user_id])
    }),

    User_info: (async (user_id) => {
        return db.query('select * FROM users where id = ?', [user_id])
    }),

    stripe_product: (async (product_id, id) => {
        return db.query(` update products set strip_product_id = '${product_id}' where id = '${id}' `);
    }),

    stripe_price: (async (price_id, id) => {
        return db.query(` update products set strip_price_id = '${price_id}' where id = '${id}' `);
    }),

    Get_Purchase_Qrcode: (async (product_id, user_id) => {
        return db.query(` select * from qr_code where  product_id = '${product_id}' AND user_id = '${user_id}'`);
    }),


}