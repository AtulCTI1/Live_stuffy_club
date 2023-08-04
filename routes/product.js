const express = require('express');
const productController = require('../controller/productController');
const upload_category = require('../middleware/upload_category');
const upload_product = require('../middleware/upload_product');
const upload_sprites = require('../middleware/upload_sprites');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/addCategory', auth, upload_category.single('file'), productController.addProductCategory);

// router.post('/addProduct', upload_product.array('files', 5), productController.addProduct);

router.post('/add_Product', auth, upload_product.array('files'), productController.add_product);

router.post('/add_Product_admin', upload_product.array('files'), productController.add_product_admin);

router.post('/edit_product', auth, upload_product.array('files'), productController.edit_product);

router.get('/getProducts', auth, productController.getProducts);

router.post('/getProductsbyid', auth, productController.getProductbyid);

router.post('/getProductsbyuserid', auth, productController.getProductbyuserid);

router.get('/getCategory', auth, productController.getProductCategory);

router.post('/getProductbycategory', auth, productController.getproductBycategory);

router.post('/getexclusive_stuffy', auth, productController.getexclusive_stuffy);

router.post('/getnewest_stuffy', auth, productController.getnewest_stuffy);

router.get('/getQRcode', auth, productController.getQRcode);

router.post('/addgallery', auth, productController.addgallery);

router.post('/addsprite', auth, productController.addsprite);

router.post('/add_friend', auth, productController.add_friend);

router.post('/friend_request', auth, productController.friend_request);

router.post('/getgallery', auth, productController.getgallery);

router.post('/getsprites', auth, productController.getsprites);

router.post('/get_all_friends', auth, productController.get_all_friends);

router.post('/get_my_friend', auth, productController.get_my_friend);

router.post('/share_my_gallery', auth, productController.share_my_gallery);

router.post('/get_share_gallery', auth, productController.get_share_gallery);

router.post('/delete_product', auth, productController.delete_product);

router.post('/delete_mygallery_product', auth, productController.delete_mygallery_product);

router.post('/update_sprites', auth, upload_sprites.array('files'), productController.update_sprites);



module.exports = router;    