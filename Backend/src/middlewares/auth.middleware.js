const foodPartnerModel=require('../models/foodpartner.model')
const userModel=require('../models/user.model')

const jwt=require('jsonwebtoken');


async function authFoodPartnerMiddleware(req,res,next){
    console.log('🔐 authFoodPartnerMiddleware invoked');
    const token= req.cookies.token;
    if(!token){
        return res.status(401).json({
            message:"Unauthorized Access"
        });
    }

    try {
        const decoded=jwt.verify(token,process.env.secret_key);
        const foodPartner= await foodPartnerModel.findById(decoded.id);

        req.foodPartner=foodPartner;
        next();


        } catch (error) {
        return res.status(401).json({
            message:"Unauthorized Access"
        })
    }
}

async function authUserMiddleware(req,res,next){
    console.log('🔐 authUserMiddleware invoked');
    const token= req.cookies.token;
    if(!token){
        return res.status(401).json({
            message:"Unauthorized Access"
        });
    }

    try {
        const decoded=jwt.verify(token,process.env.secret_key);
        const user=await userModel.findById(decoded.id);
        req.user=user
        next();


        } catch (error) {
        return res.status(401).json({
            message:"Unauthorized Access"
        })
    }
}

module.exports = {
    authFoodPartnerMiddleware,
    authUserMiddleware,
};
