const Article = require('../models/articleModel');

// GET /api/articles
const getAllArticles = async (req, res) => {
    try {
        const articles = await Article.find().populate(
            'author',
            'name email role'
        );

        return res.status(200).json(articles);
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

// GET /api/articles/:id
const getArticleById = async (req, res) => {
    try {
        const article = await Article.findById(
            req.params.id
        ).populate('author', 'name email role');

        if (!article) {
            return res.status(404).json({
                message: 'Article not found'
            });
        }

        return res.status(200).json(article);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid article ID format'
            });
        }

        return res.status(500).json({
            message: err.message
        });
    }
};

// POST /api/articles (Protected creation)
const createArticle = async (req, res) => {
    try {
        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                message: 'Title and content are required'
            });
        }

        const newArticle = await Article.create({
            title,
            content,
            author: req.user._id
        });

        const populated = await newArticle.populate(
            'author',
            'name email role'
        );

        return res.status(201).json(populated);
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

// PUT /api/articles/:id (Author or admin)
const updateArticle = async (req, res) => {
    try {
        const article = await Article.findById(
            req.params.id
        );

        if (!article) {
            return res.status(404).json({
                message: 'Article not found'
            });
        }

        if (
            article.author.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                message: 'Forbidden: you are not the author of this article'
            });
        }

        article.title = req.body.title || article.title;
        article.content = req.body.content || article.content;

        const updated = await article.save();

        const populated = await updated.populate(
            'author',
            'name email role'
        );

        return res.status(200).json(populated);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid article ID format'
            });
        }

        return res.status(500).json({
            message: err.message
        });
    }
};

// DELETE /api/articles/:id (Author or admin)
const deleteArticle = async (req, res) => {
    try {
        const article = await Article.findById(
            req.params.id
        );

        if (!article) {
            return res.status(404).json({
                message: 'Article not found'
            });
        }

        if (
            article.author.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin'
        ) {
            return res.status(403).json({
                message: 'Forbidden: you are not the author of this article'
            });
        }

        await Article.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            message: 'Article deleted successfully',
            id: req.params.id
        });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({
                message: 'Invalid article ID format'
            });
        }

        return res.status(500).json({
            message: err.message
        });
    }
};

const getMyArticles = async (req, res) => {
    try {
        const articles = await Article.find({
            author: req.user._id
        });

        return res.status(200).json(articles);
    } catch (err) {
        return res.status(500).json({
            message: err.message
        });
    }
};

module.exports = {
    getAllArticles,
    getArticleById,
    getMyArticles,
    createArticle,
    updateArticle,
    deleteArticle
};