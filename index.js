const express = require('express')
const app = express();
const mongoose = require("mongoose")
const dotenv = require('dotenv')
const userRouter = require('./routes/users')
const authRoute = require('./routes/auth')
const postRoute = require('./routes/posts')
const conversationRoute = require("./routes/conversations");
const messageRoute = require("./routes/messages");
const multer = require("multer");
const path = require("path");
const cors = require('cors');

app.use(cors({
  origin: 'https://hangout.onrender.com'
}));

dotenv.config()

mongoose.connect(process.env.Mongo , ()=>{
    console.log('Connected to database');
    app.listen(5000,()=> console.log('listening to requests'))
})

app.use("/images", express.static(path.join(__dirname, "public/images")));



const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/images");
    },
    filename: (req, file, cb) => {
      cb(null, req.body.name);
    },
  });
  
  const upload = multer({ storage: storage });
  app.post("/api/upload", upload.single("file"), (req, res) => {
    try {
      return res.status(200).json("File uploded successfully");
    } catch (error) {
      console.error(error);
    }
  });

app.use(express.json())
app.use('/api/users',userRouter);
app.use('/api/auth',authRoute);
app.use('/api/posts',postRoute);
app.use("/api/conversations", conversationRoute);
app.use("/api/messages", messageRoute);
