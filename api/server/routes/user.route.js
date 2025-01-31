import express from 'express';
import {getUser, deleteUser, updateUser, getUserListings } from '../controllers/user.controller.js';
import { verifyUser } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/update/:id', verifyUser, updateUser);
router.delete('/delete/:id', verifyUser, deleteUser);
router.get('/listings/:id', verifyUser, getUserListings);
router.get('/:id', verifyUser, getUser);

export default router;