// Import section
import * as Config from '../globals/config';

const INITIAL_STATE = {token:""};

export default function (state = INITIAL_STATE, action){
	switch (action.type){

		// Setting the token
		case Config.HANDLE_LOADER:
			return {...state, token: action.payload.access_token }

		default:
			return state;
	}
}