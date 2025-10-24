import express from 'express';
import LearningPath from '../models/LearningPath.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Get all learning paths for the authenticated user
router.get('/my-paths', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find all paths belonging to this user
    const paths = await LearningPath.find({ userId })
      .sort({ createdAt: -1 }); // Most recent first
    
    // Calculate progress for each path
    const pathsWithProgress = paths.map(path => {
      const totalSteps = path.path.length;
      const completedSteps = path.completedSteps?.length || 0;
      const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
      
      return {
        _id: path._id,
        goal: path.goal,
        skills: path.skills,
        path: path.path,
        completedSteps: path.completedSteps || [],
        totalSteps,
        completedCount: completedSteps,
        progressPercentage,
        generatedBy: path.generatedBy,
        createdAt: path.createdAt,
        updatedAt: path.updatedAt
      };
    });
    
    res.json({
      success: true,
      count: pathsWithProgress.length,
      paths: pathsWithProgress
    });
  } catch (error) {
    console.error('Error fetching user paths:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch learning paths'
    });
  }
});

// Get a single learning path by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const path = await LearningPath.findOne({ _id: id, userId });
    
    if (!path) {
      return res.status(404).json({
        success: false,
        error: 'Learning path not found'
      });
    }
    
    const totalSteps = path.path.length;
    const completedSteps = path.completedSteps?.length || 0;
    const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
    
    res.json({
      success: true,
      path: {
        _id: path._id,
        goal: path.goal,
        skills: path.skills,
        path: path.path,
        completedSteps: path.completedSteps || [],
        totalSteps,
        completedCount: completedSteps,
        progressPercentage,
        generatedBy: path.generatedBy,
        createdAt: path.createdAt,
        updatedAt: path.updatedAt,
        metadata: path.metadata
      }
    });
  } catch (error) {
    console.error('Error fetching path:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch learning path'
    });
  }
});

// Toggle completion status of a step
router.patch('/:id/steps/:stepIndex', authMiddleware, async (req, res) => {
  try {
    const { id, stepIndex } = req.params;
    const userId = req.user._id;
    const stepNum = parseInt(stepIndex);
    
    // Validate step index
    if (isNaN(stepNum) || stepNum < 0) {
      return res.status(400).json({
        success: false,
        error: 'Invalid step index'
      });
    }
    
    const path = await LearningPath.findOne({ _id: id, userId });
    
    if (!path) {
      return res.status(404).json({
        success: false,
        error: 'Learning path not found'
      });
    }
    
    // Validate step exists in path
    if (stepNum >= path.path.length) {
      return res.status(400).json({
        success: false,
        error: 'Step index out of range'
      });
    }
    
    // Initialize completedSteps if it doesn't exist
    if (!path.completedSteps) {
      path.completedSteps = [];
    }
    
    // Toggle step completion
    const stepIndex_num = stepNum;
    const isCompleted = path.completedSteps.includes(stepIndex_num);
    
    if (isCompleted) {
      // Remove from completed steps
      path.completedSteps = path.completedSteps.filter(s => s !== stepIndex_num);
    } else {
      // Add to completed steps
      path.completedSteps.push(stepIndex_num);
    }
    
    await path.save();
    
    const totalSteps = path.path.length;
    const completedSteps = path.completedSteps.length;
    const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
    
    res.json({
      success: true,
      message: isCompleted ? 'Step marked as incomplete' : 'Step marked as complete',
      path: {
        _id: path._id,
        completedSteps: path.completedSteps,
        totalSteps,
        completedCount: completedSteps,
        progressPercentage
      }
    });
  } catch (error) {
    console.error('Error updating step:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update step'
    });
  }
});

// Delete a learning path
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    
    const path = await LearningPath.findOneAndDelete({ _id: id, userId });
    
    if (!path) {
      return res.status(404).json({
        success: false,
        error: 'Learning path not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Learning path deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting path:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete learning path'
    });
  }
});

// Update learning path metadata (notes, tags, etc.)
router.patch('/:id/metadata', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const { notes, tags, targetDate } = req.body;
    
    const path = await LearningPath.findOne({ _id: id, userId });
    
    if (!path) {
      return res.status(404).json({
        success: false,
        error: 'Learning path not found'
      });
    }
    
    // Update metadata
    if (!path.metadata) {
      path.metadata = {};
    }
    
    if (notes !== undefined) path.metadata.notes = notes;
    if (tags !== undefined) path.metadata.tags = tags;
    if (targetDate !== undefined) path.metadata.targetDate = targetDate;
    
    await path.save();
    
    res.json({
      success: true,
      message: 'Metadata updated successfully',
      metadata: path.metadata
    });
  } catch (error) {
    console.error('Error updating metadata:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update metadata'
    });
  }
});

export default router;
