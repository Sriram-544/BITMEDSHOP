const ErrorHandler=require("../utils/errorhander");

module.exports=(err,req,res,next)=>{
    err.statusCode=err.statusCode||500;
    err.message=err.message||"Internal Server Error";


    //wrong mongodb id
    if (err.name==="CastError"){
        const message=`Resourse not found .Invalid: ${err.path}`;
        err=new ErrorHandler(message,400);
    }; 

    //MOngoose duplicate error
    if (err.code===11000){
        const message=`Duplicate ${Object.keys(err.keyValue)} Entered`;
        err=new ErrorHandler(message,400);
    }

    //Wrong JWT error
    if(err.name==="JsonWebTokenError"){
        const message=`Json Web Token is invalid ,Try again`;
        err=new ErrorHandler(message,400);
    }

    //JWT expire error
    if(err.name==="TokenExpiredError"){
        const message=`Json Web Token is expired ,Try again`;
        err=new ErrorHandler(message,400);
    }

    res.status(err.statusCode).json({
        success:false,
        message:err.message
    });

};