// Import section
import {SET_TOKEN} from '../globals/config'
import {success} from './index';
import {showAlert, isLoading} from './alerts_actions';

// Actions
export function setToken(access_token){
	return function(dispatch){
		dispatch(success({token: access_token},SET_TOKEN));
	}
}