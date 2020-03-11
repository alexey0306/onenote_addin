// Import section
import * as React from 'react';
import {TextField} from 'office-ui-fabric-react';

// Init section

// Class section
export const PasswordInput = (props) => {

	return (
		<TextField
			errorMessage={props.errorMessage} 
			label="Password" 
			type="password" 
			onChange={(event) => props.onChanged(event.target.value)}
		/>
	);
} 