import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userRoutes from './routes/user.routes.js'
import authroutes from './routes/auth.routes.js'
import adminroutes from './routes/admin.routes.js'
import supplierRoutes from './routes/supplierRoute.js'
import inventoryRoute from './routes/inventoryRoutes.js'
import salesRoute from './routes/saleRoutes.js'
import deliveriesRoute from './routes/deliveryinventory.js'
import cookieParser from 'cookie-parser';

dotenv.config();

mongoose.connect(process.env.MONGO).then(()=>{
    console.log('Connected to Mongodb')
}).catch((err)=>{
    console.log(err)
})

const app = express();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173'); // change to your frontend URL
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});


app.use(express.json());
app.use(cookieParser());

app.listen(3000, () => {
    console.log('server listen on port 3000!')
});


app.use("/api/user",userRoutes)
app.use("/api/auth",authroutes)
app.use("/api/admin",adminroutes)
app.use("/supplier", supplierRoutes)
app.use("/inventory", inventoryRoute)
app.use("/sales", salesRoute)
app.use("/delivery", deliveriesRoute)

app.use((err,req,res,next)=>{
    const statusCode=err.statusCode||500;
    const message=err.message||'internal server error'
    return res.status(statusCode).json({
        success:false,
        message,
        statusCode,
    })
})