import { db } from "../libs/db.js"

export const createPlaylist = async (req, res) => {
    try {
        const {name, description} = req.body
        const userId = req.user.id

        if(!name || !description || !userId){
            return res.status(400).json({
                error: "All fields are required"
            })
        }

        const playlistExists = await db.playlist.findUnique({
            where: {
                name
            }
        })

        if(playlistExists){
            return res.status(400).json({
                error: "Playlist already exists"
            })
        }

        const playlist = await db.playlist.create({
            data: {
                name,
                description,
                userId
            }
        })

        return res.status(200).json({
            success: true,
            message: "Playlist created successfully",
            playlist
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            error_message: "Something went wrong while creating playlist",
            error
        })
    }
}

export const getAllListDetails = async (req, res) => {
    try {
        const allplaylists = await db.playlist.findMany({
            where: {
                userId: req.user.id
            },
            include: {
                problems: {
                    include: {
                        problem: true
                    }
                }
            }
        })

        return res.status(200).json({
            success: true,
            message: "Playlists fetched successfully",
            allplaylists
        })

    } catch (error) {
        
        return res.status(500).json({
            success: false,
            error_message: "Something went wrong while fetching playlists",
            error
        })

    }
}

export const getPlayListDetails = async (req, res) => {
    try {
        const id = req.params.id
        const playlist = await db.playlist.findUnique({
            where: {
                userId: req.user.id,
                id
            },
            include: {
                problems: {
                    include: {
                        problem: true
                    }
                }
            }
        })

        if(!playlist){
            return res.status(404).json({
                error: "Playlist not found",
                success: false
            })
        }

        return res.status(200).json({
            success: true,
            message: "Playlist fetched successfully",
            playlist
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            error_message: "Something went wrong while fetching playlist",
            error
        })
    }
}

export const deletePlaylist = async (req, res) => {
    try {
        const id = req.params.id

        const playlist = await db.playlist.findUnique({
            where: {
                id
            }
        })

        if(!playlist){
            return res.status(404).json({
                error: "Playlist not found",
                success: false
            })
        }

        await db.playlist.delete({
            where: {
                id
            }
        })

        return res.status(200).json({
            success: true,
            message: "Playlist deleted successfully",
            playlist
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            error_message: "Something went wrong while deleting playlist",
            error
        })
    }
}

export const addProblemToPlaylist = async (req, res) => {
    const {playlistId} = req.params
    const {problemIds} = req.body

    try {
        
        if(!Array.isArray(problemIds) || problemIds.length === 0){
            return res.status(400).json({
                error: "problemIds must be an array"
            })
        }

        const problemsInPlaylist = await db.problemsInPlaylist.createMany({
            data: problemIds.map((problemId) => ({
                playlistId,
                problemId
            }))
        })

        res.status(201).json({
            success: true,
            message: "Problems added to playlist successfully",
            problemsInPlaylist
        })

    } catch (error) {
        return res.status(500).json({
            success: false,
            error_message: "Something went wrong while adding problems to playlist",
            error
        })
    }
}

export const removeProblemFromPlaylist = async (req, res) => {
    const id = req.params.id
    const problemIds = req.body

    try {
        const deletedProblems = await db.problemsInPlaylist.deleteMany({
            where: {
                playlistId: id,
                problemId: {
                    in: problemIds
                }
            }
        })

        return res.status(200).json({
            success: true,
            message: "Problem removed from playlist successfully",
            deletedProblems
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            error_message: "Something went wrong while removing problem from playlist",
            error
        })
    }
}