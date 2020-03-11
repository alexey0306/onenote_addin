import {SHOW_ALERT, HANDLE_LOADER, CLEAR_ALERTS} from '../globals/config';

export function showAlert(visible,type,message){
	return {
		type: SHOW_ALERT,
		payload: {
			visible: visible,
			type: type,
			message: message
		}
	}
}

export function clearAlerts(){
	return {
		type: CLEAR_ALERTS,
		payload: {
			visible: false,
			type: "error",
			message: ""
		}
	}
}

export function isLoading(loading){
	return {
		type: HANDLE_LOADER,
		payload: loading
	}
}