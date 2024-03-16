const express=require("express")
const path=require("path")
const {isValidObjectId}=require("mongoose");
const router=express.Router()
const generateOTP=require("../utils/mail");
const OTPEmailTemplate=require("../utils/otpEmail");
const VerificationEmailTemplate=require("../utils/verifyEmail");
const VerificationToken=require("../models/VerificationToken");
const ResetToken=require("../models/ResetToken");
const createRandomBytes=require("../utils/helper");
const fs=require("fs");
const nodemailer=require("nodemailer");
const PasswordResetTemplate=require("../utils/passwordReset");
const NewPasswordTemplate=require("../utils/newPassword");
const User=require('../models/User')
const {body,validationResult}=require("express-validator")
const bcrypt=require('bcryptjs')
const jwt=require("jsonwebtoken")
const JWT_SECRET="harshita"
const fetchuser=require('../middleware/fetchuser');
const { Console, log } = require("console");
const isResetPasswordValid = require("../middleware/isResetPasswordValid");
//ROUTE 1: Create a user using POST:"/api/auth/createuser". No authentication required
router.post('/createuser',[
    body('name','Enter a valid name').isLength({min:3}),
    body('email','Enter a valid email').isEmail(),
    body('password','Password must be atleast 5 characters').isLength({min:5})
],async(req,res)=>{
    // If there are errors return bad request and the errors
    const errors=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }
    // Check whether user with this email exists already
    try{
    let user=await User.findOne({email:req.body.email})
    if(user){
        return res.status(400).json({error:"Sorry a user with this email already exists"})
    }
    const salt=await bcrypt.genSalt(10);
    const secPass=await bcrypt.hash(req.body.password,salt);
    // Create a new user
     user=await User.create({
        name:req.body.name,
        email:req.body.email,
        password:secPass
    })
    let otp=generateOTP();
    await VerificationToken.create({
        owner:user._id,
        token:otp,
    })
    const transporter=nodemailer.createTransport({
        service:"gmail",
        // host: "smtp.forwardemail.net",
        port:465,
        secure:true,
        auth:{
            user:"harshitabarnwal2003@gmail.com",
            pass:"ijhsjheifnuywxux" //gpt the password from google account itself inside App Passwords
        }
    })
    const result = await transporter.sendMail({
        from: '"🌼Harshita🌼" <harshitabarnwal2003@gmail.com>', // sender address
        to: user.email, // list of receivers
        subject: "OTP Verification for your Email Account", // Subject line
        text: "This email is sent using nodemailer", // plain text body
        html: OTPEmailTemplate(otp), // html body
        attachments: [
            {
              filename: "image-1.png",
              path: path.join(__dirname, "../utils/images/image-1.png"),
              cid: "uniq-image-1.png",
            },
            {
              filename: "image-2.png",
              path: path.join(__dirname, "../utils/images/image-2.png"),
              cid: "uniq-image-2.png",
            },
            {
              filename: "image-3.png",
              path: path.join(__dirname, "../utils/images/image-3.png"),
              cid: "uniq-image-3.png",
            },
            {
              filename: "image-4.png",
              path: path.join(__dirname, "../utils/images/image-4.png"),
              cid: "uniq-image-4.png",
            },
            {
              filename: "image-5.png",
              path: path.join(__dirname, "../utils/images/image-5.png"),
              cid: "uniq-image-5.png",
            },
            {
              filename: "image-6.png",
              path: path.join(__dirname, "../utils/images/image-6.png"),
              cid: "uniq-image-6.png",
            },
            {
              filename: "image-7.png",
              path: path.join(__dirname, "../utils/images/image-7.png"),
              cid: "uniq-image-7.png",
            },
            {
              filename: "image-8.png",
              path: path.join(__dirname, "../utils/images/image-8.png"),
              cid: "uniq-image-8.png",
            },
          ],
    });
    const data={
        user:{
            id:user.id
        }
    }
    const authtoken=jwt.sign(data,JWT_SECRET) //this is a sync method so no need to await
    // console.log(jwtData)
    let ID = user._id
    res.json({authtoken,ID})}
    catch(error){
        console.log(error.message)
        res.status(500).send("Internal server error")
    }

})

