import * as React from 'react';
import { DefaultButton, PrimaryButton} from 'office-ui-fabric-react';
import Header from './Header';
import Progress from './Progress';
import {PasswordInput} from './PasswordInput';
import {PanelAlert} from './PanelAlert';
import EncryptDecrypt from './Encryption';
import * as Config from '../globals/config';
import axios from 'axios';
import AuthProvider from './AuthProvider';
import PropTypes from "prop-types";

class App extends React.Component{

	static propTypes = {
        account: PropTypes.object,
        emailMessages: PropTypes.object,
        pages: PropTypes.object,
        error: PropTypes.string,
        graphProfile: PropTypes.object,
        onSignIn: PropTypes.func.isRequired,
        onSignOut: PropTypes.func.isRequired,
        onRequestEmailToken: PropTypes.func.isRequired,
        onListNotebooks: PropTypes.func.isRequired,
        pages: PropTypes.object
    };

	constructor(props, context) {
		super(props, context);
		this.state = {access_token: ""}
	}

	render() {

		// Initializing the Access Token
		if (this.state.access_token == ""){
			if (this.props.account != null){
				let key = {
					authority: this.props.account.environment.replace("v2.0",""),
					clientId: this.props.account.idToken.aud,
					scopes: this.props.account.idToken.aud,
					homeAccountIdentifier: this.props.account.homeAccountIdentifier
				}
				let item = localStorage.getItem(JSON.stringify(key));
				if (item != null){
					this.setState({access_token: JSON.parse(item).accessToken});

				}
			}
		}

		const {title,isOfficeInitialized,host} = this.props;
		if (!isOfficeInitialized) {
		return (
			<Progress
				title={title}
				logo='assets/logo-filled.png'
				message='Please sideload your addin to see app body.'
			/>
		);
	}

	return (
		<div className='ms-welcome'>
			<Header logo='assets/saferoom_50@2x.png' title={this.props.title} message='Welcome' />
			<div style={{padding:"20px"}}>
				<EncryptDecrypt host={this.props.host} />

				{ this.props.host == Config.HOSTNAMES.ONENOTE 
					? (
						<div>
						<PrimaryButton
							style={{marginRight:"20px"}}
							title="Authenticate Addin" 
							onClick={this.props.onSignIn} 
							text="Authenticate" 
							allowDisabledFocus 
						/>
						<PrimaryButton
							style={{marginRight:"20px"}}
							title="Listing Onenote notebooks" 
							onClick={this.props.onListNotebooks} 
							text="Get notebooks" 
							allowDisabledFocus 
						/>
						</div>
					)
					: null
				}
				
			</div>
		</div>);
	}
}

export default AuthProvider(App);