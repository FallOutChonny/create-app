import express from 'express';
import compression from 'compression';
// import favicon from 'serve-favicon';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import App from './App';

const assets = require(process.env.ASSETS_MANIFEST);

const app = express();

app.use(compression());
app.use(express.static(process.env.SERVED_DIR));
// app.use(favicon(path.join(process.cwd(), '/public/favicon.ico')));

app.use('*', (req, res, next) => {
  res.send(`
	<!doctype html>
	<html>
		<head>
			<meta charset="utf-8" />
			<meta name="viewport" content="width=device-width, initial-scale=1">
			<link rel="manifest" href="${process.env.PUBLIC_URL}/manifest.json">
    	<link rel="shortcut icon" href="${process.env.PUBLIC_URL}/favicon.ico">
			${assets.main.css ? `<link href="${assets.main.css}" rel="stylesheet" />` : ''}
			<title>React App</title>
		</head>
		<body>
			<div id="root">${ReactDOMServer.renderToString(<App />)}</div>
			${__DLLS__ ? `<script src="/dll/vendors.js"></script>` : ''}
			${assets.runtime.js ? `<script src="${assets.runtime.js}"></script>` : ''}
			${assets.vendors.js ? `<script src="${assets.vendors.js}"></script>` : ''}
			${assets.main.js ? `<script src="${assets.main.js}" /></script>` : ''}
		</body>
	</html>
`);
});

export default app;