//ROUTE 2: Authenticate a user using POST: api/auth/login. No login required
router.post('/login',[
    body('email','Enter a valid email').isEmail(),
    body('password','Password cant be blank').exists()
],async(req,res)=>{
     // If there are errors return bad request and the errors
     const errors=validationResult(req);
     if(!errors.isEmpty()){
         return res.status(400).json({errors:errors.array()});
     }
     const{email,password}=req.body
     try{
        let user=await User.findOne({email});
        if(!user)
        {
            return res.status(400).json({error:"User does not exist"})
        }
        const passwordcompare=await bcrypt.compare(password,user.password)
        console.log(password);
        console.log(user.password);
        console.log(passwordcompare)
        if(!passwordcompare){
            return res.status(400).json({error:"Sorry wrong password!"})
        }
        const data={
            user:{
                id:user.id
            }
        }
        const authtoken=jwt.sign(data,JWT_SECRET) //this is a sync method so no need to await
        // console.log(jwtData)
        res.json({authtoken})
    }catch(error){
        console.log(error.message)
        res.status(500).send("Internal server error")
     }
})

// ROUTE 3: Get logged in user details using POST: /api/auth/getdetails . Login required

router.post('/getuser',fetchuser,async(req,res)=>{
    try{
        const userId=req.user.id
        const user=await User.findById(userId).select("-password")
        res.send(user)
    }catch(error){
        console.error(error.message)
        res.status(500).send("Internal server error")
    }
})

// ROUTE 4 : Verify the email account
router.post("/verify-email",async(req,res)=>{
    try{
        const{UserID,otp}=req.body;
        if(!UserID||!otp.trim())
         return res.status(500).json({error:"Invalid request, missing parameters!"});
        if(!isValidObjectId(UserID))
         return res.status(500).json({error:"Invalid User ID!"});
        // Finding the user information
        const user=await User.findById(UserID);
        if(!user) return res.status(400).json({error:"Sorry, user not found!"});
        if(user.verified==true)
        return res.status(500).json({error:"This account has already been verified!"});
    const token=await VerificationToken.findOne({owner:user._id});//FindOne because FindbbyId works only when searching_id not some other reference parameter
    if(!token)
    return res.status(404).json({error:"Sorry, user not found!"});
const isMatched=token.compareToken(otp);
if(!isMatched)
return res.status(404).json({error:"Please enter the correct OTP!"});
user.verified=true;

// Now deleting the token from the database after verification
await VerificationToken.findByIdAndDelete(token._id);
// Saving the modified user data
await user.save();
console.log("Barnwol")
const transporter=nodemailer.createTransport({
            service:"gmail",
            // host: "smtp.forwardemail.net",
            port:465,
            secure:true,
            auth:{
                user:"harshitabarnwal2003@gmail.com",
                pass:"ijhsjheifnuywxux" //gpt the password from google account itself inside App Passwords
            }
        })
        await transporter.sendMail({
            from: '"🌼Harshita🌼" <harshitabarnwal2003@gmail.com>', // sender address
            to: user.email, // list of receivers
            subject: "Hello ✔", // Subject line
            text: "This email is sent using nodemailer", // plain text body
            html: VerificationEmailTemplate(), // html body
            attachments: [
                {
                  filename: 'email.png',
                  path: path.join(__dirname, "../utils/images/email.png"),
                  cid: 'uniq-email.png' 
                },
                {
                  filename: 'image-5.png',
                  path: path.join(__dirname, "../utils/images/image-5.png"),
                  cid: 'uniq-image-5.png' 
                },
                {
                  filename: 'image-7.png',
                  path: path.join(__dirname, "../utils/images/image-7.png"),
                  cid: 'uniq-image-7.png' 
                },
                {
                  filename: 'image-8.png',
                  path: path.join(__dirname, "../utils/images/image-8.png"),
                  cid: 'uniq-image-8.png' 
                }
              ]
        });
      res.json({
        success:true,
        message:"Your email has been verified"
      })
    }
    catch(error){
        console.log(error);
        res.status(500).json({error:"Internal server error"})
    }
})

