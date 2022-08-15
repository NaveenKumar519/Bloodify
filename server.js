const  express=require('express');
const  bodyParser=require('body-parser');
const  path=require('path');
let passport 			  = require("passport"),
    LocalStrategy         =require("passport-local"),
    User				  =require("./models/user"),
	Donor                 = require("./models/donor"),
	flash     			  = require("connect-flash"),
	confirmedRequest      = require("./models/confirmedRequest"),
	Requester			  = require("./models/requester"),
	ConfirmedDonor		  = require("./models/ConfirmedDonor"),
	BloodStock			  = require("./models/bloodstock"),
    passportLocalMongoose = require("passport-local-mongoose"), 
    mongoose              = require("mongoose");

const app= express();
mongoose.connect(YOUR_MONGO_URL,{useNewUrlParser: true, useUnifiedTopology: true});
mongoose.set('useFindAndModify', false);
app.use(express.urlencoded({ extended: true }));
app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname,'public')));
app.use(flash());
app.locals.moment = require("moment");
app.use(require("express-session")({
	secret: YOUR_SECRET_HERE,
	resave: false,
	saveUninitialized: false
}));
//passport configuration
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(bodyParser.urlencoded({extended: true}));
//making user available in all ejs files
app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	res.locals.error       = req.flash("error");
	res.locals.success     = req.flash("success");
	next();
});
function uuidv4() {
	return 'xxxx-5xx'.replace(/[xy]/g, function(c) {
	  var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
	  return v.toString(16);
	});
  }

//ROUTES
//home
app.get('/',function(request,response){
    response.render('index');
});

//login
app.get('/login',function(request,response){
    response.render('login');
});
//login logic
//middleware: code that runs before our final route callback
app.post("/login",passport.authenticate("local",{  //to check our login credentials
	successRedirect: "/",
	failureRedirect: "/login"
}),function(req,res){
    
});

//singup
app.get('/signup',function(request,response){
    response.render('signup');
});
app.get('/team',function(request,response){
    response.render('team');
});
//post
app.post("/signup",function(req,res){
	var isAdmin = false;
	if(req.body.adminCode === "RSS"){
		isAdmin = true;
	}
	User.register(new User({username: req.body.username, email: req.body.email, age: req.body.age, phone: req.body.phone,gender: req.body.gender,isAdmin:isAdmin}),req.body.password,function(err,user){
		if(err){
			console.log("OOPS SOMETHING WENT WRONG!!");
			console.log(err);
			return res.render("signup");
		}
		passport.authenticate("local")(req, res, function(){ //to log in the user
        
			res.redirect("/");
		});
	});
});

//logout
app.get("/logout",function(req,res){
	req.logout();
	res.redirect("/");
});

// donate blood
app.get("/donate", isLoggedIn, function(req,res){
	res.render("donate");
	
});
app.post("/donate",isLoggedIn, function(req,res){
	const uniqueId = uuidv4();
	const newDonor = {
		userId : uniqueId,
		name: req.body.name,
		isDiabetic: req.body.isDiabetic,
		weight: req.body.weight,
		units: req.body.units,
		bloodGroup: req.body.bloodGroup,
		rhFactor: req.body.rhFactor
	}
	Donor.create(newDonor, function(err,donor){
		if(err){
			console.log(err);
		}
		else{
			res.render("address", {id : uniqueId})
		}
	})
})
app.get("/ourDonors", function(req,res){
	ConfirmedDonor.find({}, function(err,allDonors){
		if(err){
			console.log(err);
		}
		else{
			const donors = allDonors.reverse();
			res.render("showDonors",{donors : donors});
		}
	})
	
})
app.get("/confirmDonor",isLoggedIn, function(req,res){
	res.render("confirmDonor");	
})
app.post("/confirmDonor",isLoggedIn, async function(req,res){
	const donor = await Donor.findOne({userId : req.body.userId});
	if(!donor){
		req.flash("error","no such id found in the database")
		return res.redirect("back");
	}
	await Donor.findByIdAndDelete(donor._id);
	const newDonor = {
		userId : donor.userId,
		name: donor.name,
		isDiabetic:donor.isDiabetic,
		weight:donor.weight,
		units:donor.units,
		bloodGroup:donor.bloodGroup,
		rhFactor:donor.rhFactor
	}
	ConfirmedDonor.create(newDonor, function(err,newDonor){
		if(err){
			console.log(err);
		}
		else{
			res.redirect("/ourDonors");
		}
	});
	const bloodStock = await BloodStock.findOne({ "bloodGroup": newDonor.bloodGroup, "rhFactor":newDonor.rhFactor});
	bloodStock.units = bloodStock.units + newDonor.units;
	BloodStock.findByIdAndUpdate(bloodStock._id, bloodStock, function(err,updatedStock){
		if(err){
			console.log(err);
		}
	})
});
//route to request for blood
app.get("/request",isLoggedIn, function(req,res){
	BloodStock.find({},function(err,stock){
		if(err){
			console.log(err);
		}
		else{
			res.render("request", {bloodStock : stock});
		}
	})
	
})
app.post("/request",isLoggedIn, function(req,res){
	const uniqueId = uuidv4();
	const data = {
		userId : uniqueId,
		name: req.body.name,
		aadhar : req.body.aadhar,
		units: req.body.units,
		bloodGroup: req.body.bloodGroup,
		rhFactor: req.body.rhFactor
	}
	Requester.create(data, function(err,reply){
		if(err){
			console.log(err);
		}
		else{
			res.render("address", {id : uniqueId})
		}
	})
})
app.get("/confirmRequest",isLoggedIn, function(req,res){
	res.render("confirmRequest");	
})
app.post("/confirmRequest",isLoggedIn, async function(req,res){
	const requester = await Requester.findOne({userId : req.body.userId});
	console.log(requester)
	if(!requester){
		req.flash("error","no such id found in the database")
		return res.redirect("back");
	}
	const newRequester = {
		userId : requester.userId,
		name: requester.name,
		aadhar: requester.aadhar,
		units:requester.units,
		bloodGroup:requester.bloodGroup,
		rhFactor:requester.rhFactor
	}
	const bloodStock = await BloodStock.findOne({ "bloodGroup": newRequester.bloodGroup, "rhFactor":newRequester.rhFactor});
	let symbol = newRequester.rhFactor === "positive" ? "+ve" : "-ve";
	if(bloodStock.units <  newRequester.units){
		req.flash("error","No sufficient blood available! " + newRequester.bloodGroup + symbol + " has only " + bloodStock.units + " units of blood" );
		res.redirect("back");
	}
	else{
		bloodStock.units = bloodStock.units - newRequester.units;
		await Requester.findByIdAndDelete(requester._id);
		await BloodStock.findByIdAndUpdate(bloodStock._id, bloodStock);
		confirmedRequest.create(newRequester, function(err,newRequester){
			if(err){
				console.log(err);
			}
			else{
				req.flash("success","successful transaction");
				res.redirect("back");
			}
		});
	}
	
	
});
//writing our own middleware
function isLoggedIn(req,res,next){
	if(req.isAuthenticated()){
		return next();
	}
	 res.redirect("/login");		
}
app.listen(8000,function(){
    console.log("heard on 8000");
});