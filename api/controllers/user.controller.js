import User from "../models/user.model.js"
import Item from "../models/item.model.js"
import { errorHandler } from "../utils/error.js"

import bcryptjs from 'bcryptjs';
import Payment from "../models/payment.model.js";

export const test = (req, res) => {
    res.json({
        message: 'API is working'
    })
}

export const getUsers = async (req, res, next) => {
    try {
        const users = await User.find().exec()
        res.status(200).json(users)
    } catch (error) {
        next(error)
    }
}

export const updateUser = async (req, res, next) => {
    if (req.user.id !== req.params.id) {
        return next(errorHandler(401, 'you can update only your account!'))

    }
    try {
        if (req.body.password) {
            req.body.password = bcryptjs.hashSync(req.body.password, 10)
        }

        const updateUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                $set: {
                    username: req.body.username,
                    email: req.body.email,
                    pasword: req.body.password,
                    profilePicture: req.body.profilePicture,
                },
            },
            { new: true }
        );
        const { password, ...rest } = updateUser._doc;
        res.status(200).json(rest)
    } catch (error) {
        next(error)
    }
}

export const deleteUser = async (req, res, next) => {
    if (req.user.id !== req.params.id) {
        return next(errorHandler(401, 'you can delete only ypur account'));

    } try {
        await User.findByIdAndDelete(req.params.id)
        res.status(200).json('user has been deleted....')
    } catch (error) {
        next(error)

    }
}





//





export const test1 = (req, res) => {
    res.json({
        message: 'API is working'
    });
}


export const updateItem = async (req, res) => {
    const { id, sold_quentity, stock_quentity, isIncrement, ...rest } = req.body;

    let updateData = { ...rest };

    if (isIncrement) {
        console.log("increment")
        const item = await Item.findById(id);
        const sold = Number(item.sold_quentity) + Number(sold_quentity);
        const stock = Number(item.stock_quentity) + Number(stock_quentity);

        updateData.sold_quentity = sold;
        updateData.stock_quentity = stock;
    } else {
        updateData.sold_quentity = sold_quentity;
        updateData.stock_quentity = stock_quentity;
    }

    const data = await Item.updateOne(
        { _id: id },
        {
            $set: updateData,
        }
    );

    res.send({ success: true, message: "updated successfully", data });
};

export const deleteItem = async (req, res, next) => {
    let petId = req.params.id;
    console.log(petId)
    try {
        await Item.findByIdAndDelete(petId);
        res.status(200).json('The Order has been deleted');
    } catch (error) {
        next(error);
    }
}


export const deletepayment = async (req, res, next) => {
    let petId = req.params.id;
    console.log(petId)
    try {
        await Payment.findByIdAndDelete(petId);
        res.status(200).json('The Order has been deleted');
    } catch (error) {
        next(error);
    }
}



export const getItem = async (req, res) => {
    const id = req.params.id;

    try {
        const discount = await Item.findById(id);

        if (!discount) {
            return res.status(404).send({ success: false, message: "User not found" });
        }

        res.send({ success: true, message: "User fetched successfully", data: discount });
    } catch (error) {
        console.error(error);
        res.status(500).send({ success: false, message: "Internal Server Error" });
    }
};






