    const Post = require("../models/Post");

    // CREATE POST
    exports.createPost = async (req, res) => {
    try {
        const post = await Post.create({
        title: req.body.title,
        content: req.body.content,
        authorId: req.user.id,
        });

        res.status(201).json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
    };

    // GET ALL POSTS (public)
    exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.find().populate("authorId", "name email");
        res.json(posts);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
    };

    // UPDATE POST (owner only)
    exports.updatePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ message: "Post not found" });

        if (post.authorId.toString() !== req.user.id)
            return res.status(403).json({ message: "Not allowed" });

        post.title = req.body.title || post.title;
        post.content = req.body.content || post.content;

        await post.save();

        res.json(post);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
    };

    // DELETE POST
    exports.deletePost = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) return res.status(404).json({ message: "Post not found" });

        if (post.authorId.toString() !== req.user.id)
            return res.status(403).json({ message: "Not allowed" });

        await post.deleteOne();

        res.json({ message: "Post deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
    };