const express = require("express");
const bcrypt = require("bcryptjs")
const JWT = require("jsonwebtoken");
const validator = require("email-validator");
const { v4: uuid } = require('uuid');

const firebaseApp = require("firebase-admin");

const serviceAccount = require("../wash-test-d6802-firebase-adminsdk-pdy75-646772ac5d.json");

firebaseApp.initializeApp({
    credential: firebaseApp.credential.cert(serviceAccount),
    databaseURL: "https://wash-test-d6802-default-rtdb.firebaseio.com"
});

// @Route POST /api/v1/user/
// @DESC Create a simple user
// @ACCESS Public
const CreateSimpleUser = async (req, res) => {
    try {

        const { Name, Email, Address, Password } = req.body;

        if (!Name) return res.status(400).json({
            Error: true,
            Msg: "Please enter a name!",
            User: null,
            Token: "",
            Exception: null,
            ExecptionString: "",
        })

        if (!validator.validate(Email)) return res.status(400).json({
            Error: true,
            Msg: "Please enter a valid email address!",
            User: null,
            Token: "",
            Exception: null,
            ExecptionString: "",
        })

        if (!Address) return res.status(400).json({
            Error: true,
            Msg: "Please enter your address!",
            User: null,
            Token: "",
            Exception: null,
            ExecptionString: "",
        })


        if (!Password) return res.status(400).json({
            Error: true,
            Msg: "Please enter a password!",
            User: null,
            Token: "",
            Exception: null,
            ExecptionString: "",
        })

        if (Password.length < 8) return res.status(400).json({
            Error: true,
            Msg: "Password should be atleast 8 charaters long!",
            User: null,
            Token: "",
            Exception: null,
            ExecptionString: "",
        })

        const usersRef = firebaseApp.firestore().collection('users')

        const querySnapshot = await usersRef.where("email", "==", Email).get()

        if (querySnapshot.docs.length > 0) return res.status(400).json({
            Error: true,
            Msg: "A user already exists with the provided email address!",
            User: null,
            Token: "",
            Exception: null,
            ExecptionString: "",
        })


        const salt = await bcrypt.genSalt(10)
        const hash = await bcrypt.hash(Password, salt)

        let body = {
            "name": Name,
            "email": Email,
            "address": Address,
            "password": hash
        }

        const responseWithUid = await firebaseApp.auth().createUser(body)

        const NewID = responseWithUid.uid



        await usersRef.doc(NewID).set(body)

        body.id = NewID


        const token = JWT.sign(
            {
                ID: body.id,
            },
            process.env.jwtSecret,
            {
                expiresIn: "7d"
            }
        )

        delete body.password

        return res.status(200).json({
            Error: false,
            Msg: "User created successfully!!",
            User: body,
            Token: token,
            Exception: null,
            ExecptionString: "",
        })


    } catch (error) {
        return res.status(500).json({
            Error: true,
            Msg: "Something broke on the server!",
            User: null,
            Token: "",
            Exception: error,
            ExecptionString: error ? error.toString() : "",
        })
    }
}


// @Route POST /api/v1/user/login
// @DESC login
// @ACCESS Public
const Login = async (req, res) => {
    try {

        const { Email, Password } = req.body;



        if (!validator.validate(Email)) return res.status(400).json({
            Error: true,
            Msg: "Please enter a valid email address!",
            User: null,
            Token: "",
            Exception: null,
            ExecptionString: "",
        })




        if (!Password) return res.status(400).json({
            Error: true,
            Msg: "Please enter a password!",
            User: null,
            Token: "",
            Exception: null,
            ExecptionString: "",
        })

        const usersRef = firebaseApp.firestore().collection('users')

        const querySnapshot = await usersRef.where("email", "==", Email).get()

        if (querySnapshot.docs.length === 0) return res.status(400).json({
            Error: true,
            Msg: "No user found!",
            User: null,
            Token: "",
            Exception: null,
            ExecptionString: "",
        })


        let UserData = querySnapshot.docs[0].data()
        UserData.id = querySnapshot.docs[0].id

        const match = await bcrypt.compare(Password, UserData.password)

        if (!match) return res.status(400).json({
            Error: true,
            Msg: "Invalid Credientials!",
            User: null,
            Token: "",
            Exception: null,
            ExecptionString: "",
        })



        const token = JWT.sign(
            {
                ID: UserData.id,
            },
            process.env.jwtSecret,
            {
                expiresIn: "7d"
            }
        )

        delete UserData.password
        return res.status(200).json({
            Error: false,
            Msg: "User created successfully!!",
            User: UserData,
            Token: token,
            Exception: null,
            ExecptionString: "",
        })


    } catch (error) {
        return res.status(500).json({
            Error: true,
            Msg: "Something broke on the server!",
            User: null,
            Token: "",
            Exception: error,
            ExecptionString: error ? error.toString() : "",
        })
    }
}




