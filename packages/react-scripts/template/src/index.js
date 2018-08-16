import app from './server';
import http from 'http';

process.on('unhandledRejection', err => {
  throw err;
});

const server = http.Server(app);

let currentApp = app;

server.listen(process.env.PORT || 3000, error => {
  if (error) {
    console.error(error);
  }

  if (process.env.NODE_ENV === 'production') {
    console.log(`server is running on ${process.env.PORT || 3000}`);
  }
});

if (module.hot) {
  module.hot.accept('./server', () => {
    console.log('🔁  HMR Reloading `./server`...');
    server.removeListener('request', currentApp);
    server.on('request', app);
    currentApp = app;
  });
}
