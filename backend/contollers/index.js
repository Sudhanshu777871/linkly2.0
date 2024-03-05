const shortid = require('shortid');
const config = require("../config");
const bcrypt = require("bcryptjs");
// making api for handling new URL
const handelNewUrl = async (req, res) => {
    if (req.body.originalURL) {
        const shortURLId = shortid.generate();
        const { originalURL } = req.body
        config.query("INSERT INTO data (Original_Url,Short_Url) VALUES (?,?)", [originalURL, shortURLId], (error) => {
            if (error) throw error
            // sending the response
            res.status(200).send({ result: `${req.headers.host}/${shortURLId}` });
            res.end();
        })
    }
    else {
        res.status(400).send("Please Send The URL...");
        res.end();
    }
}


// making api for handling redirecting URL
const handelURLRedirect = async (req, res) => {
    if (!req.params.shortId) {
        res.status(404).send({ message: "Page Not Found" });
    } else {
        // code for searching the data
        config.query("SELECT Original_Url FROM data WHERE Short_Url = ?", [req.params.shortId], (err, result) => {
            if (err) throw err;
            else {
                res.redirect(result[0].Original_Url);

                // code for inserting the history data
                config.query("INSERT INTO history (short_URL) VALUES (?)", [req.params.shortId], (error) => {
                    if (err) throw error

                })

            }
        })

    }
}


// making api for handling URL history
const handelURLHistory = async (req, res) => {
    if (!req.body.id) {
        res.status(404).send({ message: "Page Not Found" });
    } else {
        // code for searching the data
        config.query("SELECT * FROM history WHERE short_URL = ?", [req.body.id], (err, result) => {
            if (err) {
                res.status(500).send({ message: "Internal Server Error" });
                return;
            }

            if (result && result.length > 0) {

                res.status(200).send(result);
            } else {
                res.status(404).send(false);
            }
        });
    }
}


// making api for showing the graph data
const showGrahpData = async (req, res) => {
    if (!req.body.id) {
        res.status(404).send({ message: "Please Send The Id" });
    } else {
        // code for searching the data
        config.query("SELECT DATE(Date) AS date_only, COUNT(*) AS date_count FROM history WHERE short_URL = ? GROUP BY DATE(Date) LIMIT 4", [req.body.id], (err, result) => {
            if (err) {
                res.status(500).send({ message: "Internal Server Error" });
                return false;
            }
            res.status(200).send(result)
        });
    }
}

// making api for handling the user login and signup

const handelUserSignup = async (req, res) => {
    if (req.body.name && req.body.email && req.body.password) {
        // destructing the value comes from req
        const { name, email, password } = req.body;

        // making sql query
        config.query("SELECT * FROM users WHERE Email = ?", [email], (err, result) => {
            // handling error
            if (err) throw err;
            // if user already exists
            if (result.length > 0) {
                res.send({ status: false })
            } else {
                // Store the hashed password in the database
                bcrypt.hash(password, 10, (err, hashedPassword) => {
                    if (err) throw err;
                    config.query("INSERT INTO users (Name,Email, Password) VALUES (?,?,?)", [name, email, hashedPassword], (err) => {
                        if (err) throw err;
                        // send the response
                        res.status(200).send({ status: true });
                    });
                });
            }
        });
    } else {
        res.status(400).send({ status: "Please Send The Name, Email and Password" });
    }
};


// code for making fuction to handel the login
const handelUserLogin = async (req, res) => {
    if (req.body.email && req.body.password) {
        // Destructuring the code here
        const { email, password } = req.body;
        // Running the query here
        config.query("SELECT Password FROM users WHERE Email = ?", [email], (err, result) => {
            if (err) throw err;
            // Checking if user is found
            if (result.length === 0) {
                res.status(400).send({ status: false });
            } else {
                const hashedPassword = result[0].Password; // Retrieve the hashed password from the result
                // Checking the password
                bcrypt.compare(password, hashedPassword, (err, isMatch) => {
                    // If some error occurred or if password is not matched
                    if (err || !isMatch) {
                        res.status(401).send({ status: 2 });
                    } else {
                        res.status(200).send({ status: true });
                    }
                });
            }
        });
    } else {
        res.status(400).send({ status: 3 });
    }
};

// exporting the module

module.exports = { handelNewUrl, handelURLRedirect, handelURLHistory, showGrahpData, handelUserSignup, handelUserLogin }