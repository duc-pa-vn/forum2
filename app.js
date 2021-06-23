const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { constants } = require('buffer');
const db = require('./config/database');
const app = express();
const userRouters = require('./routes/user.routes');

require('dotenv').config();
const port = process.env.PORT || 6969;

db.authenticate().then(() => console.log('ok')).catch(err => console.log(err));
app.use(bodyParser.json());
app.set('view engine', 'pug')
app.set('views','./views');

app.get('/', (req, res) => {
    res.send('bye')
});

app.use('/user', userRouters);

app.listen(port, console.log(`Let's go boy...`));