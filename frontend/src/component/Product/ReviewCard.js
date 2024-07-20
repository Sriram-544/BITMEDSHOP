import React from "react";
import { Rating } from "@material-ui/lab";


const ReviewCard=({review})=>{

    const options={
        value:review.rating,
        size:"large",
        readOnly:true,
    }
    return (
        <div className="reviewCard">
            <img src={review.urli? review.urli : "/Profile.png"} alt="User" />
            <p>{review.name}</p>
            <Rating {...options}/>
            <span className="reviewCardComment">{review.comment}</span>
        </div>
    )
}

export default ReviewCard;