//  ROUTE 5: Forgot password webpage request handling

router.post("/forgot-password",async(req,res)=>{
    try{
        const{email}=req.body;
        if(!email)
        return res.status(401).json({error:"Please provide valid E-mail!"});
        const user=await User.findOne({email});
        if(!user)
         return res.status(401).json({error:"User not found, Invalid request!"});
        const token=await ResetToken.findOne({owner:user._id});
        if(token){
            return res.status(401).json({error:"Only after 1 hour, you can request for another email. Please have patience and be assured the email will arrive shortly"})
        }
        const passwordToken=await createRandomBytes();
        const resetToken=new ResetToken({
            owner:user._id,
            token:passwordToken
        })
        await resetToken.save();

        const transporter = nodemailer.createTransport({
            service: "gmail",
            // host: "smtp.forwardemail.net",
            port: 465,
            secure: true,
            auth: {
              user: "harshitabarnwal2003@gmail.com",
              pass: "ijhsjheifnuywxux", //got the password from google account itself inside App Passwords
            },
          });
      
          await transporter.sendMail({
            from: '"🌼Harshita🌼" <harshitabarnwal2003@gmail.com>', // sender address
            to: user.email, // list of receivers
            subject: "Reset Your NoteWave Password", // Subject line
            html: PasswordResetTemplate(
                `http://localhost:5000/reset-password?token=${passwordToken}&id=${user._id}`
            ),
            attachments: [
              {
                filename: "Beefree-logo.png",
                path: path.join(__dirname, "../utils/images/Beefree-logo.png"),
                cid: "uniq-Beefree.png",
              },
              {
                filename: "facebook2x.png",
                path: path.join(__dirname, "../utils/images/facebook2x.png"),
                cid: "uniq-facebook.png",
              },
              {
                filename: "instagram2x.png",
                path: path.join(__dirname, "../utils/images/instagram2x.png"),
                cid: "uniq-instagram.png",
              },
              {
                filename: "linkedin2x.png",
                path: path.join(__dirname, "../utils/images/linkedin2x.png"),
                cid: "uniq-linkedin.png",
              },
              {
                filename: "whatsapp2x.png",
                path: path.join(__dirname, "../utils/images/whatsapp2x.png"),
                cid: "uniq-whatsapp.png",
              },
              {
                filename: "gif-resetpass.gif",
                path: path.join(__dirname, "../utils/images/gif-resetpass.gif"),
                cid: "uniq-resetpass.gif",
              },
            ],
          });
      
          res.json({
            success: true,
            message: "Password Reset Link is sent to your E-mail!",
          });  //🌹🌹🌹🌹🌹🌹
    }catch(error){
        console.log(error);
        res.status(500).json({error:"Internal server error"})
    }
})

