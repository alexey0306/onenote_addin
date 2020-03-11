// Import section
import * as React from 'react';
import {TextField} from 'office-ui-fabric-react';
import { DefaultButton, PrimaryButton} from 'office-ui-fabric-react';
import { Spinner, SpinnerSize } from 'office-ui-fabric-react/lib/Spinner';
import { IStackTokens, Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import { Dropdown, DropdownMenuItemType, IDropdownStyles, IDropdownOption } from 'office-ui-fabric-react/lib/Dropdown';
import { MessageBarButton } from 'office-ui-fabric-react/lib/Button';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import * as Config from '../globals/config';
import {encrypt} from '../actions/encrypt_actions';
import {decrypt} from '../actions/decrypt_actions';
import {showAlert,clearAlerts} from '../actions/alerts_actions';

//// Import Redux specific stuff
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as Encrypt from '../actions/encrypt_actions'; 

// Const section
const PASSWORD_LABEL = "Password";
let options = [
	{ key: 'encrypt', text: 'Encrypt' },
	{ key: 'decrypt', text: 'Decrypt' },
];
let alertType = MessageBarType.info;
let ACTION_DEFAULT = options[0].key;



async function f() {
  let promise = new Promise((resolve, reject) => {
    setTimeout(() => resolve("done!"), 1000)
  });
  let result = await promise; // wait till the promise resolves (*)
  alert(result); // "done!"
}


//-------------------------------------------------
// 		Spinner component				
//-------------------------------------------------

export const LoadingSpinner = (props) => {
	if (props.display == true){
		return (
			<div style={{marginBottom:"20px"}}>
			<Spinner 
				size={SpinnerSize.large} 
				label="Performing operation. Please wait ..." 
				ariaLive="assertive" 
				labelPosition="left" 
			/>
			</div>
		);
	}
	else{
		return null;
	}
}


//-------------------------------------------------
// 		Panel Alert component					
//-------------------------------------------------

export const PanelAlert = (props) => {

	switch (props.type){
		case "error":
			alertType = MessageBarType.error;
			break;
		case "info":
		default:
			alertType = MessageBarType.info;
			break;
	}

	return (
		<Stack tokens={{ childrenGap: 20 }}>
			<StackItem>
				<MessageBar onDismiss={props.onDismiss} messageBarType={alertType} isMultiline={false} dismissButtonAriaLabel="Close">
					{props.message}
				</MessageBar>
			</StackItem>
		</Stack>
	);
}


//-------------------------------------------------
// 		Password Input component					
//-------------------------------------------------

export const PasswordInput = (props) => {
	return (
		<TextField
			errorMessage={props.errorMessage} 
			label={PASSWORD_LABEL} 
			type="password" 
			onChange={(event) => props.onChanged(event.target.value)}
		/>
	);
}

//-------------------------------------------------
// 		ActionExecutor component					
//-------------------------------------------------

export const ActionExecutor = (props) => {

	return (

		<div>
			<div>
				<Dropdown 
					onChanged={props.onActionChange}
					label="Select action" 
					defaultSelectedKey="encrypt" 
					options={options} 
					disabled={false} 
				/>
			</div><br/>
			<div>
				<PrimaryButton
					style={{marginRight:"20px"}}
					title="Encrypt data" 
					onClick={props.onApplied} 
					text="Apply" 
					allowDisabledFocus 
				/>
			</div>
		</div>

	);
}


//-------------------------------------------------
// 		Main component					
//-------------------------------------------------


class EncryptDecrypt extends React.Component{

	constructor(props){
		super(props);
		this.state = {
			password: "",
			host: "",
			errorMessage: "",
			alertVisible: false,
			alertType: alertType,
			action: ACTION_DEFAULT
		}
	}

	//-------------------------------------------------
	// 		Actions				
	//-------------------------------------------------

	reset = async() => {
		this.props.clearAlerts();
	}


	//// This method is invoked when the button is clicked
	doAction = async () => {

		// Resetting the state
		this.reset();

		// Step 1. Checking that password has been specified
		if (this.state.password == ""){
			this.setState({
				errorMessage: Config.messages.PASSWORD_EMPTY
			});
			return false;
		}

		// Step 2. Checking if the Action has been specified
		if (this.state.action == ""){
			this.props.showAlert(true,"error",Config.messages.NO_ACTION_SPECIFIED);
			return false;
		}

		// Step 3. Selecting the function to execute
		switch (this.state.action){
			case options[0].key: // Encrypt
				this.props.encrypt(this.props.host,this.state.password);
				break;
			case options[1].key: // Decrypt
				this.props.decrypt(this.props.host,this.state.password);
				break;
			default: // Encrypt Text
				this.props.showAlert(true,"error",Config.messages.NO_ACTION_SPECIFIED);
				break;
		}

		// Analyzing the result
		console.log(result);

		// Hiding the progress bar
		//this.setState({loading: false;})
	}

	onPasswordChange = async (value) => {
		this.setState({password: value});
	}

	onActionChange = async (event) => {
		this.setState({
			action: event.key
		});
	}

	//// This method is used to dismiss the alerts
	dismissAlert = async () => {
		this.props.clearAlerts();
	}

	//-------------------------------------------------
	// 		Rendering the component					
	//-------------------------------------------------

	componentDidMount(){
		if (this.props.host == Config.HOSTNAMES.ONENOTE){
			options.push(
				{ key: 'decrypt_file', text: 'Decrypt file' }
			);
		}
	}

	render(){
		return (
			<div>
				<LoadingSpinner display={this.props.loading} />
				<PasswordInput 
					errorMessage={this.state.errorMessage}
					onChanged={this.onPasswordChange}
				/><br/>				
				<ActionExecutor 
					host={this.props.host}
					onApplied={this.doAction}
					onActionChange={this.onActionChange}
				/><br/>

				{ this.props.alert.visible == true 
					? (<PanelAlert 
							type={this.props.alert.type} 
							message={this.props.alert.message}
							onDismiss={this.dismissAlert}
					 	/>
					) 
				: null
			}
			</div>
		);
	}

}

function mapStateToProps(state){
	return {
		message: state.encrypt.message,
		loading: state.alert.loading,
		alert: state.alert.alert
	};
}

function mapDispatchToProps(dispatch){
	return bindActionCreators({encrypt,showAlert,clearAlerts,decrypt},dispatch);
}

export default connect(mapStateToProps,mapDispatchToProps)(EncryptDecrypt);
