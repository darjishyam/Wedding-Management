const Task = require('../models/Task');
const Wedding = require('../models/Wedding');

// Standard Wedding Tasks Template
const DEFAULT_TASKS = [
    { title: "Set a Budget", category: "Other" },
    { title: "Draft Guest List", category: "GuestList" },
    { title: "Book Wedding Venue", category: "Venue" },
    { title: "Hire a Wedding Planner (Optional)", category: "Other" },
    { title: "Book Photographer/Videographer", category: "Photography" },
    { title: "Book Caterer", category: "Catering" },
    { title: "Select Wedding Attire", category: "Attire" },
    { title: "Send Save the Dates", category: "GuestList" },
    { title: "Book DJ/Entertainment", category: "Music" },
    { title: "Book Officiant", category: "Ceremony" },
    { title: "Order Wedding Cake", category: "Catering" },
    { title: "Send Formal Invitations", category: "GuestList" },
    { title: "Finalize Menu", category: "Catering" },
    { title: "Finalize Seating Chart", category: "GuestList" },
    { title: "Pack for Honeymoon", category: "Other" }
];

// Get all tasks for a wedding
exports.getTasks = async (req, res) => {
    try {
        let weddingId = req.query.weddingId;

        if (!weddingId) {
            const wedding = await Wedding.findOne({ user: req.user._id });
            if (!wedding) return res.status(404).json({ message: "Wedding not found. Please create a wedding first." });
            weddingId = wedding._id;
        } else {
            // Verify ownership
            const wedding = await Wedding.findOne({ _id: weddingId, user: req.user._id });
            if (!wedding) return res.status(404).json({ message: "Wedding not found or access denied" });
        }

        let tasks = await Task.find({ wedding: weddingId }).sort({ isCompleted: 1, createdAt: 1 });

        // Auto-generate defaults if list is empty
        if (tasks.length === 0) {
            const newTasks = DEFAULT_TASKS.map(t => ({ ...t, wedding: weddingId }));
            tasks = await Task.insertMany(newTasks);
        }

        res.json(tasks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add a custom task
exports.addTask = async (req, res) => {
    try {
        const { title, category, dueDate, notes, weddingId } = req.body;

        let wedding;
        if (weddingId) {
            wedding = await Wedding.findOne({ _id: weddingId, user: req.user._id });
        } else {
            wedding = await Wedding.findOne({ user: req.user._id });
        }

        if (!wedding) return res.status(404).json({ message: "Wedding not found" });

        const newTask = new Task({
            wedding: wedding._id,
            title,
            category,
            dueDate,
            notes
        });

        const savedTask = await newTask.save();
        res.status(201).json(savedTask);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Update task (Toggle status or edit details)
exports.updateTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const updates = req.body;

        const wedding = await Wedding.findOne({ user: req.user._id });
        if (!wedding) return res.status(404).json({ message: "Wedding not found" });

        const task = await Task.findOneAndUpdate(
            { _id: taskId, wedding: wedding._id },
            updates,
            { new: true }
        );

        if (!task) return res.status(404).json({ message: "Task not found" });
        res.json(task);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Delete a task
exports.deleteTask = async (req, res) => {
    try {
        const { taskId } = req.params;

        const wedding = await Wedding.findOne({ user: req.user._id });
        if (!wedding) return res.status(404).json({ message: "Wedding not found" });

        const task = await Task.findOneAndDelete({ _id: taskId, wedding: wedding._id });

        if (!task) return res.status(404).json({ message: "Task not found" });
        res.json({ message: "Task deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
