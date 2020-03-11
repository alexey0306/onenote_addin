// Import section
import * as React from 'react';
import { MessageBarButton } from 'office-ui-fabric-react/lib/Button';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react/lib/MessageBar';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';

// Init section
let alertType = MessageBarType.error;

// Class section
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