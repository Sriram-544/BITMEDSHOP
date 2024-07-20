const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors=require("../middleware/catchAsyncErrors");
const User=require("../models/userModel");
const sendToken = require("../utils/jwtToken");
const sendEmail=require("../utils/sendEmail.js");
const crypto=require("crypto");
const cloudinary=require("cloudinary");

//Register a user
exports.registerUser=catchAsyncErrors(async(req,res,next)=>{

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
      });

    const {name,email,password}=req.body;

    const user= await User.create({
        name,email,password,
        avtar:{
            public_id:myCloud.public_id,
            url:myCloud.secure_url
        }
    })

    sendToken(user,201,res);
})


//Login user
exports.loginUser=catchAsyncErrors(async(req,res,next)=>{
    const {email,password}=req.body;
    if(!email||!password){
        return next(new ErrorHander("Please enter email and password",400));
    }

    const user=await User.findOne({email}).select("+password");

    if(!user){
        return next(new ErrorHander("Invalid email or password",401));
    }

    const isPasswordMatched=await user.comparePassword(password);


    if(!isPasswordMatched){
        return next(new ErrorHander("Invalid email or password",401));
    }

    sendToken(user,200,res);
})


//logout user
exports.logout=catchAsyncErrors(async(req,res,next)=>{

    res.cookie("token",null,{
        expires:new Date(Date.now()),
        httpOnly:true,
    })

    res.status(200).json({
        success:true,
        message:"Logged out",

    })
})

//forgot password
exports.forgotPassword=catchAsyncErrors(async(req,res,next)=>{

    const user=await User.findOne({email:req.body.email});

    if(!user){
        return next(new ErrorHander("User not found",404));
    }

    //get resetpassword token
    const resetToken=user.getResetPasswordToken();

    await user.save({validateBeforeSave:false});

    const resetPasswordUrl = `${req.protocol}://${req.get(
        "host"
      )}/password/reset/${resetToken}`;

    const message=`Your passwword reset token is :-\n\n ${resetPasswordUrl} \n\n If you have not requested this email then, please ignore it`;

    try {
        await sendEmail({
            email:user.email,
            subject:`Mediram password recovery`,
            message
        });

        res.status(200).json({
            success:true,
            message:`email sent to ${user.email} successfully`,
        })
    } catch (error) {
        user.resetPasswordToken=undefined;
        user.resetPasswordExpire=undefined;
        await user.save({validateBeforeSave:false});
        return next(new ErrorHander(error.message,500));
    }
})


//Reset Password
exports.resetPassword = catchAsyncErrors(async(req,res,next)=>{

    //create token hash
    const resetPasswordToken=crypto.createHash("sha256").update(req.params.token).digest("hex");

    const user=await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{$gt:Date.now()},
    })

    if(!user){
        return next(new ErrorHander("Reset password token is invalid or been expired",400));
    }

    if(req.body.password !==req.body.confirmPassword){
        return next(new ErrorHander("Password does not match",400));
    }

    user.password=req.body.password;
    user.resetPasswordToken=undefined;
    user.resetPasswordExpire=undefined;

    await user.save();

    sendToken(user,200,res);
})

//Get user details
exports.getUserDetails=catchAsyncErrors(async(req,res,next)=>{

    const user=await User.findById(req.user.id);

    res.status(200).json({
        success:true,
        user
    });
});

//update user password
exports.updatePassword=catchAsyncErrors(async(req,res,next)=>{

    const user=await User.findById(req.user.id).select("+password");

    const isPasswordMatched=await user.comparePassword(req.body.oldPassword);


    if(!isPasswordMatched){
        return next(new ErrorHander("Old password is incorrect",400));
    }

    if(req.body.newPassword !==req.body.confirmPassword){
        return next(new ErrorHander("Password does not match",400));
    }

    user.password=req.body.newPassword;

    await user.save()

    sendToken(user,200,res)
});

//update user profile
exports.updateProfile=catchAsyncErrors(async(req,res,next)=>{

    const newUserData={
        name:req.body.name,
        email:req.body.email,
    }
    if (req.body.avtar !== "") {
        const user = await User.findById(req.user.id);
    
        const imageId = user.avtar.public_id;
    
        await cloudinary.v2.uploader.destroy(imageId);
    
        const myCloud = await cloudinary.v2.uploader.upload(req.body.avtar, {
          folder: "avatars",
          width: 150,
          crop: "scale",
        });
    
        newUserData.avtar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

    const user=await User.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

    res.status(200).json({
        success:true
    })
});

//get all users (admin)
exports.getAllUsers=catchAsyncErrors(async(req,res,next)=>{

    const users=await User.find();


    res.status(200).json({
        success:true,
        users
    })
})


//get single user (admin)
exports.getSingleUser=catchAsyncErrors(async(req,res,next)=>{

    const user=await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHander(`User does not exist with Id: ${req.params.id}`))
    }

    res.status(200).json({
        success:true,
        user
    })
})

//update user role --admin
exports.updateUserRole=catchAsyncErrors(async(req,res,next)=>{
 
    const newUserData={
        name:req.body.name,
        email:req.body.email,
        role:req.body.role
    }


    const user=await User.findByIdAndUpdate(req.params.id,newUserData,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

    if(!user){
        return next(new ErrorHander(`User does not exist with Id: ${req.params.id}`,400))
    }


    res.status(200).json({
        success:true
    })
});


//delete user --admin
exports.deleteUser=catchAsyncErrors(async(req,res,next)=>{

    
    const user=await User.findById(req.params.id);

    if(!user){
        return next(new ErrorHander(`User does not exist with Id: ${req.params.id}`,400))
    }

    await user.remove();

    res.status(200).json({
        success:true,
        message:"user deleted successfully"
    })
});