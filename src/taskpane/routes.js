// Import section
import {Route,IndexRoute,browserHistory} from 'react-router';
import React from 'react';
import App from './components/App';

// Routes section
export default (
	<Route path="/" history={browserHistory} component={App} >
	</Route>
);