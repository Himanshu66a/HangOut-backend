const router = require("express").Router();
const Post = require('../models/Post')
const User = require('../models/user')

//CREATE A POST
router.post('/', async (req, res) => {
    const newPost = new Post(req.body);
    try {
        await newPost.save();
        res.status(200).send('Post created')
    } catch (error) {
        res.status(500).send('post not created')
        console.log(error);
    }
})

//UPDATE A POST
router.put("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId == req.body.userId) {
            await post.updateOne({ $set: req.body });
            res.status(200).send("the post has been updated");
        } else {
            res.status(403).send("you can update only your post");
        }
    } catch (err) {
        res.status(500).send(err);
    }
});

//DELETE A POST
router.delete("/:id/:CurrentuserId", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (post.userId == req.params.CurrentuserId) {
            await Post.findByIdAndDelete(req.params.id)
            res.status(200).send("the post has been deleted");
        } else {
            res.status(403).send("you can delete only your post");
        }
    } catch (error) {
        res.status(500).send(error);
    }
})

//LIKE A POST
router.put("/:id/like", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post.likes.includes(req.body.userId)) {
            await post.updateOne({ $push: { likes: req.body.userId } });
            res.status(200).json("The post has been liked");
        } else {
            await post.updateOne({ $pull: { likes: req.body.userId } });
            res.status(200).json("The post has been disliked");
        }
    } catch (err) {
        res.status(500).json(err);
    }
});



//get a post

router.get("/:id", async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);
    } catch (err) {
        res.status(500).json(err);
    }
});

//get timeline posts

router.get("/timeline/:userId", async (req, res) => {
    try {
        const currentUser = await User.findById(req.params.userId);
        console.log(currentUser);
        const userPosts = await Post.find({ userId: currentUser._id });
        const friendPosts = await Promise.all(
            currentUser.followings.map((friendId) => {
                return Post.find({ userId: friendId });
            })
        );
        console.log(userPosts);
        console.log(friendPosts);
        res.status(200).json(userPosts.concat(...friendPosts))
    } catch (err) {
        res.status(500).json(err);
    }
});

router.get("/profile/:username", async (req, res) => {
    try {
      const user = await User.findOne({ username: req.params.username });
      const posts = await Post.find({ userId: user._id });
      res.status(200).json(posts);
    } catch (err) {
      res.status(500).json(err);
    }
  });

module.exports = router;