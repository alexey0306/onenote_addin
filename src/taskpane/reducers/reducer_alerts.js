// Import section
import * as Config from '../globals/config';

const INITIAL_STATE = {loading: false, alert: {visible: false, type: "error", message: ""}};

export default function (state = INITIAL_STATE, action){
	switch (action.type){

		// Displaying/Hiding the progress
		case Config.HANDLE_LOADER:
			return {...state, loading: action.payload };

		// Displaying the Alert message
		case Config.SHOW_ALERT:
			return { ...state, alert: action.payload };
		
		// Hiding all alerts
		case Config.CLEAR_ALERTS:
			return {...state, alert: action.payload };

		default:
			return state;
	}
}