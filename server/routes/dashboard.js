import express from 'express';
import jwt from 'jsonwebtoken';
import LearningPath from '../models/LearningPath.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// Get user dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    // Get general platform statistics
    const totalPaths = await LearningPath.countDocuments();
    const recentPaths = await LearningPath.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('goal skills createdAt generatedBy');
    
    // Get popular skills and goals
    const skillsAggregation = await LearningPath.aggregate([
      { $unwind: "$skills" },
      { $group: { _id: "$skills", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    const goalsAggregation = await LearningPath.aggregate([
      { $group: { _id: "$goal", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]);

    res.json({
      success: true,
      stats: {
        totalPaths,
        recentPaths,
        popularSkills: skillsAggregation.map(item => ({ 
          skill: item._id, 
          count: item.count 
        })),
        popularGoals: goalsAggregation.map(item => ({ 
          goal: item._id, 
          count: item.count 
        }))
      }
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    
    // Return fallback data if database is not available
    res.json({
      success: true,
      stats: {
        totalPaths: 0,
        recentPaths: [],
        popularSkills: [
          { skill: 'JavaScript', count: 15 },
          { skill: 'Python', count: 12 },
          { skill: 'React', count: 10 },
          { skill: 'HTML', count: 8 },
          { skill: 'CSS', count: 7 }
        ],
        popularGoals: [
          { goal: 'Full Stack Developer', count: 8 },
          { goal: 'Frontend Developer', count: 6 },
          { goal: 'Data Scientist', count: 4 },
          { goal: 'Backend Developer', count: 3 }
        ],
        message: 'Showing demo data - database may not be connected'
      }
    });
  }
});

// Get user's personal learning paths (requires authentication)
router.get('/my-paths', authMiddleware, async (req, res) => {
  try {
    const userPaths = await LearningPath.find({ userId: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(10);

    const userStats = {
      totalPaths: userPaths.length,
      recentPath: userPaths[0] || null,
      pathsThisMonth: userPaths.filter(path => {
        const thisMonth = new Date();
        thisMonth.setDate(1);
        return path.createdAt >= thisMonth;
      }).length
    };

    res.json({
      success: true,
      userPaths,
      userStats
    });

  } catch (error) {
    console.error('User paths error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user learning paths'
    });
  }
});

export default router;