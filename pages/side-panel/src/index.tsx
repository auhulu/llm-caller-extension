import '@src/index.css';
import '@mantine/core/styles.css';
import { MantineProvider, createTheme } from '@mantine/core';
import SidePanel from '@src/SidePanel';
import { createRoot } from 'react-dom/client';

const theme = createTheme({});

const init = () => {
  const appContainer = document.querySelector('#app-container');
  if (!appContainer) {
    throw new Error('Can not find #app-container');
  }
  const root = createRoot(appContainer);
  root.render(
    <MantineProvider theme={theme}>
      <SidePanel />
    </MantineProvider>,
  );
};

init();
