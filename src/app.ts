import express, { response } from "express";
import dotenv from "dotenv";
import path from "path"
dotenv.config()
import {Request, Response} from "express"
import {ApiError} from "./errors/errors"
import friendsRoutes from "./routes/friendRoutesAuth";
const debug = require("debug")("app")
const cors = require("cors");

const app = express()

app.use(cors())

// ---- manual cors -----
/* app.use((req,res,next) => {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
  next();
}) */

// ---- simpel logger til consolen -------
/*  app.use((req, res, next) => {
  debug(new Date().toUTCString(), req.method, req.originalUrl, req.ip)
  next()
}) */

// ----- winston/morgan logger --------
import logger, { stream } from "./middleware/logger";
const morganFormat = process.env.Node_ENV == "production" ? "combined" : "dev"
app.use(require("morgan") (morganFormat, {stream}));
app.set("logger", logger) //sætter logger globalt på app - kan bruges på alle middlewares - req.app.get("logger").log("info", "Message")


logger.log("info", "info")
logger.log("error", "ups")

app.use(express.static(path.join(process.cwd(), "public")))
app.use("/api/friends", friendsRoutes)
 
app.get("/demo", (req, res) => {
  res.send("Server is up");
})

/* app.use((req, res, next) => {
  console.log("a request was made")
  next()
}) */

//default 404-handler for api-requests
app.use("/api", (req, res) => {
  res.status(404).json({ errorCode: 404, msg: "not found"})
})

//Makes JSON error-response for ApiErrors, otherwise pass on to default error handler
app.use((err:any, req:Request, res:Response, next:Function) => {
  if(err instanceof (ApiError)){
    const errorCode = err.errorCode ? err.errorCode : 500;
    res.status(errorCode).json({ errorCode: 404, msg: "not found"})
  } else{
    next(err)
  }
})

export default app;