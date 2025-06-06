
import express from "express";
import { login, signup } from "../controllers/auth.js";
import { completeManualTask } from '../controllers/gamification.js';

import {
    getAllUsers,
    getUserProfileById,
    updateProfile,
    toggleTaskCompletion,
    searchUsersByUsername
} from '../controllers/users.js';

import auth from '../middleware/auth.js';

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);

router.get('/search', auth, searchUsersByUsername);

router.get('/getAllUsers', getAllUsers);
router.get('/all', getAllUsers);
router.get('/:id', getUserProfileById);
router.patch('/update/:id', auth, updateProfile);
router.patch('/:userId/tasks/:taskId/toggle', auth, toggleTaskCompletion);
router.post('/:userId/tasks/complete-manual', auth, completeManualTask);
router.post('/users/:userId/tasks/complete-manual', auth, completeManualTask);


export default router;