import React from "react";
import "./aboutSection.css";
import {Typography, Avatar } from "@material-ui/core";
import InstagramIcon from "@material-ui/icons/Instagram";
const About = () => {
  
  return (
    <div className="aboutSection">
      <div></div>
      <div className="aboutSectionGradient"></div>
      <div className="aboutSectionContainer">
        <Typography component="h1">About Us</Typography>

        <div>
          <div>
            <Avatar
              style={{ width: "10vmax", height: "10vmax", margin: "2vmax 0" }}
              src="https://res.cloudinary.com/dcig5a5gp/image/upload/v1717176059/avatars/f1akk7w9zc0tsxvrhpva.png"
              alt="Founder"
            />
            <Typography>Sriram Madhamshetty</Typography>
            <br />
            <span>
              This is a website made by me for  
              the medical store in our college Birla Institute of Technology, Mesra
            </span>  
          </div>
          <div className="aboutSectionContainer2">
            <Typography component="h2">Instagram</Typography>

            <a href="https://instagram.com/Sriram_544" target="blank">
              <InstagramIcon className="instagramSvgIcon" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;