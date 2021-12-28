const express = require("express");
const UserController = require("../controllers/UserController")
const simpleUserJWTCheck = require("../middlewares/SimpleUserValidator")


class User {
    constructor() {
        this.router = express.Router();
        this.UserRouter();
    }
    UserRouter() {
        // @Route POST /api/v1/user/
        // @DESC Create a simple user
        // @ACCESS Public
        this.router.post("/", UserController.CreateSimpleUser);


        // @Route POST /api/v1/user/login
        // @DESC login
        // @ACCESS Public
        this.router.post("/login", UserController.Login);


        // @Route POST /api/v1/user/task
        // @DESC Add Tasks
        // @ACCESS Private
        this.router.post("/task", simpleUserJWTCheck, UserController.AddTask);


        // @Route DELETE /api/v1/user/task
        // @DESC Delete Tasks
        // @ACCESS Private
        this.router.delete("/task", simpleUserJWTCheck, UserController.DeleteTask);


        // @Route PUT /api/v1/user/task
        // @DESC Update Tasks
        // @ACCESS Private
        this.router.put("/task", simpleUserJWTCheck, UserController.UpdateTask);

        // @Route GET /api/v1/user/task
        // @DESC Get Tasks
        // @ACCESS Private
        this.router.get("/task", simpleUserJWTCheck, UserController.GetTasks);

        // @Route GET /api/v1/user/verifyToken
        // @DESC verifyToken
        // @ACCESS Private
        this.router.get("/verifyToken", simpleUserJWTCheck, UserController.VerifyToken);

    }
}
exports.UserRouter = new User().router;