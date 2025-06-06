

const getInitialState = () => {
    try {
        const profile = localStorage.getItem('profile'); 
        if (profile) {
            const parsedProfile = JSON.parse(profile);


            return parsedProfile;
        }
    } catch (e) {
        console.error("Failed to parse user profile from localStorage:", e);
        localStorage.removeItem('profile'); 
    }
    return null;
};

const currentUserReducer = (state = getInitialState(), action) => {
    switch (action.type) {
        case 'AUTH':


            if (action?.payload) {

                if (!action.payload.result || !action.payload.result._id || !action.payload.token) {
                    console.error("AUTH payload is missing expected properties (result, _id, or token):", action.payload);
                    return state; 
                }


                localStorage.setItem('profile', JSON.stringify(action.payload));
                

                return action.payload; 
            }
            return state;

        case 'LOGOUT':
            localStorage.removeItem('profile'); 
            return null;

        case 'UPDATE_CURRENT_USER':

            if (state && state.result && action.payload && state.result._id === action.payload._id) {
                const updatedResult = { ...state.result, ...action.payload }; 
                const updatedAuthData = {
                    ...state, 
                    result: updatedResult 
                };
                localStorage.setItem('profile', JSON.stringify(updatedAuthData));
                return updatedAuthData;
            }
            return state;

        case 'FETCH_USER_PROFILE': 

            if (state && action.payload && state.result?._id === action.payload._id) {
                const updatedStateForProfile = {
                    ...state, 
                    result: action.payload 
                };
                localStorage.setItem('profile', JSON.stringify(updatedStateForProfile));
                return updatedStateForProfile;
            }
            return state;

        default:
            return state;
    }
};

export default currentUserReducer;