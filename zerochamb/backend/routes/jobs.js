const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const auth = require('../middleware/auth');

// Get all jobs
router.get('/', async (req, res) => {
    try {
        const { keyword, location, type } = req.query;
        let query = {};

        if (keyword) {
            query.$or = [
                { title: { $regex: keyword, $options: 'i' } },
                { description: { $regex: keyword, $options: 'i' } }
            ];
        }

        if (location) {
            query.location = { $regex: location, $options: 'i' };
        }

        if (type) {
            query.type = type;
        }

        const jobs = await Job.find(query)
            .sort({ createdAt: -1 })
            .populate('postedBy', 'name company');

        res.json(jobs);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Post a new job
router.post('/', auth, async (req, res) => {
    try {
        const { title, company, location, type, description, requirements } = req.body;

        const job = new Job({
            title,
            company,
            location,
            type,
            description,
            requirements,
            postedBy: req.user.id
        });

        await job.save();
        res.status(201).json(job);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get job by ID
router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id)
            .populate('postedBy', 'name company');
            
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }
        
        res.json(job);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;