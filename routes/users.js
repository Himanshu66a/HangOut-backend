const router = require('express').Router()
const bcrypt = require("bcryptjs");
// const { findByIdAndUpdate } = require('../models/user');
const User = require('../models/user')

//UPDATE USER
router.put("/:id", async (req, res) => {
    if (req.body._id === req.params.id || req.body.isAdmin) {

        if (req.body.password) {
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt);
            } catch (err) {
                return res.status(500).json(err);
            }
        }
        try {
            const user = await User.findByIdAndUpdate(req.params.id, {
                $set: req.body,
            });
            res.status(200).json("Account has been updated");
        } catch (err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json("You can update only your account!");
    }
});

//get friends
router.get("/friends/:userId", async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      console.log(req.params.userId)
      const friends = await Promise.all(
        user.followings.map((friendId) => {
          return User.findById(friendId);
        })
      );
      let friendList = [];
      friends.map((friend) => {
        const { _id, username, profilePicture } = friend;
        friendList.push({ _id, username, profilePicture });
      });
      res.status(200).json(friendList)
    } catch (err) {
      res.status(500).json(err);
    }
  });
  

//GET FOLLOWERS
router.get("/followers/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        const friends = await Promise.all(
            user.followers.map((friendId) => {
                return User.findById(friendId);
            })
        );
        let friendList = [];
        friends.map((friend) => {
            const { _id, username, profilePicture } = friend;
            friendList.push({ _id, username, profilePicture });
        });
        res.status(200).json(friendList)
    } catch (err) {
        res.status(500).json(err);
    }
});




//DELETE USER
router.delete("/:id", async (req, res) => {

    if (req.body._id === req.params.id || req.body.isAdmin) {
        try {
            await User.findByIdAndDelete(req.params.id);
            res.status(200).json("Account has been deleted");
        } catch (err) {
            return res.status(401).json(err);
        }
    } else {
        console.log(req.body._id);
        return res.status(403).json("You can delete only your account!");
    }
})

//GET USER

router.get("/", async (req, res) => {
    const userId = req.query.userId;
    const username = req.query.username;
    try {
        const user = userId
            ? await User.findById(userId)
            : await User.findOne({ username: username });
        const { password, updatedAt, ...other } = user._doc;
        res.status(200).json(other);
    } catch (err) {
        res.status(500).json(err);
    }
});

//FOLLOW A USER
router.put("/:id/follow", async (req, res) => {

    if (req.body._id !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body._id);
            if (!user.followers.includes(req.body._id)) {
                await user.updateOne({ $push: { followers: req.body._id } });
                await currentUser.updateOne({ $push: { followings: req.params.id } });
                res.status(200).json("user has been followed");
            } else {
                res.status(403).json("you already follow this user");
            }
        } catch (err) {
            res.status(505).json(err);
        }
    } else {
        res.status(403).json("you cant follow yourself");
    }
});

//UNFOLLOW A USER
router.put("/:id/unfollow", async (req, res) => {

    if (req.body._id !== req.params.id) {
        try {
            const user = await User.findById(req.params.id);
            const currentUser = await User.findById(req.body._id);
            if (user.followers.includes(req.body._id)) {
                await user.updateOne({ $pull: { followers: req.body._id } });
                await currentUser.updateOne({ $pull: { followings: req.params.id } });
                res.status(200).json("user has been unfollowed");
            }

            else {
                res.status(403).json("you don't follow this user");
            }
        } catch (err) {
            res.status(505).json(err);
        }
    } else {
        res.status(403).json("you cant unfollow yourself");
    }
});

//GET ALL USERS
router.get("/all", async(req,res) => {
try {
    const data = await User.find({})
    if(data){
        res.status(200).json(data)
    }
    else{
        res.status(404).json('errrr')
    }
    
} catch (error) {
    console.log(error)
}
})

module.exports = router;