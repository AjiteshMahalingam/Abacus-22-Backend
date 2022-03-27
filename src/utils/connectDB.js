const mongoose = require("mongoose");
mongoose
  .connect(process.env.EC2_DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("MongoDB Connected…");
  });
