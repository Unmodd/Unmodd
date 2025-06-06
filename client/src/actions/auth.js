

import * as api from '../api';

import { fetchAllUsers } from "./users";

export const login = (authData, navigate) => async (dispatch) => {
    try {
        const { data } = await api.logIn(authData);

        dispatch({ type: 'AUTH', payload: data }); 

        dispatch(fetchAllUsers()); 
        navigate('/');
    } catch (error) {
        console.error("Login error:", error);
        alert(error.response?.data?.message || 'Login failed. Please check your credentials.');
    }
};

export const signup = (authData, navigate) => async (dispatch) => {
    try {
        const { data } = await api.signUp(authData);

        dispatch({ type: 'AUTH', payload: data }); 

        dispatch(fetchAllUsers()); 
        navigate('/');
    } catch (error) {
        console.error("Signup error:", error);
        alert(error.response?.data?.message || 'Signup failed. Please try again.');
    }
};

export const logout = (navigate) => (dispatch) => {
    dispatch({ type: 'LOGOUT' });

    navigate('/Auth'); 
};