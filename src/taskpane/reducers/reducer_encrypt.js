// Import section
import * as Config from '../globals/config';

const INITIAL_STATE = {message: ""};

export default function (state = INITIAL_STATE, action){
	switch (action.type){
		case Config.ENCRYPT_TEXT:
			return {...state, message: action.payload.message }
		default:
			return state;
	}
}