import Header from "./component/layout/Header/Header.js"
import Footer from "./component/layout/Footer/Footer.js"
import './App.css';
import { useState } from "react";
import {BrowserRouter as Router,Route,Switch} from "react-router-dom";
import ProtectedRoute from "./component/Route/ProtectedRoute";
import webFont from "webfontloader";
import React from "react";
import Home from "./component/Home/Home.js"
import ProductDetails from "./component/Product/ProductDetails.js"
import ScrollToTop from './ScrollToTop.js'; 
import Products from "./component/Product/Products.js"
import Search from "./component/Product/Search.js"
import LoginSignUp from "./component/User/LoginSignUp.js";
import store from "./store.js";
import { loadUser } from "./actions/userAction.js";
import UserOptions from "./component/layout/Header/UserOptions.js"
import { useSelector } from "react-redux";
import Profile from "./component/User/Profile.js";
import UpdateProfile from "./component/User/UpdateProfile";
import UpdatePassword from "./component/User/UpdatePassword.js";
import ForgotPassword from "./component/User/ForgotPassword.js";
import ResetPassword from "./component/User/ResetPassword.js";
import Cart from "./component/Cart/Cart.js";
import Shipping from "./component/Cart/Shipping.js";
import ConfirmOrder from "./component/Cart/ConfirmOrder.js";
import Payment from "./component/Cart/Payment.js";
import axios from "axios";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import OrderSuccess from "./component/Cart/OrderSuccess.js";
import MyOrders from "./component/Order/MyOrders.js";
import OrderDetails from "./component/Order/OrderDetails.js";
import Dashboard from "./component/admin/Dashboard.js";
import ProductList from "./component/admin/ProductList.js";
import NewProduct from "./component/admin/NewProduct.js";
import UpdateProduct from "./component/admin/UpdateProduct.js";
import OrderList from "./component/admin/OrderList.js";
import ProcessOrder from "./component/admin/ProcessOrder.js";
import UsersList from "./component/admin/UsersList.js";
import ProductReviews from "./component/admin/ProductReviews.js";
import Contact from "./component/layout/Contact/Contact.js";
import About from "./component/layout/About/About.js";
import NotFound from "./component/layout/Not Found/NotFound.js";

 



function App() {


  
  const { isAuthenticated, user } = useSelector((state) => state.user);

  const [stripeApiKey, setStripeApiKey] = useState("");

  async function getStripeApiKey() {
    const { data } = await axios.get("/api/v1/stripeapikey");

    setStripeApiKey(data.stripeApiKey);
  }
  React.useEffect(()=>{
    webFont.load({
      google:{
        families:["Roboto","Droid Sans","Chilanka"]
      }
    })

    store.dispatch(loadUser());
    getStripeApiKey();
  },[])
  
  return (
    <Router>
    <ScrollToTop />
      <Header />
      {isAuthenticated && <UserOptions user={user} />}
      {stripeApiKey && (
            <Elements stripe={loadStripe(stripeApiKey)}>
              <ProtectedRoute exact path="/process/payment" component={Payment} />
            </Elements>
          )}
      
        <Switch>
          <Route exact path="/" component={Home} />
          <Route exact path="/product/:id" component={ProductDetails} />
          <Route exact path="/products" component={Products} />
          <Route path="/products/:keyword" component={Products} />
          <Route exact path="/Search" component={Search} />
          <Route exact path="/contact" component={Contact} />
          <Route exact path="/about" component={About} />
          <Route exact path="/login" component={LoginSignUp} />
          <ProtectedRoute exact path="/account" component={Profile} />
          <ProtectedRoute exact path="/me/update" component={UpdateProfile} />
          <ProtectedRoute exact path="/password/update" component={UpdatePassword} />
          <Route exact path="/password/forgot" component={ForgotPassword} />
          <Route exact path="/password/reset/:token" component={ResetPassword} />
          <Route exact path="/Cart" component={Cart} />
          <ProtectedRoute exact path="/shipping" component={Shipping} />
          <ProtectedRoute exact path="/order/confirm" component={ConfirmOrder} />
          <ProtectedRoute exact path="/success" component={OrderSuccess} />
          <ProtectedRoute exact path="/orders" component={MyOrders} />
          <ProtectedRoute exact path="/order/:id" component={OrderDetails} />
          <ProtectedRoute exact path="/admin/dashboard" isAdmin={true} component={Dashboard} />
          <ProtectedRoute
            exact
            path="/admin/products"
            isAdmin={true}
            component={ProductList}
          />
          <ProtectedRoute
            exact
            path="/admin/product"
            isAdmin={true}
            component={NewProduct}
          />
          <ProtectedRoute
            exact
            path="/admin/product/:id"
            isAdmin={true}
            component={UpdateProduct}
          />
          <ProtectedRoute
            exact
            path="/admin/orders"
            isAdmin={true}
            component={OrderList}
          />
          <ProtectedRoute
            exact
            path="/admin/order/:id"
            isAdmin={true}
            component={ProcessOrder}
          />
          <ProtectedRoute
            exact
            path="/admin/users"
            isAdmin={true}
            component={UsersList}
          />
          <ProtectedRoute
            exact
            path="/admin/reviews"
            isAdmin={true}
            component={ProductReviews}
          />
          <Route
          component={
            window.location.pathname === "/process/payment" ? null : NotFound
          }
        />
          
        </Switch>
      <Footer />
    </Router>
  );
}

export default App;