import express from "express";
import { handleContacts } from "../controllers/identify";

const router = express.Router();

router.post("/identify", handleContacts);

module.exports = router;
