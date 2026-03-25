const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// List of all API route handlers
const routes = {
  'login': require('./login'),
  'logout': require('./logout'),
  'verify': require('./verify'),
  'admin-login': require('./admin-login'),
  'admin-users': require('./admin-users'),
  'admin-user-detail': require('./admin-user-detail'),
  'admin-user-password': require('./admin-user-password'),
  'admin-user-subscription': require('./admin-user-subscription'),
  'admin-user-devicelimit': require('./admin-user-devicelimit'),
  'admin-user-ban': require('./admin-user-ban'),
  'admin-user-sessions': require('./admin-user-sessions'),
  'migrate': require('./migrate'),
};

// Route matching for /api/:route
app.all('/api/:route', async (req, res) => {
  const routeName = req.params.route;
  const handler = routes[routeName];

  if (handler) {
    try {
      await handler(req, res);
    } catch (err) {
      console.error(`Error in route ${routeName}:`, err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'internal_server_error' });
      }
    }
  } else {
    res.status(404).json({ error: 'route_not_found' });
  }
});

// Default route
app.get('/api', (req, res) => {
  res.status(200).json({ status: 'API is running' });
});

module.exports = app;
