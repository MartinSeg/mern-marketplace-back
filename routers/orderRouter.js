import express from 'express'
import expressAsyncHandler from 'express-async-handler';
import Order from '../models/orderModel.js'
import {isAuth, isAdmin} from '../utils.js'
const orderRouter = express.Router();


orderRouter.get(
    '/', 
    isAuth,
    isAdmin,
    expressAsyncHandler( async (req, res) => {
        const orders = await Order.find({}).populate('user', 'name');
        res.status(200).send(orders)
    })
)

orderRouter.get(
    '/mine',
    isAuth,
    expressAsyncHandler( async (req, res) => {
        const orders = await Order.find({user: req.user._id});
        res.status(200).send(orders)
    })
)

orderRouter.post(
    '/',
    isAuth,
    expressAsyncHandler( async( req, res ) => {


        if(req.body.orderItems.length === 0 ){
            res.status(400).send({ message: 'Cart is empty'})
        }else{
            const order= new Order({
                orderItems: req.body.orderItems,
                shippingAddress: req.body.shippingAddress,
                paymentMethod: req.body.paymentMethod,
                itemsPrice: req.body.itemsPrice,
                shippingPrice: req.body.shippingPrice,
                taxPrice: req.body.taxPrice,
                totalPrice: req.body.totalPrice,
                user: req.user._id
            })

            const createdOrder = await order.save();

            res.status(201).send({ message: "New Order Created", order: createdOrder})
        } 
    })
)

orderRouter.get( 
    '/:id', 
    isAuth, 
    expressAsyncHandler( async (req, res) => {
        const orderId = req.params.id;        
        const order = await Order.findById(orderId);

        if(!order) return res.status(404).send({message: 'Order Not Found'})

        res.status(200).send(order);
    })
)

orderRouter.put(
    '/:id/pay', 
    isAuth, 
    expressAsyncHandler( async (req, res) => {
        const order = await Order.findById(req.params.id)
        const { id, status, updated_time, email_address } = req.body;

        if(!order) return res.status(404).send({message: 'Order Not Found'})

        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentResult = { id, status, updated_time, email_address };

        const updatedOrder = await order.save();

        res.status(200).send({message: 'Order Paid', order: updatedOrder})
    })
)

orderRouter.delete(
    '/:id',
    isAuth,
    isAdmin,
    expressAsyncHandler( async (req, res) => {
        const order = await Order.findById(req.params.id)

        if(order){
            const deletedOrder = order.remove();
            res.status(200).send({ message: 'Order Deleted', order: deletedOrder })
        }else{
            res.status(404).send({ message: 'Order Not Found'})
        }
    })
)

orderRouter.put(
    '/:id/deliver', 
    isAuth, 
    expressAsyncHandler( async (req, res) => {
        const order = await Order.findById(req.params.id)
        
        if(!order) return res.status(404).send({message: 'Order Not Found'})

        order.isDelivered = true;
        order.deliveredAt = Date.now();

        const updatedOrder = await order.save();

        res.status(200).send({message: 'Order Delivered', order: updatedOrder})
    })
)
export default orderRouter