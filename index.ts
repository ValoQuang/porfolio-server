const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Database Connection
const password: string = process.env.PASSWORD || "";
const uri = `mongodb+srv://${process.env.USERNAME}:${encodeURIComponent(password)}@cluster0.m7rmckh.mongodb.net/?retryWrites=true&w=majority`;
mongoose
  .connect(uri , {
    useNewUrlParser: true,
  })
  .then(() =>
    console.log(
      "==============Mongodb Database Connected Successfully=============="
    )
  )
  .catch((err: Error) => console.log(err));
  


// Run Server
const PORT = process.env.PORT || 8000;  
app.listen(PORT, () => {
  console.log("Server is running on ", PORT);
});
