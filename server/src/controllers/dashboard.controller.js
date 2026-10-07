import Task from '../models/Task.model.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';

/**
 * GET /dashboard
 * Returns Jira-style overview statistics:
 * - 6 Overview Cards: Total Tasks, Idea Tasks, To Do Tasks, In Progress Tasks, In Review Tasks, Completed Tasks
 * - Priority breakdown (Critical, High, Medium, Low)
 * - Assigned to Me summary
 * - Recent tasks & recent activity stream (status transitions)
 */
export const getDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [
    totalTasks,
    ideaTasks,
    todoTasks,
    inProgressTasks,
    inReviewTasks,
    completedTasks,
    assignedToMeCount,
    createdByMeCount,
    criticalCount,
    highCount,
    mediumCount,
    lowCount,
    assignedTasks,
    recentTasks,
    allTasksForActivity,
  ] = await Promise.all([
    Task.countDocuments({}),
    Task.countDocuments({ status: 'Idea' }),
    Task.countDocuments({ status: 'To Do' }),
    Task.countDocuments({ status: 'In Progress' }),
    Task.countDocuments({ status: 'In Review' }),
    Task.countDocuments({ status: 'Completed' }),
    Task.countDocuments({ assignee: userId }),
    Task.countDocuments({ creator: userId }),
    Task.countDocuments({ priority: 'Critical' }),
    Task.countDocuments({ priority: 'High' }),
    Task.countDocuments({ priority: 'Medium' }),
    Task.countDocuments({ priority: 'Low' }),
    Task.find({ assignee: userId, status: { $ne: 'Completed' } })
      .populate('creator', '_id name email')
      .populate('assignee', '_id name email')
      .sort({ dueDate: 1, createdAt: -1 })
      .limit(10),
    Task.find({})
      .populate('creator', '_id name email')
      .populate('assignee', '_id name email')
      .sort({ updatedAt: -1 })
      .limit(8),
    Task.find({ 'statusHistory.0': { $exists: true } })
      .populate('creator', '_id name email')
      .populate('statusHistory.changedBy', '_id name email')
      .sort({ updatedAt: -1 })
      .limit(15),
  ]);

  // Aggregate recent status activity from task status histories
  const activityList = [];
  for (const t of allTasksForActivity) {
    if (t.statusHistory && t.statusHistory.length > 0) {
      for (const h of t.statusHistory) {
        activityList.push({
          taskId:     t._id,
          taskKey:    t.taskKey,
          taskTitle:  t.title,
          fromStatus: h.fromStatus,
          toStatus:   h.toStatus,
          changedBy:  h.changedBy,
          changedAt:  h.changedAt,
          comment:    h.comment,
        });
      }
    }
  }

  // Sort activity stream by most recent
  activityList.sort((a, b) => new Date(b.changedAt) - new Date(a.changedAt));
  const recentActivity = activityList.slice(0, 10);

  res.json(
    new ApiResponse(200, {
      cards: {
        totalTasks,
        ideaTasks,
        todoTasks,
        inProgressTasks,
        inReviewTasks,
        completedTasks,
      },
      counts: {
        totalTasks,
        ideaTasks,
        todoTasks,
        inProgressTasks,
        inReviewTasks,
        completedTasks,
        assignedToMeCount,
        createdByMeCount,
      },
      priorities: {
        Critical: criticalCount,
        High:     highCount,
        Medium:   mediumCount,
        Low:      lowCount,
      },
      assignedTasks,
      recentTasks,
      recentActivity,
    }),
  );
});
