const usersReducer = (state = [], action) => {
    switch (action.type) {
        case 'FETCH_ALL_USERS':
            return action.payload; 
        case 'UPDATE_USER_IN_LIST': 
            return state.map((user) => user._id === action.payload._id ? action.payload : user);
        case 'FETCH_USER_PROFILE': 
            const existingUserIndex = state.findIndex(user => user._id === action.payload._id);
            if (existingUserIndex !== -1) {

                return state.map(user => user._id === action.payload._id ? action.payload : user);
            } else {

                return [...state, action.payload];
            }
        default:
            return state;
    }
};

export default usersReducer;