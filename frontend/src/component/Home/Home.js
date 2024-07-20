import React, { Fragment, useEffect } from "react";
import {CgMouse} from "react-icons/cg";
import "./Home.css";

import MetaData from "../layout/MetaData.js";
import {getProduct} from "../../actions/productAction.js";
import {useSelector,useDispatch} from "react-redux";
import Loader from "../Loader/Loader.js";
import { useAlert } from "react-alert";
import ProductCard from "./ProductCard.js";

const Home = ()=>{

    const alert=useAlert();

    const dispatch=useDispatch();
    const {loading,error,products}=useSelector(state=>state.products)

    useEffect(()=>{
        if(error){
            return alert.error(error);
        }
        dispatch(getProduct());
    },[dispatch,error,alert]);

    return (
        <Fragment>
            {loading ?<Loader />:(
                <Fragment>

            <MetaData title="BITMEDSHOP" />
            <div className="banner">
                <p>Welcome to BITMedshop</p>
                <h1>FIND ALL KINDS OF MEDICINES AND PRODUCTS</h1>

                <a href="#container">
                    <button>
                        Scroll <CgMouse />
                    </button>
                </a>
            </div>
            <h2 className="homeHeading">Featured Products and Medicines</h2>

            <div className="container" id="container">
            {products &&
              products.map((product) => (
                <ProductCard product={product} key={product._id} />
              ))}
            </div>
        </Fragment>
            )}
        </Fragment>
      
    )
}

export default Home