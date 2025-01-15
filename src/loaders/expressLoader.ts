import express, { Request, Response, NextFunction } from 'express';
import cors, { CorsOptions } from "cors";

const loadExpress = ({ app }: { app: express.Application }): void => {
  app.enable("trust proxy");
  console.log('Loading express...');

  const corsOptions: CorsOptions = {
    origin: ["http://localhost:3000"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204,
    allowedHeaders: ["Content-Type", "Authorization", "X-Refresh-Token", "x-refresh-token"], // Correct way to allow headers
    
  };
	// adds jwt token verify to each request
	// app.use(jwtTokenVerify);
  app.use(cors(corsOptions));  

};

export default loadExpress;
