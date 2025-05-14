import express from 'express'
import { signin,pay, allpays,signup,paybyid,google,signout,allproducts,store,getOrdersByCustomerId,allitems,google1,verifyAdmin,admin_create } from '../controllers/auth.controller.js';


const router=express.Router();

router.post("/signup",signup)//register
router.post("/signin",signin)//login
router.post("/google",google)
router.post("/google1",google1)
router.get('/signout',signout)

router.post('/admin_create',admin_create)
router.post('/newadmin/signup', verifyAdmin, signup);
router.get('/admin-dashboard', verifyAdmin, (req, res) => {
    res.status(200).json({ message: "Welcome Admin!"});
});


router.post("/store",store)
router.post("/pay",pay)
router.get("/user/:id",getOrdersByCustomerId)
router.get("/user/pay/:id",paybyid)//for data fetch user id
//router.get("/users/items",allitems)
router.get('/allitems', verifyAdmin, allitems);
router.get('/allproducts',allproducts);

export default router