import mongoose from "mongoose";

const adminSchema =new mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
     
    },
    
},{timestamps:true});

const Admin=mongoose.model("manager",adminSchema)

export default Admin;

