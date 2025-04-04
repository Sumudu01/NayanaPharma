import User from "../models/user.model.js";
import Item from "../models/item.model.js";
import Payment from "../models/payment.model.js";

import bcryptjs from 'bcryptjs';
import { errorHandler } from "../utils/error.js";
import jwt from 'jsonwebtoken'

//register
// export const signup=async(req,res,next)=>{
//     const {username,email,password}=req.body;
//     const hashPassword=bcryptjs.hashSync(password,10)
//     const newUser=new User({username,email,password:hashPassword});
//     try{
//         await newUser.save();
//         res.status(201).json({message:"user created successfully"});
//     }catch(error){
//         next(error);
//     }
   
// }
export const signup = async (req, res, next) => {
    try {
        const { username, email, password, status } = req.body;
        const hashPassword = bcryptjs.hashSync(password, 10);

        // Ensure that only admins can create new admins
        let userStatus = 0; // Default: Regular User

        if (status === 1) { // User is trying to create an admin
            if (!req.user || req.user.status !== 1) { // Check if requester is an admin
                return res.status(403).json({
                    success: false,
                    message: "Not authorized to create an admin",
                    statusCode: 403
                });
            }
            res.status(201).json({ message: "Admin created successfully" });
            userStatus = 1; // Allow admin creation if authorized
        }

        const newUser = new User({ username, email, password: hashPassword, status: userStatus });

        await newUser.save();
        res.status(201).json({ message: "User created successfully" });
    } catch (error) {
        next(error);
    }
};

export const admin_create= async (req, res) => {
    try {
        const existingAdmin = await User.findOne({ status: 1 });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin already exists" });
        }

        const hashedPassword = bcryptjs.hashSync("adminpassword123", 10);
        const admin = new User({
            username: "admin",
            email: "admin@example.com",
            password: hashedPassword,
            status: 1 // Admin
        });

        await admin.save();
        res.status(201).json({ message: "Admin created successfully" });
    } catch (error) {
        res.status(500).json({ message: "Internal Server Error" });
    }
};
//login 
// export const signin =async(req,res,next)=>{
//     const{email,password}=req.body
//     try{
//         const validUser=await User.findOne({email})
//         if(!validUser) return next(errorHandler(404,'user not found'));
//         const validPassword = bcryptjs.compareSync(password,validUser.password)
//         if(!validPassword) return next(errorHandler(401,'wrong credentials'))
//             const token=jwt.sign({id:validUser._id},process.env.JWT_SECRET)
//         const{password:hashedPassword,...rest}=validUser._doc;

//         const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day from now
//         res.cookie('access_token', token, { httpOnly: true, expires: expiryDate })
//         .status(200)
//         .json(rest);

//     }catch(error){
//         next(error)
//     }
// }
export const signin = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const validUser = await User.findOne({ email });
        if (!validUser) return next(errorHandler(404, 'User not found'));

        const validPassword = bcryptjs.compareSync(password, validUser.password);
        if (!validPassword) return next(errorHandler(401, 'Wrong credentials'));

        const token = jwt.sign({ id: validUser._id, status: validUser.status }, process.env.JWT_SECRET, { expiresIn: "1d" });

        const { password: hashedPassword, ...rest } = validUser._doc;

        const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 1 day from now
        res.cookie('access_token', token, { httpOnly: true, expires: expiryDate })
            .status(200)
            .json(rest);

    } catch (error) {
        next(error);
    }
};

export const verifyAdmin = async (req, res, next) => {
    try {
        // Get token from cookies
        const token = req.cookies.access_token;
        if (!token) return next(errorHandler(401, "Unauthorized - No token provided"));

        // Decode token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);

        if (!user) return next(errorHandler(404, "User not found"));
        if (user.status !== 1) return next(errorHandler(403, "Access denied - Admins only"));

        req.user = user; // Store user data in request
        next(); // Proceed to the next function
    } catch (error) {
        next(errorHandler(403, "Forbidden - Invalid or expired token"));
    }
};
//item register
export const store=async(req,res,next)=>{
    const {userId,ProductId,sup_name,productName,stock_quentity,sold_quentity,price,status
        }=req.body;

    //create auto id for orderid
    function idGen(userId){
        const randomString=Math.random().toString(36).substring(2,10);
        const id='ORD'+randomString+userId;
        return id;
    }
    const petId=idGen(userId)
   

    const newItem=new Item({petId,userId, sup_name,ProductId,productName,stock_quentity,sold_quentity,price,status});
    try{
        await newItem.save();
        res.status(202).json({message:"item created successfully"});
    }catch(error){
        next(error);
    }
   
}
export const pay=async(req,res,next)=>{
    const {userId,phone,order,email,p_method,crd_number,expd_date,cvv,
   
        }=req.body;

    //create auto id for orderid
    function idGen(userId){
        const randomString=Math.random().toString(36).substring(2,10);
        const id='ORD'+randomString+userId;
        return id;
    }
    const petId=idGen(userId)
   

    const newItem=new Payment({petId,userId,phone,order,email,p_method,crd_number,expd_date,cvv,});
    try{
        await newItem.save();
        res.status(202).json({message:"item created successfully"});
    }catch(error){
        next(error);
    }
   
}


