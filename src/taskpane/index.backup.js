import 'office-ui-fabric-react/dist/css/fabric.min.css';
import App from './components/App';
import { AppContainer } from 'react-hot-loader';
import { initializeIcons } from 'office-ui-fabric-react/lib/Icons';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import {HOSTNAMES} from "./globals/config";
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import reducers from './reducers';
import reduxThunk from 'redux-thunk';

initializeIcons();

let isOfficeInitialized = false;

const title = 'Encryption AddIn';
const createStoreWithMiddleware = applyMiddleware(reduxThunk)(createStore);
const store = createStoreWithMiddleware(reducers);

const render = (Component,host) => {
    ReactDOM.render(
        <AppContainer>
            <Component host={host} title={title} isOfficeInitialized={isOfficeInitialized} />
        </AppContainer>,
        document.getElementById('container')
    );
};

const render = (Component,host) => {
    ReactDOM.render(
        <AppContainer>
            <Component host={host} title={title} isOfficeInitialized={isOfficeInitialized} />
        </AppContainer>,
        document.getElementById('container')
    );
};

/* Render application after Office initializes */
Office.initialize = () => {

    // Getting the current host
    let host = Office.context.diagnostics.host;
    switch (host){
        case HOSTNAMES.WORD:
            console.log("This is the Word Extension");
            break;
        case HOSTNAMES.EXCEL:
            console.log("This is the Excel extension");
            break;
        case HOSTNAMES.ONENOTE:
            console.log("This is the Onenote Extension");
            break;
        default:
            break;
    };

    isOfficeInitialized = true;
    render(App,host);

    
};

/* Initial render showing a progress bar */
render(App);

if (module.hot) {
    module.hot.accept('./components/App', () => {
        const NextApp = require('./components/App').default;
        render(NextApp);
    });
}