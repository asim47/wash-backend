require('dotenv').config()
const express = require('express');
const path = require("path");
const cors = require("cors");
const fileUpload = require("express-fileupload")
const app = express();
const { UserRouter } = require("./routes/User.routes");


const port = process.env.PORT || 3000;

const versionNo = 1




class Server {
    constructor() {
        this.initMiddlewares();
        this.initRoutes();
        this.start();
    }

    initMiddlewares() {
        app.use(cors());
        app.use(express.json());
        app.use(fileUpload())
    }


    

    initRoutes() {
        app.use(`/api/v${versionNo}/user/`, UserRouter);

        app.get("/", (req, res) => {
            return res.send("Welcome to wash-test-backend")
        })

        app.use("*", (req, res) => {
            return res.status(404).json({
                Error: true,
                Msg: `the Endpoint ${req.originalUrl} with the method ${req.method} Is not hosted on our server!`
            })
        })
    }

    start() {
        app.listen(port, () => console.log(`app listening on  http://localhost:${port}`));
    }

}

new Server();