// ROUTE 6: Reset the password with the new password entered on the webpage
router.post('/reset-password',isResetPasswordValid,async(req,res)=>{
    try{
        const {password}=req.body;
        const user=await User.findById(req.user._id);
        if(!user) return res.status(401).json({error:"User not found!"});
        const isSamePassword=await user.comparePassword(password);
        if(isSamePassword)
        return res.status(401).json({error:"New password must be different!"});
        if(password.trim().length<5){
            return res.status(401).json({error:"Password must be atleast 5 characters long!"});
            // Check if the password contains at least 1 uppercase letter and 1 number
        }
        const passwordRegex= /^(?=.*\d)/;
        if(!passwordRegex.test(password.trim())){
            return res.status(401).json({error:"Password must contain at least 1 uppercase letter and 1 number!"})
        }
        user.password=password.trim();
        await user.save();
        await ResetToken.findOneAndDelete({owner:user._id});
        const transporter = nodemailer.createTransport({
            service: "gmail",
            // host: "smtp.forwardemail.net",
            port: 465,
            secure: true,
            auth: {
              user: "harshitabarnwal2003@gmail.com",
              pass: "ijhsjheifnuywxux", //got the password from google account itself inside App Passwords
            },
          });
      
          await transporter.sendMail({
            from: '"🌼Harshita🌼" <harshitabarnwal2003@gmail.com>', // sender address
            to: user.email, // list of receivers
            subject: "Your Password Has Been Changed", // Subject line
            html: NewPasswordTemplate(),
            attachments: [
              {
                filename: "email.png",
                path: path.join(__dirname, "../utils/images/email.png"),
                cid: "uniq-email.png",
              },
              {
                filename: "image-5.png",
                path: path.join(__dirname, "../utils/images/image-5.png"),
                cid: "uniq-image-5.png",
              },
              {
                filename: "image-7.png",
                path: path.join(__dirname, "../utils/images/image-7.png"),
                cid: "uniq-image-7.png",
              },
              {
                filename: "image-8.png",
                path: path.join(__dirname, "../utils/images/image-8.png"),
                cid: "uniq-image-8.png",
              },
            ],
          });
      
          res.json({
            success: true,
            message: "Password is changed!",
          });
    }
    catch(error){
        console.log(error);
        res.status(500).json({error:"Internal server error"})
    }
})

// ROUTE 7: For verifying general token

router.get("/verify-token",isResetPasswordValid,async(req,res)=>{
    res.json({success:true});
})

//! Route 8: For resending the verification email
router.post("/resend", async (req, res) => {
    try {
      let otp = generateOTP();
  
      const VT = await VerificationToken.findOne({ owner: req.body.ID });
      VT.token = otp;
      await VT.save();
  
      const transporter = nodemailer.createTransport({
        service: "gmail",
        // host: "smtp.forwardemail.net",
        port: 465,
        secure: true,
        auth: {
          user: "harshitabarnwal2003@gmail.com",
          pass: "ijhsjheifnuywxux", //got the password from google account itself inside App Passwords
        },
      });
  
      const result = await transporter.sendMail({
        from: '"🌼Harshita🌼" <harshitabarnwal2003@gmail.com>', // sender address
        to: req.body.email, // list of receivers
        subject: "OTP Verification for Your Email Account", // Subject line
        html: OTPEmailTemplate(otp),
        attachments: [
          {
            filename: "image-1.png",
            path: path.join(__dirname, "../utils/images/image-1.png"),
            cid: "uniq-image-1.png",
          },
          {
            filename: "image-2.png",
            path: path.join(__dirname, "../utils/images/image-2.png"),
            cid: "uniq-image-2.png",
          },
          {
            filename: "image-3.png",
            path: path.join(__dirname, "../utils/images/image-3.png"),
            cid: "uniq-image-3.png",
          },
          {
            filename: "image-4.png",
            path: path.join(__dirname, "../utils/images/image-4.png"),
            cid: "uniq-image-4.png",
          },
          {
            filename: "image-5.png",
            path: path.join(__dirname, "../utils/images/image-5.png"),
            cid: "uniq-image-5.png",
          },
          {
            filename: "image-6.png",
            path: path.join(__dirname, "../utils/images/image-6.png"),
            cid: "uniq-image-6.png",
          },
          {
            filename: "image-7.png",
            path: path.join(__dirname, "../utils/images/image-7.png"),
            cid: "uniq-image-7.png",
          },
          {
            filename: "image-8.png",
            path: path.join(__dirname, "../utils/images/image-8.png"),
            cid: "uniq-image-8.png",
          },
        ],
      });
      res.json({ success: true });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Internal Server error" });
    }
  });
module.exports=router