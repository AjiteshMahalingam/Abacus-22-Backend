
const path = require('path');

const express = require("express");
const dotenv = require("dotenv");
const loginRoutes = require("./routes/login");
const signupRoutes = require("./routes/signup");
const adminRoutes = require("./routes/admin");
const session = require("express-session");


dotenv.config({ path: path.resolve(__dirname, '../.env') });


// Establishing DB Connection
require("./utils/connectDB");

const app = express();
const PORT = process.env.PORT;

//for incoming JSON objects to be parsed
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(
  session({
    secret: "SECRET",
    resave: false,
    saveUninitialized: true,
  })
);

app.get("/", (req, res) => {
  res.status(200).send({ message: "All working well" });
});

app.use("/user", loginRoutes);
app.use("/user/signup", signupRoutes);
app.use("/admin", adminRoutes);


app.listen(PORT, () => {
  console.log("The server is up at port " + PORT);
});
