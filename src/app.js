import express from "express";
import path from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import logger from "morgan";
import dotenv from "dotenv";
import mongoose from "mongoose";
import routeBuilder from "./utilities/route-builder";
import authService from "./services/auth.service";

dotenv.config();

/**
 * DB Connection
 *
 * **/
  const dbConnect = async () => {
    try {
      const res = await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
      })
      return console.log('Console Connected!');
    } 
    catch (e) {
      console.log(e);
    }
  }

  dbConnect();

/**
 * Initialize express
 *
 * **/
var app = express();

/**
 * Cors Whitelist and Cors initialization
 *
 * **/
const devWhiteList = [/http:\/\/localhost(?::\d{1,5})?$/],
  prodWhiteList = "*";

app.use(
  cors({
    origin:
      process.env.NODE_ENV === "development" ? devWhiteList : prodWhiteList,
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Access-Control-Allow-Credentials",
      "Authorization",
    ],
    preflightContinue: false,
  })
);

/**
 * Middleware
 *
 * **/
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "../public")));

/**
 * Route Protection
 *
 * **/
app.use((req, res, next) => authService.protectRoutes(req, res, next));

/**
 * EB Health Check
 *
 * **/
app.get("/api/v1/health-check", (req, res, next) =>
  res.status(200).send("Elastic Beanstalk Api Health!")
);

/**
 * Beginning of routes
 *
 * **/
routeBuilder(app);

/**
 * Error Handler
 *
 * **/
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    title: "Error Response",
    message: err.message,
    error: err.error,
  });
});

export default app;
