const mongoose=require("mongoose");
const bcrypt=require("bcryptjs");

const ResetTokenSchema= new mongoose.Schema({
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user",
        required:true,
    },
    token:{
        type:String,
        required:true,
    },
    //Because we want to store the token only for one hour for verification purposes
    createdAt:{
        type: Date,
        expires:3600,
        default:Date.now,
    }
})

ResetTokenSchema.pre("save",async function (next){
    if(this.isModified("token")){
        const hash=await bcrypt.hash(this.token,8);
        this.token=hash;
    }
})

ResetTokenSchema.methods.compareToken=function (token){
    const result=bcrypt.compareSync(token,this.token); //this.token is inside database
    return result;
}
module.exports=mongoose.model("ResetToken",ResetTokenSchema);