import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import LearningPath from "@/models/LearningPath";

// GET /api/dashboard/stats
export async function GET(_req: NextRequest) {
    try {
        await connectDB();

        const totalPaths = await LearningPath.countDocuments();
        const recentPaths = await LearningPath.find()
            .sort({ createdAt: -1 })
            .limit(10)
            .select("goal skills createdAt generatedBy");

        // Aggregate popular skills
        const skillsAggregation = await LearningPath.aggregate([
            { $unwind: "$skills" },
            { $group: { _id: "$skills", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]);

        // Aggregate popular goals
        const goalsAggregation = await LearningPath.aggregate([
            { $group: { _id: "$goal", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 },
        ]);

        return NextResponse.json({
            success: true,
            stats: {
                totalPaths,
                recentPaths: recentPaths.map((p) => ({
                    goal: p.goal,
                    skills: p.skills,
                    createdAt: p.createdAt,
                    generatedBy: p.generatedBy,
                })),
                popularSkills: skillsAggregation.map((s) => ({ skill: s._id, count: s.count })),
                popularGoals: goalsAggregation.map((g) => ({ goal: g._id, count: g.count })),
            },
        });
    } catch (error) {
        console.error("Dashboard stats error:", error);
        return NextResponse.json(
            { success: false, error: "Failed to fetch dashboard statistics" },
            { status: 500 }
        );
    }
}
