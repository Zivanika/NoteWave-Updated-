const {isValidObjectId} = require("mongoose");
const User = require("../models/User");
const ResetToken = require("../models/ResetToken");
const isResetPasswordValid = async (req,res,next)=>{

    const {token,id}=req.query; //reset-password?token=${passwordToken}&id=${user._id}

    if (!token || !id) return res.status(401).json({error:"Invalid Request!"});

    if (!isValidObjectId(id)) return res.status(401).json({error:"Invalid User!"});

    const user = await User.findById(id); //find the User data according to the id provided by request
    if (!user) return res.status(401).json({error:"User not found!"});
    const resetToken = await ResetToken.findOne({owner:user._id}); //finding the appropriate ResetToken database
    if (!resetToken) return res.status(401).json({error:"Reset token not found!"});

    const isValid = await resetToken.compareToken(token); //whether the token coming from the req matches the one stored in the database
    if (!isValid) return res.status(401).json({error:"Reset token is not valid!"});

    req.user=user;
    next();
    
}
module.exports=isResetPasswordValid;