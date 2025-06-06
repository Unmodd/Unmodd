import express from 'express'

import { CreatePost, getAllPosts, deletePost, votePost, pinPost, boostUpvotes, searchPostsByTitle, getPostSuggestions } from '../controllers/Posts.js'
import auth from '../middleware/auth.js'


const router = express.Router()

router.post('/CreatePost', auth, CreatePost)
router.get('/get', getAllPosts)
router.delete('/delete/:id', auth, deletePost );
router.patch('/vote/:id', auth, votePost);
router.post('/pin/:id', auth, pinPost);
router.patch('/boost/:id', auth, boostUpvotes);
router.get('/search', searchPostsByTitle);
router.get('/suggestions', getPostSuggestions);


export default router