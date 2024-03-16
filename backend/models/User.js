const mongoose=require('mongoose')
const bcrypt=require("bcryptjs");
const {Schema}=mongoose
const UserSchema=new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        unique:false,
        maxlength:1024
    },
    verified:{
           type:Boolean,
           default:false,
           required:true,
    },
    date:{
        type:Date,
        default:Date.now
    }
})
UserSchema.methods.comparePassword=async function(password){
    const result=bcrypt.compareSync(password,this.password);
    return result
}
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const hash = await bcrypt.hash(this.password, 10);
    this.password = hash;
  }
next();
});
const User=mongoose.model('user',UserSchema);
// User.createIndexes();
module.exports=User