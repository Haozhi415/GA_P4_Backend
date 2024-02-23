var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var cors = require("cors");

// var indexRouter = require('./routes/index');
var userRouter = require("./routes/user.route.js");
var authRouter = require("./routes/auth.route.js");
var listingRouter = require("./routes/listing.route.js");

require("dotenv").config();
require("./client/mongo");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin
      // (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      const allowedOrigins = [
        "https://ga-p4-frontend.onrender.com",
        "https://ga-p4-backend.onrender.com",
      ];
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = `The CORS policy for this site does not allow access from the specified Origin.`;
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use("/user", userRouter);
app.use("/auth", authRouter);
app.use("/listing", listingRouter);

// error handler
app.use((err, req, res, next) => {
  // shows the status code or 500 if there is none.
  const statusCode = err.statusCode || 500;

  // shows the error message or "Internal Server Error" if there is none.
  const message = err.message || "Internal Server Error";

  // sends the status code and the error message to the client.
  return res.status(statusCode).json({
    success: false,
    statusCode,
    message,
  });
});

module.exports = app;
