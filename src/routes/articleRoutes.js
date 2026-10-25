const express = require('express');
const router = express.Router();

const {
    getAllArticles,
    getArticleById,
    getMyArticles,
    createArticle,
    updateArticle,
    deleteArticle
} = require('../controllers/articleController');

const {
    protect
} = require('../middlewares/authMiddleware');

// Public read routes
router.get('/', getAllArticles);
router.get('/:id', getArticleById);
router.get('/my-articles', protect, getMyArticles);

// Protected write operations
router.post('/', protect, createArticle);
router.put('/:id', protect, updateArticle);
router.delete('/:id', protect, deleteArticle);

module.exports = router;