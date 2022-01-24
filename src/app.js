const express = require("express");
const dotenv = require("dotenv");
const loginRoutes = require("./routes/login");
const signupRoutes = require("./routes/signup");
const session = require("express-session");

dotenv.config();

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

app.listen(PORT, () => {
  console.log("The server is up at port " + PORT);
});
