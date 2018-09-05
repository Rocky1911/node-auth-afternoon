require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const Auth0Strategy = require("passport-auth0");
const students = require("./students.json");
const app = express();

app.use(
  session({
    secret: "coolCoolCool",
    resave: false,
    saveUninitialized: false
  })
);

app.use(passport.initialize());
app.use(passport.session());

passport.use(
  // is new required on auth0strategy???? yes
  new Auth0Strategy(
    {
      domain: process.env.DOMAIN,
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "/login",
      scope: "openid email profile"
    },
    function(accessToken, refreshToken, extraParams, profile, done) {
      return done(null, profile);
    }
  )
);

//What the point of user and null below -- Also Steven stated serialuser will be called only once, When??
passport.serializeUser((user, done) => {
  done(null, {
    clientID: user.id,
    email: user._json.email,
    name: user._json.name
  });
});

passport.deserializeUser((obj, done) => {
  //instruction said obj should be first argument, what null/what els would be in the first param??
  done(null, obj);
});

app.get(
  "/login",
  passport.authenticate("auth0", {
    //what is auth0 as the first param??? Strategy type followed by configuration object
    successRedirect: "/students",
    failureRedirect: "/login",
    //The connection should be forced to use 'github'.
    //how does this work, what is this doing?? Connection property is a connection
    //under Connections in Auth0 - social which we set to GitHub????
    //Not sure about where this is  You can force passport's connection by using a connection property.
    // The value of this property comes from the connection name on your Auth0 account.
    connection: "github"
  })
);

function authenicated(req, res, next) {
  if (req.user) {
    next();
  } else {
    res.sendStatus(401);
  }
}

app.get("/students", (req, res, next) => {
  res.status(200).send(students);
});

const port = 3001;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
