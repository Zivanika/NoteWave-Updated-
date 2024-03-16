const mongoose=require("mongoose")
const mongoURI="mongodb+srv://harshitabarnwal:Harshita@cluster1.sludnrg.mongodb.net/Notebook"
const connectToMongo=async()=>{
    try{
        await mongoose.connect(mongoURI);
        console.log("[+]Connected to MongoDB successfully")
    }
    catch(err){
        console.log(err)
    }
}

module.exports=connectToMongo;