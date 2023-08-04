const express = require('express');
const bodyParser = require('body-parser');
const user = require('./routes/users');
const home = require('./routes/home');
const payment = require('./routes/payment');
const product = require('./routes/product');
const notification = require('./routes/notification');
const app = express();
const cors = require('cors')

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}))
app.use(express.static('public'));


app.use('/', user);
app.use('/', product)
app.use('/', home)
app.use('/', notification)
app.use('/', payment)


app.get('/', (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*', 'http://159.89.248.34:3000', { reconnect: true })
  res.header("Access-Control-Allow-Credentials", true);
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,DELETE,PUT,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Accept, X-Custom-Header,Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  } else {
    return res.send({ success: "0", message: 'Hello World' });
  }
})

app.listen(3000, function () {
  console.log('Node app is running on port 3000');
});

module.exports = app;
