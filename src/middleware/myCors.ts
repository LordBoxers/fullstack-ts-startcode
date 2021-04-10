import express, { response } from "express";
import {Request, Response} from "express"

//This file is meant as a manual cors implementation, in this project I instead require("cors") in app.ts

const app = express();

const cors = app.use((req,res,next) => {
    response.header("Access-Control-Allow-Origin", "*");
    response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept")
    next();
})

export default cors;