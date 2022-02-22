const express = require("express");
const session = require("express-session");

const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const loginRoutes = require("./routes/login");
const signupRoutes = require("./routes/signup");
const auth = require("./middleware/auth");

const adminRoutes = require("./routes/admin");
const cors = require("cors");
// const session = require("express-session");

// Establishing DB Connection
require("./utils/connectDB");

const app = express();
const PORT = process.env.PORT;

//for incoming JSON objects to be parsed
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "*",
  })
);
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

app.post("/forgetPassword", require("./routes/forgetPassword"));
app.put("/resetPassword/:resetToken", require("./routes/resetPassword"));

app.listen(PORT, () => {
  console.log("The server is up at port " + PORT);
});
