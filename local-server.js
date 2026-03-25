const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, 'public')));

const apiRoutes = [
  'login', 'logout', 'verify', 'admin-login', 'admin-users',
  'admin-user-detail', 'admin-user-password', 'admin-user-subscription',
  'admin-user-devicelimit', 'admin-user-ban', 'admin-user-sessions'
];

apiRoutes.forEach(route => {
  const handler = require(`./api/${route}`);
  app.all(`/api/${route}`, async (req, res) => {
    try {
        await handler(req, res);
    } catch (e) {
        console.error(e);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Internal server error' });
        }
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`\n================================`);
  console.log(`🚀 Local dev server running at:`);
  console.log(`👉 http://localhost:${PORT}/`);
  console.log(`================================\n`);
  console.log(`Ensure MongoDB is running locally at mongodb://localhost:27017`);
});
