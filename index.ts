const express = require("express");
const app = express();
require("dotenv").config();
const mongoose = require("mongoose");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Database Connection
mongoose
  .connect(`mongodb+srv://qtruongngoc95:${encodeURIComponent("Quangpro1995@")}@cluster0.m7rmckh.mongodb.net/?retryWrites=true&w=majority`, {
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
