const config = require('config');
const jwt = require('jsonwebtoken');


function auth(req, res, next) {
    const token = req.headers["x-auth-token"];
    // check token

    if (!token) {
        return res.status(401).json({ msg: "Unauthorized" });
    }

    try {
        //verify token 
        const decoded = jwt.verify(token, process.env.jwtSecret);

        if (!decoded.ID) return res.status(401).json({ msg: "Unauthorized" })

        req.user = decoded;

        next();
    } catch (e) {
        res.status(401).json({ msg: "Unauthorized" })
    }

}

module.exports = auth;