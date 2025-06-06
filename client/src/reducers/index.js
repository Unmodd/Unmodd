import { combineReducers } from "redux";
import authReducer from "./auth";
import currentUserReducer from './currentUser'
import postsReducer from './posts'
import usersReducer from './users'

export default combineReducers({
    authReducer, currentUserReducer, postsReducer, usersReducer
})