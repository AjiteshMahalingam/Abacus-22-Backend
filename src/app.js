const express = require("express");
const session = require("express-session");

const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const loginRoutes = require("./routes/login");
const signupRoutes = require("./routes/signup");
//const registerRoutes = require("./routes/registrations");
const adminRoutes = require("./routes/admin");
const cartRoutes = require("./routes/cart");
const eventpassRoutes = require('./routes/eventpass');
const paymentRoutes = require("./routes/payment");
const registerRoutes = require("./routes/registerEvent");
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

app.use("/admin", adminRoutes);
app.use("/user", loginRoutes);
app.use("/user/signup", signupRoutes);
app.use("/user/registrations", registerRoutes);
app.use("/user/cart", cartRoutes);
app.use("/user/geteventpass",eventpassRoutes);
app.use("user/payment",paymentRoutes);
app.use("/user/registration/",registerRoutes);

app.post("/forgetPassword", require("./routes/forgetPassword"));
app.put("/resetPassword/:resetToken", require("./routes/resetPassword"));



app.listen(PORT, () => {
  console.log("The server is up at port " + PORT);
});
