import {createStore,combineReducers,applyMiddleware} from "redux";
import thunk from "redux-thunk";
import {composeWithDevTools} from "redux-devtools-extension";
import {productDetailsReducer, productsReducer,newReviewReducer, productReducer, newProductReducer,productReviewsReducer,reviewReducer} from "./reducers/productReducer";
import { forgotPasswordReducer, profileReducer, userReducer ,allUsersReducer} from "./reducers/userReducer";
import cartReducer from "./reducers/cartReducer";
import { myOrdersReducer, newOrderReducer,orderDetailsReducer ,allOrdersReducer,orderReducer} from "./reducers/orderReducer";


const reducer = combineReducers({
    products:productsReducer,
    productDetails:productDetailsReducer,
    user:userReducer,
    profile:profileReducer,
    forgotPassword:forgotPasswordReducer,
    cart:cartReducer,
    newOrder: newOrderReducer,
    myOrders:myOrdersReducer,
    orderDetails: orderDetailsReducer,
    newReview: newReviewReducer,
    allOrders: allOrdersReducer,
    allUsers: allUsersReducer,
    product:productReducer,
    newProduct:newProductReducer,
    order: orderReducer,
    productReviews: productReviewsReducer,
    review: reviewReducer,
})
;
let initialState = {
    cart: {
      cartItems: localStorage.getItem("cartItems")
        ? JSON.parse(localStorage.getItem("cartItems"))
        : [],
      shippingInfo: localStorage.getItem("shippingInfo")
        ? JSON.parse(localStorage.getItem("shippingInfo"))
        : {},
    },
  };

const middleware=[thunk];

const store=createStore(reducer,initialState,composeWithDevTools(applyMiddleware(...middleware)))

export default store;