//get items by userid
export const getOrdersByCustomerId = async (req, res, next) => {
    try{
       const customerId=req.params.id;
        const orders=await Item.find({userId:customerId})
        res.json(orders)
    }catch(error){
        console.log(error)
        res.status(500).json({error:'Internal server error'})
    }
};
export const paybyid = async (req, res, next) => {
    try{
       const customerId=req.params.id;
        const orders=await Payment.find({userId:customerId})
        res.json(orders)
    }catch(error){
        console.log(error)
        res.status(500).json({error:'Internal server error'})
    }
};

//all items
export const allitems = async (req, res, next) => {
    try{
    
        const orders=await Item.find({})
        res.json(orders)
    }catch(error){
        console.log(error)
        res.status(500).json({error:'Internal server error'})
    }
};

export const allpays = async (req, res, next) => {
    try{
    
        const orders=await Payment.find({})
        res.json(orders)
    }catch(error){
        console.log(error)
        res.status(500).json({error:'Internal server error'})
    }
};

export const allproducts = async (req, res, next) => {
    try{
    
        const orders=await Item.find({})
        res.json(orders)
    }catch(error){
        console.log(error)
        res.status(500).json({error:'Internal server error'})
    }
};
export const google=async(req,res,next)=>{
    try{
        const user=await User.findOne({email:req.body.email})

        if(user){
            const token=jwt.sign({id:user._id},process.env.JWT_SECRET);
            const {password:hashedPassword, ...rest}=user._doc;
            const expiryDate=new Date(Date.now() + 24 * 60 * 60 * 1000);
            res.cookie('access_token', token, { httpOnly: true, expires: expiryDate })
            .status(200)
            .json(rest);
       
        }else{
            const generatedPassword=
            Math.random().toString(36).slice(-8)+
            Math.random().toString(36).slice(-8)

            const hashedPassword=bcryptjs.hashSync
            (generatedPassword,10);

            const newUser=new User({username:req.body.name.split(' ').join('').toLowerCase()+
                Math.random().toString(36).slice(-8),
                email:req.body.email,password:hashedPassword,profilePicture:req.body.photo,
            });
            await newUser.save();
            const token=jwt.sign({id:newUser._id},process.env.JWT_SECRET);
            const {password:hashedPassword2, ...rest}=newUser._doc;
            const expiryDate=new Date(Date.now() + 24 * 60 * 60 * 1000);
            res.cookie('access_token', token, { httpOnly: true, expires: expiryDate })
            .status(200)
            .json(rest);


        }
    }catch(error){
        next(error)
    }
}


 // Adjust the path as needed
//images
export const google1 = async (req, res, next) => {
    try {
        const user = await Item.findOne({ email: req.body.itemId });

        if (user) {
            const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
            const { password, ...rest } = user._doc;
            const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
            res.cookie('access_token', token, { httpOnly: true, expires: expiryDate })
                .status(200)
                .json(rest);
        } else {
            const generatedPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
            const hashedPassword = bcryptjs.hashSync(generatedPassword, 10);

            const newUser = new Item({
                username: req.body.name.split(' ').join('').toLowerCase() + Math.random().toString(36).slice(-8),
                email: req.body.itemId,
                password: hashedPassword,
                profilePicture: req.body.photo
            });
            
            await newUser.save();

            const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
            const { password, ...rest } = newUser._doc;
            const expiryDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
            res.cookie('access_token', token, { httpOnly: true, expires: expiryDate })
                .status(200)
                .json(rest);
        }
    } catch (error) {
        next(error);
    }
};






export const signout=(req,res)=>{
    res.clearCookie('access_token').status(200).json('Signout Success')
}