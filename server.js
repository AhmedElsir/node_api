// BASE SETUP
// =============================================================================

// call the packages we need
var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var mongoose   = require('mongoose');
var jwt        = require('jwt-simple');

//connect with mongoDB
mongoose.connect('mongodb://127.0.0.1:27017/userdb', { useNewUrlParser: true });

//check our connection
var connection = mongoose.connection;
connection.on('connected', function(){
    console.log("connected to the db");
});


//pull our schema from user.js
var User = require("./app/models/user");



// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

app.use(express.static(__dirname + '/public'));

//middleware to use for all requests
router.use(function(req, res, next){
    //do logging

    console.log("something happens");
    next();
});

router.route('/create')

    .post(function(req, res){
        //create a user (accessed at POST http://localhost:8080/user/create)
        var user = new User;
        user.name = req.body.name;
        user.email = req.body.email;
        user.phone_num = req.body.mobile;
        let userToken = jwt.encode(user.name, req.body.password);
        user.token = userToken;
        
        user.save(function(err){
            if(err)
                res.send((err));
            
            res.json({message: "user created"});
        });
    })

    .get(function(req, res){
        res.sendFile(__dirname + "/public/create.html")
    })


//read all the user on the database
router.route('/read')
    .get(function(req, res){
        User.find({}, ['name', '__id'],function(err, users){
            if(err)
                res.send(err);
            //display only the user name and the id
            res.json(users);
        })
    });


router.route('/read/:user_id')
    // get the bear with that id (accessed at GET http://localhost:8080/api/bears/:bear_id)
    .get(function(req, res){
        User.findById(req.params.user_id, function(err, user){
            if(err)
                res.send(err);
            
            res.json(user);
        })
    });


router.route('/update/:user_id')

    .get(function(req, res){
        res.sendFile(__dirname + "/public/update.html");
    })

//authenticate the user before it can update
router.route('/authenticate')
    .post(function(req, res){
        //find a user by it's token not an id
        genToken = jwt.encode(req.body.old_name, req.body.old_password);
        User.findOne({token: genToken}, function(err, user){
            if(err)
                res.send(err);
            
            //update the user information after we check it
            if(req.body.new_name !== "")
                user.name = req.body.new_name;

            if(req.body.new_email !== "")
                user.email = req.body.new_email;

            if(req.body.new_mobile !== "")
                user.mobile = req.body.new_mobile;
            
            if(req.body.new_password !== "")
            {
                //if we use a new name and password gnerate a new token
                if(req.body.new_name !== "")
                {
                    user.token = jwt.encode(req.body.new_name, req.body.new_password);
                }
                else
                {
                    user.token = jwt.encode(req.body.old_name, req.body.new_password);
                }
            }

            user.save(function(err){
                if(err) throw err;
            });
            res.json({message: "User succesfuly updated"});
                
        });
    })
    


// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/users', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);