// @Route POST /api/v1/user/task
// @DESC Add Tasks
// @ACCESS Private
const AddTask = async (req, res) => {
    try {

        const UserID = req.user.ID;

        const { Summary } = req.body;

        if (!Summary) return res.status(400).json({
            Error: true,
            Msg: "Please enter a summary for task!",
            Task: null,
            Exception: null,
            ExecptionString: "",
        })

        const tasksRef = firebaseApp.firestore().collection('users').doc(UserID).collection('tasks')

        const ID = uuid()

        const body = {
            "done": false,
            "summary": Summary,
            "createdDate": new Date().toISOString(),
        }

        await tasksRef.doc(ID).set(body);

        body.id = ID;

        return res.status(200).json({
            Error: false,
            Msg: "task created successfully!!",
            Task: body,
            Exception: null,
            ExecptionString: "",
        })

    } catch (error) {
        return res.status(500).json({
            Error: true,
            Msg: "Something broke on the server!",
            User: null,
            Token: "",
            Exception: error,
            ExecptionString: error ? error.toString() : "",
        })
    }
}

// @Route DELETE /api/v1/user/task?TaskID=
// @DESC Delete Tasks
// @ACCESS Private
const DeleteTask = async (req, res) => {
    try {

        const UserID = req.user.ID;

        const { TaskID } = req.query;

        if (!TaskID) return res.status(400).json({
            Error: true,
            Msg: "Please send a TaskID to delete task!",
            DeletedTask: null,
            Exception: null,
            ExecptionString: "",
        })

        const tasksRef = firebaseApp.firestore().collection('users').doc(UserID).collection('tasks')




        const querySnapshot = await tasksRef.doc(TaskID).get();

        const data = querySnapshot.data()

        if (!data) return res.status(400).json({
            Error: true,
            Msg: "No task found!",
            User: null,
            Token: "",
            Exception: null,
            ExecptionString: "",
        })

        data.id = querySnapshot.id


        await tasksRef.doc(TaskID).delete()

        return res.status(200).json({
            Error: false,
            Msg: "task deleted successfully!!",
            DeletedTask: data,
            Exception: null,
            ExecptionString: "",
        })

    } catch (error) {
        return res.status(500).json({
            Error: true,
            Msg: "Something broke on the server!",
            User: null,
            Token: "",
            Exception: error,
            ExecptionString: error ? error.toString() : "",
        })
    }
}


// @Route PUT /api/v1/user/task
// @DESC Update Tasks
// @ACCESS Private

const UpdateTask = async (req, res) => {
    try {

        const UserID = req.user.ID;

        const { TaskID, Summary, IsDone } = req.body;


        if (!TaskID) return res.status(400).json({
            Error: true,
            Msg: "Please send a TaskID to update task!",
            UpdateTask: null,
            Exception: null,
            ExecptionString: "",
        })

        const tasksRef = firebaseApp.firestore().collection('users').doc(UserID).collection('tasks')

        const querySnapshot = await tasksRef.doc(TaskID).get();

        const data = querySnapshot.data()

        if (!data) return res.status(400).json({
            Error: true,
            Msg: "No task found!",
            UpdateTask: null,
            Exception: null,
            ExecptionString: "",
        })

        if (Summary) data.summary = Summary;
        if (typeof IsDone === "boolean") data.done = IsDone;


        await tasksRef.doc(TaskID).update(data)

        data.id = querySnapshot.id


        return res.status(200).json({
            Error: false,
            Msg: "task updated successfully!!",
            UpdatedTask: data,
            Exception: null,
            ExecptionString: "",
        })

    } catch (error) {
        return res.status(500).json({
            Error: true,
            Msg: "Something broke on the server!",
            User: null,
            Token: "",
            Exception: error,
            ExecptionString: error ? error.toString() : "",
        })
    }
}


// @Route GET /api/v1/user/task
// @DESC Get Tasks
// @ACCESS Private
const GetTasks = async (req, res) => {
    try {

        const UserID = req.user.ID;


        const tasksRef = firebaseApp.firestore().collection('users').doc(UserID).collection('tasks')

        const querySnapshot = await tasksRef.get();

        const newEntities = []

        querySnapshot.docs.forEach(doc => {
            const entity = doc.data()
            entity.id = doc.id
            newEntities.push(entity)
        });

        return res.status(200).json({
            Error: false,
            Msg: "tasks retrieved successfully!!",
            Tasks: newEntities,
            Exception: null,
            ExecptionString: "",
        })

    } catch (error) {
        return res.status(500).json({
            Error: true,
            Msg: "Something broke on the server!",
            User: null,
            Token: "",
            Exception: error,
            ExecptionString: error ? error.toString() : "",
        })
    }
}


// @Route GET /api/v1/user/verifyToken
// @DESC verifyToken
// @ACCESS Private
const VerifyToken = async (req, res) => {
    try {

        const UserID = req.user.ID;
        const usersRef = firebaseApp.firestore().collection('users')


        const user = await usersRef.doc(UserID).get()

        const UserData = user.data()


        if (!UserData) return res.status(400).json({
            Error: true,
            Msg: "No user found!",
            User: null,
            Token: "",
            Exception: null,
            ExecptionString: "",
        })

        const token = JWT.sign(
            {
                ID: UserID,
            },
            process.env.jwtSecret,
            {
                expiresIn: "7d"
            }
        )

        delete UserData.password;

        res.status(200).json({
            Error: true,
            Msg: "Success",
            User: UserData,
            Token: token,
            Exception: null,
            ExecptionString: "",
        })


    } catch (error) {
        return res.status(500).json({
            Error: true,
            Msg: "Something broke on the server!",
            User: null,
            Token: "",
            Exception: error,
            ExecptionString: error ? error.toString() : "",
        })
    }
}



module.exports = {
    CreateSimpleUser,
    Login,
    AddTask,
    DeleteTask,
    UpdateTask,
    GetTasks,
    VerifyToken
}
