import express from 'express';
import expressAsyncHandler from 'express-async-handler';
import data from '../data.js';
import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import { generateToken, isAuth } from '../utils.js';

const userRouter = express.Router();

userRouter.post(
    '/signin', 
    expressAsyncHandler(async (req, res) => {

        const { email, password } = req.body;

        // if( email === null || password === null ) return res.status(500).send({ message: 'Faltan Completar Datos'});

        const user = await User.findOne({ email});

        if(user){
            if( bcrypt.compareSync( password, user.password) ){
                return res.status(200).send({ 
                    _id: user._id,
                    name: user.name, 
                    email: user.email,
                    isAdmin: user.isAdmin,
                    token: generateToken(user)
                });
            }
        } 
        
        res.status(401).send({ message: 'Invalid Email or Password' });
    })
)

userRouter.post(
    '/register',
    expressAsyncHandler( async (req, res) => {
        const { name, email, password, confirmPassword } = req.body;

        const existUser = await User.findOne({ email });
        if(existUser) return res.status(500).send({ message: 'Usuario ya registrado'});

        if(password !== confirmPassword){
            return res.status(401).send({message: 'Password must be equal'})
        }
        
        const user = new User({name, email, password: bcrypt.hashSync(password, 8)});
        const cratedUser = await user.save()

        res.status(200).send({
            _id: cratedUser._id,
            name: cratedUser.name, 
            email: cratedUser.email,
            isAdmin: cratedUser.isAdmin,
            token: generateToken(cratedUser)
        })
    })
)

userRouter.get( '/:id', 
    expressAsyncHandler( async (req, res) => {
        const user = await User.findById(req.params.id);

        if(!user) return res.status(404).send({ messsage: 'User Not Found'})

        res.status(200).send(user)
    })
)

userRouter.put(
    '/profile', 
    isAuth, 
    expressAsyncHandler( async (req, res) => {

        const user = await User.findById(req.user._id);

        if(!user) return res.status(404).send({ messsage: 'User Not Found'})

        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;

        if(req.body.password){
            user.password = bcrypt.hashSync(req.body.password, 8)
        }

        const updatedUser = await user.save();
        
        res.status(200).send({ 
            _id: updatedUser._id,
            name: updatedUser.name, 
            email: updatedUser.email, 
            isAdmin: updatedUser.isAdmin, 
            token: generateToken(updatedUser) 
        })
    })
)


// userRouter.get(
//     '/seed', 
//     expressAsyncHandler( async (req, res) => {

//         const createdUsers = await User.insertMany(data.users);

//         res.send({createdUsers})
//     })
// );


export default userRouter;