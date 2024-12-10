const jwt = require("jsonwebtoken");

const cekToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
        return res.status(403).json({ message: "Token is required" });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).json({
                message: err.message,
                loggedIn: false,
            });
        }

        req.user = decoded;
        next();
    });
};

module.exports = cekToken;
