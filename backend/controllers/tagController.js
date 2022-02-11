const asyncHandler = require('express-async-handler')

const Tag = require('../models/tagModel')

const getTag = asyncHandler(async (req, res) => {
    const tags = await Tag.find()

    res.status(200).json(tags)
})

const addTag = asyncHandler(async (req, res) => {
    if (!req.body.name) {
        res.status(400)
        throw new Error("Can't add an empty tag.")
    }

    console.log(req.body.tags)

    const tag = await Tag.create({
        name: req.body.name,
        slug: req.body.slug,
        tags: req.body.tags
    })

    res.status(200).json(tag)
})




module.exports = {
    getTag,
    addTag
}