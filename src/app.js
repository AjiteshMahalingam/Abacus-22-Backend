const express = require("express");
const session = require("express-session");

const path = require("path");
const dotenv = require("dotenv");
//dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

const loginRoutes = require("./routes/login");
const signupRoutes = require("./routes/signup");

const adminRoutes = require("./routes/admin");
const cartRoutes = require("./routes/cart");
// const paymentRoutes = require("./routes/payment");
const webHook = require("./routes/payment").webHook;
const paymentRoutes = require("./routes/payment");
const eventRoutes = require("./routes/registerEvent");
const hackathonRoutes = require("./routes/registerHackathon");
//const getDetailsRoutes = require("./routes/getDetails");
const cors = require("cors");
const auth = require("./middleware/auth");
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
// app.use("/payments", paymentRoutes);
//app.use("/user/geteventpass", eventpassRoutes);
// app.use("user/payment", paymentRoutes);
app.use("/user/registration", eventRoutes);
app.use("/user/hackathon-register/", hackathonRoutes);
//app.use("/user/getDetails", getDetailsRoutes);

app.post("/payments/webhook", webHook);
app.post("/payments/confirmation", auth, paymentRoutes.paymentConfirmation);
app.post("/forgetPassword", require("./routes/forgetPassword"));
app.put("/resetPassword/:resetToken", require("./routes/resetPassword"));

app.listen(PORT, () => {
  console.log("The server is up at port " + PORT);
});
