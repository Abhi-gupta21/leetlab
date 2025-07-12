import express from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import { getAllListDetails, getPlayListDetails, createPlaylist, addProblemToPlaylist, deletePlaylist, removeProblemFromPlaylist } from "../controllers/playlist.controller.js";


const playlistRoutes = express.Router();

playlistRoutes.get('/', authMiddleware, getAllListDetails);

playlistRoutes.get('/:id', authMiddleware, getPlayListDetails);

playlistRoutes.post('/create-playlist', authMiddleware, createPlaylist);

playlistRoutes.post('/:id/add-problem', authMiddleware, addProblemToPlaylist);

playlistRoutes.delete('/:id', authMiddleware, deletePlaylist);

playlistRoutes.delete('/:id/remove-problem', authMiddleware, removeProblemFromPlaylist);


export default playlistRoutes;