import inlineCss from './index.css?inline';
import { initAppWithShadow } from '@extension/shared';
import App from '@src/matches/example/App';

initAppWithShadow({ id: 'CEB-extension-example', app: <App />, inlineCss });
