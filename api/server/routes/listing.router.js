import express from "express";
import { verifyUser } from "../utils/verifyUser.js";
import { createListing, deleteListing, updateListing, getListing } from "../controllers/listing.controller.js";

const router = express.Router();

router.get('/get/:id', getListing);
router.post('/create', verifyUser, createListing);
router.delete('/delete/:id', verifyUser, deleteListing);
router.post('/update/:id', verifyUser, updateListing);


export default router;