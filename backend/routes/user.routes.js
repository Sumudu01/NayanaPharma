import express from 'express'
import { test, updateUser,deleteUser,updateItem,deletepayment,deleteItem,getItem } from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router=express.Router();

router.get('/',test)
router.post("/update/:id",verifyToken,updateUser)
router.delete("/delete/:id",verifyToken,deleteUser)




//items
router.delete("/deleteitem/:id",verifyToken,deleteItem)
router.get('/getitem/:id', getItem);//for update fetch data
router.put("/updateitem",verifyToken,updateItem)
router.delete("/deletepay/:id",deletepayment)




export default router