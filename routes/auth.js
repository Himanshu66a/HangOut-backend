const router = require('express').Router()
const User = require('../models/user')
const bcrypt = require("bcryptjs")

//REGISTER
router.post('/register', async (req, res) => {

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
            profilePicture:req.body.profilePicture
        })
        
        await user.save().then(() => res.status(200).send(user)).catch(err => console.log(err))
    } catch (error) {
        console.log(error);
    }

})

//LOGIN
router.post("/login", async (req, res) => {
    try {
      const user = await User.findOne({ email: req.body.email });
      !user && res.status(404).json("user not found");
  
      const validPassword = await bcrypt.compare(req.body.password, user.password)
      !validPassword && res.status(400).json("wrong password")
  
      res.status(200).json(user)
    } catch (err) {
      //  res.status(500).json(err)
    }
  });

//CHECK
router.get("/login/:email/:password", async (req, res) => {
  try {

    console.log(req.params.email);
    console.log(req.params.password);
    const user = await User.findOne({ email: req.params.email});
    !user && res.status(404).json("user not found");

    const validPassword = await bcrypt.compare(req.params.password, user.password)
    !validPassword && res.status(400).json("wrong password")

    res.status(200).json(user)
  } catch (err) {
    //  res.status(500).json(err)
  }
});



module.exports = router;
