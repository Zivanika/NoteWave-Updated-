const express=require("express")
const router=express.Router()
const fetchuser=require('../middleware/fetchuser')
const Notes=require('../models/Notes');
const {body,validationResult}=require("express-validator")
// ROUTE 1: Get all the notes using GET : /api/notes/fetchallnotes
router.get("/fetchallnotes",fetchuser,async(req,res)=>{
    try{ const notes=await Notes.find({user:req.user.id})
    res.json(notes)}
   catch(error){
    console.log(error.message)
        res.status(500).send("Internal server error")
   }
})
// ROUTE 2: Add a new note using POST: /api/notes/addnote
router.post("/addnote",fetchuser,[
    body('title').isLength({min:3}),
    body('description').isLength({min:5})
],async(req,res)=>{
    try{
    const{title,description,tag}=req.body
    // If there are errors return bad request and the errors
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    const note=new Notes({
        title,description,tag,user:req.user.id
    })
    const savednote=await note.save()
    res.json(savednote)}
    catch(error){
        console.log(error.message)
        res.status(500).send("Internal server error")
    }
})

// ROUTE 3: Update an existing note using PUT : /api/auth/updatenote . Login required
router.put("/updatenote/:id",fetchuser,async(req,res)=>{
    try{
    const{title,description,tag}=req.body
    // Create a newNote object
    const newNote={}
    if(title){
        newNote.title=title
    }
    if(description){
        newNote.description=description
    }
    if(tag){
        newNote.tag=tag
    }
    // Find the note to be upadted and upadte it
    let note=await Notes.findById(req.params.id);
    if(!note){
        return res.status(404).send("Not found!")
    }
    if(note.user.toString()!==req.user.id){
        return res.status(401).send("You are not the real user are you?")
    }
    note= await Notes.findByIdAndUpdate(req.params.id,{$set:newNote},{new:true})
    res.json({note})}
    catch(error){console.log(error.message)
        res.status(500).send("Internal server error")
    }
})


module.exports=router