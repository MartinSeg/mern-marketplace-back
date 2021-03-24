import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path'
import userRouter from './routers/userRouter.js';
import productRouter from './routers/productRouter.js';
import orderRouter from './routers/orderRouter.js';
import uploadRouter from './routers/uploadRouter.js';

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URL || 'mongodb://localhost/amazona', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});



app.use(cors());
app.use('/api/users', userRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter)
app.use('/api/uploads', uploadRouter)
app.get('/api/config/paypal', (erq, res) => {
    res.send(process.env.PAYPAL_CLIENT_ID || 'sb')
})

// *************************** MIDDLEWARES*********************** //

app.use( (err, req, res, next) => {
    res.status(500).send({ message: err.message})
})

// **************************************************************//
app.use('/uploads', express.static(path.resolve() + '/uploads'));
app.listen(process.env.PORT || 5000, ()=> {console.log('server ok')});






