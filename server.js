// BASE SETUP
// =============================================================================

// call the packages we need


// call express
const express = require('express');

// define our app using express
const app = express();

const bodyParser = require('body-parser');

const mongoose = require('mongoose');

const jwt = require('jwt-simple');

const path = require('path');

// connect with mongoDB
mongoose.connect('mongodb://127.0.0.1:27017/userdb', { useNewUrlParser: true });

// check our connection
const { connection } = mongoose;
connection.on('connected', () => {
  console.log('connected to the db');
});

// set the view to views directory and set the view engine to be ejs
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


// pull our schema from user.js
const User = require('./app/models/user');


// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const port = process.env.PORT || 8080; // set our port

// ROUTES FOR OUR API
// =============================================================================
const router = express.Router(); // get an instance of the express Router

app.use(express.static(`${__dirname}/public`));

// middleware to use for all requests
router.use((req, res, next) => {
  // do logging

  console.log('something happens');
  next();
});

router.route('/create')

  .post((req, res) => {
    // create a user (accessed at POST http://localhost:8080/user/create)
    const user = new User();
    user.name = req.body.name;
    user.email = req.body.email;
    user.phone_num = req.body.mobile;
    const userToken = jwt.encode(user.name, req.body.password);
    user.token = userToken;

    user.save((err) => {
      if (err) { res.send((err)); }

      res.render('user_create', {
        title: 'Bravo',
      });
    });
  })

  .get((req, res) => {
    res.render('create', { title: 'Create' });
  });


// read all the user on the database
router.route('/read')
  .get((req, res) => {
    User.find({}, ['name', '__id', 'phone_num', 'email'], (err, users) => {
      if (err) { res.send(err); }
      // display only the user name and the id

      res.render('read', {
        title: 'All Users',
        users,
      });
    });
  });


router.route('/read/:user_id')
// get the bear with that id (accessed at GET http://localhost:8080/api/bears/:bear_id)
  .get((req, res) => {
    User.findById(req.params.user_id, (err, user) => {
      if (err) { res.send(err); }

      decode_pass = jwt.decode(user.token, user.name);
      res.render('user_id', {
        title: user.name,
        user,
        pass: decode_pass,
      });
    });
  });


router.route('/update/:user_id')

  .get((req, res) => {
    res.sendFile(`${__dirname}/public/update.html`);
  });

// authenticate the user before it can update
router.route('/authenticate')
  .post((req, res) => {
    // find a user by it's token not an id
    genToken = jwt.encode(req.body.old_name, req.body.old_password);
    User.findOne({ token: genToken }, (err, user) => {
      if (err) { res.send(err); }

      // update the user information after we check it
      if (req.body.new_name !== '') { user.name = req.body.new_name; }

      if (req.body.new_email !== '') { user.email = req.body.new_email; }

      if (req.body.new_mobile !== '') { user.mobile = req.body.new_mobile; }

      if (req.body.new_password !== '') {
        // if we use a new name and password gnerate a new token
        if (req.body.new_name !== '') {
          user.token = jwt.encode(req.body.new_name, req.body.new_password);
        } else {
          user.token = jwt.encode(req.body.old_name, req.body.new_password);
        }
      }

      user.save((err) => {
        if (err) throw err;
      });
      res.json({ message: 'User succesfuly updated' });
    });
  });


// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', (req, res) => {
  res.render('index');
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/users', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log(`Magic happens on port ${port}`);
