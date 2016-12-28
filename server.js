// =======================
var express     = require('express');
var app         = express();
var bodyParser  = require('body-parser');
var morgan      = require('morgan');
var mongoose    = require('mongoose');
var fs     =require("fs");
const path = require('path');
var cool = require('cool-ascii-faces');
var Schema = mongoose.Schema;

// set up a mongoose model and pass it using module.exports
module.exports = mongoose.model('User', new Schema({
    name:String,
    email:String,
    password:String,
    gender:String,
    address:String,
    contact:String
}));

module.exports = mongoose.model('Product', new Schema({
          name:String,
          path:String,
          size:Number,
          currency:String,
          price:Number,
          description:String,
    }));
    module.exports = mongoose.model('Orders', new Schema({
          user:{type:Schema.ObjectId,ref:'User'},
        products:[{type:Schema.ObjectId,ref:'Product'}],
        created_at:{type:Date}
    }));

 var jwt    = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var s = require('string');

var apiRoutes = express.Router();

app.get('/cool', function(request, response) {
  response.send(cool());
});
// =======================
// configuration =========
// =======================
var port = process.env.PORT || 8080; // used to create, sign, and verify tokens
mongoose.connect(config.database); // connect to database
app.set('superSecret', config.secret); // secret variable

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

app.use(express.static(path.join(__dirname,'public')))

app.post('/search', function(req, res) {
a=[];
  Product.find({},function(err,product){
   var name=req.body.name.toLowerCase();

    product.forEach(function (item, index, array) {

            if(s(item.name).contains(name)){
            a.push(item);
          }
      });

      res.json(a);
  });
});
app.post('/productsetup', function(req, res) {


  var product=new Product({
    name:'product two',
    path:'Images/product2.png',
    size:10,
    currency:'$',
    price:100,
    description:"jfdsfjldskfjsdlkfjsldkfjsdlkfjsdkfjsdlfkjsddlfsd",
     });


     product.save(function(e){
           if(e) { }
          res.json({success:true});
           });


});
app.post('/placeorder', function(req, res) {


  var order=new Orders({
     });

    order.user=req.body.user;
    var orderdata=req.body;
    delete orderdata.user
    console.log(orderdata);
    for(var key in orderdata){
      //console.log(orderdata[key]);
      order.products.push(orderdata[key]);
    }

created=new Date();
    order.created_at=created;

     order.save(function(e){
           if(e) { res.json({success:false,message:"Some Thing Went Wrong"});
          }
          else
           res.json({success: true, message: 'Your Order Has Been Placed'});

          //  Orders.find({created_at:created}).populate([{path:'products'},{path:'user'}]).exec(function(err,order) {
          //    if (err) {console.log("error");}
          //    res.json({order});
          //  });
        });
        console.log(req.body);

});

app.post('/orderdetails', function(req, res) {

  Orders.find({user:req.body.user}).populate([{path:'products'},{path:'user'}]).exec(function(err,order) {
    if (err) {console.log("error");}
    res.json({order});
  });

  });




app.get('/orders', function(req, res) {

  Orders.find({}).populate([{path:'products'},{path:'user'}]).exec(function(err,order) {
    if (err) {console.log("error");}
    res.json({order});
  });

});
app.post('/user', function(req, res) {

   User.find({email:req.body.email},function(err,user){
console.log(user.length);
     if(user.length==0){
         var user=new User({
            name:req.body.name,
            email:req.body.email,
            password:req.body.password,
            gender:req.body.gender,
            address:req.body.address,
            contact:req.body.contact
            });
            user.save(function(e){
                  if(e) {

                  }
                  res.json({
                    status:true,
                    message:"User Is Created"}
                  );
                });

       }
       else{
         console.log(user.lenght);
         res.json({status:false,message:"User With email aready Exsist"});
       }
     });




});

app.get('/user',function(req,res){
  User.find({},function(err,user){
    res.json(user);
  });
});


app.get('/checkout',function(req,res){

});


// apply the routes to our application with the prefix /api
apiRoutes.post('/authenticate', function(req, res) {

  // find the user
  User.findOne({
    email: req.headers.name
  }, function(err, user) {
    console.log(user);
    if (err) throw err;

    if (!user) {
      res.json({ success: false, message: 'Authentication failed. User not found.' });
    } else if (user) {

      // check if password matches
      if (user.password != req.headers.password) {
        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
      } else {

        // if user is found and password is right
        // create a token
        var token = jwt.sign(user, app.get('superSecret'), {
          expiresIn: 60*60*24 // expires in 24 hours
        });

        // return the information including token as JSON


        res.json({
          success: true,
          token: token,
          email:user.email,
          id:user._id,
          name:user.name
        });

      }

    }

  });
});

apiRoutes.use(function(req, res, next) {

  // check header or url parameters or post parameters for token
  var token =  req.headers.token;

  console.log(token);
  // decode token
  if (token) {

    // verifies secret and checks exp
    jwt.verify(token, app.get('superSecret'), function(err, decoded) {
      if (err) {
        return res.json({ success: false, message: 'Failed to authenticate token.' });
      } else {
        // if everything is good, save to request for use in other routes
        req.decoded = decoded;
        next();
      }
    });

  } else {

    // if there is no token
    // return an error
    return res.status(403).send({
        success: false,
        message: 'No token provided.'
    });

  }
});

apiRoutes.get('/Products',function(req,res){
  var x=new Product({

  });

  Product.find({},function(err,product){

    res.json(product);
  });
});
apiRoutes.get('/', function(req, res) {
  res.json({ message: 'Welcome to the coolest API on earth!' });
});
apiRoutes.get('/hello',function(req,res){
    res.send('Hello');
});


// route to return all users (GET http://localhost:8080/api/users)
apiRoutes.get('/users', function(req, res) {
  User.find({}, function(err, users) {
    res.json(users);
  });
});

app.use('/api', apiRoutes);

// API ROUTES -------------------
// we'll get to these in a second

// =======================
// start the server ======
// =======================
app.listen(port);
console.log('Magic happens at http://localhost:' + port);
