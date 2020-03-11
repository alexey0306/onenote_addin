import { combineReducers } from 'redux';

//// Importing custom reducers
import EncryptionReducer from './reducer_encrypt';
import AlertsReducer from './reducer_alerts';
import DecryptReducer from './reducer_decrypt';
import TokenReducer from './reducer_token';


const rootReducer = (state, action) => {
  return appReducer(state,action);
}

const appReducer = combineReducers({
	encrypt: EncryptionReducer,
	alert: AlertsReducer,
	decrypt: DecryptReducer,
	token: TokenReducer
});

export default rootReducer;