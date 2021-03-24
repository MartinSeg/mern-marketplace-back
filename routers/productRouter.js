import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import Product from '../models/productModel.js';
// import data from '../data.js';
import { isAdmin, isAuth } from '../utils.js';

const productRouter = express.Router(); 

productRouter.get(
    '/', 
    expressAsyncHandler( async (req, res) => {
        const products = await Product.find({});
        res.status(200).send(products);
    })
);

productRouter.get(
    '/:id', 
    expressAsyncHandler( async (req, res) => {
        const {id} = req.params;
        const product = await Product.findById(id);
        if( product ){
            res.status(200).send(product);
        }else{
            res.status(404).send({ message: 'Product not Found'})
        }
    })
)

productRouter.post( 
    '/',
    isAuth,
    isAdmin,
    expressAsyncHandler( async (req, res) => {

        const product = new Product({
            name: 'sample name' + Date.now(),
            image: '/images/p1.jpg',
            price: 0,
            category: 'Sample Category',
            brand: 'sample brand',
            countInStock: 0,
            rating:0,
            numReviews: 0,
            description: 'Sample desc'
        });

        const createdProduct = await product.save();

        res.status(200).send({ message: 'Product Created', product: createdProduct})
    })
)

productRouter.put( 
    '/:id',
    isAuth,
    isAdmin,
    expressAsyncHandler( async (req, res) => {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        const { name, price, image, category, brand, countInStock, description } = req.body
        
        if(product){
            product.name = name
            product.price = price
            product.image = image
            product.category = category
            product.brand = brand
            product.countInStock = countInStock
            product.description = description  
            
            const updatedProduct = await product.save();
            res.status(200).send({ message: 'Product Updated', product: updatedProduct})
        }else{
            res.status(404).send({ message: 'Product Not Found'})
        }
    })
)

productRouter.delete(
    '/:id',
    isAuth,
    isAdmin,
    expressAsyncHandler( async (req, res) => {
        const deletedProduct = await Product.findByIdAndRemove(req.params.id);
        
        if( deletedProduct ){
            res.status(200).send({ message: 'Product Deleted', product: deletedProduct})
        }else{
            res.status(404).send({ message: 'Product Not Found'})
        }
    })
)
// productRouter.get(
//     '/seed', 
//     expressAsyncHandler( async (req, res) => {
//         // await Product.remove({})
//         const createdProducts = await Product.insertMany(data.products);
//         res.status(200).send(createdProducts);
//     })
// );

export default productRouter;