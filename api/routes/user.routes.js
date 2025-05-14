import express from 'express'
import { getUsers, updateUser,deleteUser,updateItem,deletepayment,deleteItem,getItem } from '../controllers/user.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router=express.Router();

router.get('/',getUsers)
router.post("/update/:id",verifyToken,updateUser)
router.delete("/delete/:id",verifyToken,deleteUser)




//items
router.delete("/deleteitem/:id", deleteItem) // Removed verifyToken middleware
router.get('/getitem/:id', getItem);//for update fetch data
router.put("/updateitem", updateItem) // Removed verifyToken middleware
router.delete("/deletepay/:id",deletepayment)




export default router