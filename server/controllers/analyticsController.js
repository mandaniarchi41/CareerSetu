const Profile = require('../models/Profile');
const LearningPath = require('../models/LearningPath');
const Progress = require('../models/Progress');
const StudyPlan = require('../models/StudyPlan');

exports.getAnalytics = async (req, res) => {
  try {
    const userId = req.user.id;

    // ── Fetch all real data ────────────────────────────────────────────────
    const profile = await Profile.findOne({ userId });
    const history = await LearningPath.find({ userId }).sort({ createdAt: -1 });
    const latestPath = history[0] || null;

    // Get ALL progress records (not just latest) for full history
    const allProgress = await Progress.find({ userId });
    const latestProgress = latestPath
      ? allProgress.find(p => p.learningPathId?.toString() === latestPath._id?.toString())
      : null;

    const completedTopics = latestProgress?.completedTopics || [];
    const completionLog = allProgress.flatMap(p => p.completionLog || []);

    // ── 1. Skill Radar — real skill names & levels ─────────────────────────
    let skillData = [];
    if (profile && profile.skills && profile.skills.length > 0) {
      const sorted = [...profile.skills].sort((a, b) => (b.level || 0) - (a.level || 0));
      skillData = sorted.slice(0, 6).map(s => ({
        subject: s.name,
        A: s.level || 50,
        fullMark: 100
      }));
    }
    // Radar needs at least 3 points
    while (skillData.length < 3) {
      skillData.push({ subject: `Skill ${skillData.length + 1}`, A: 10, fullMark: 100 });
    }

    // ── 2. Real Readiness Score ────────────────────────────────────────────
    let profileScore = 0;
    if (profile) {
      if (profile.skills?.length > 0) profileScore += 10;
      if (profile.skills?.length >= 5) profileScore += 5;
      if (profile.experience) profileScore += 8;
      if (profile.education) profileScore += 4;
      if (profile.extractedFrom && profile.extractedFrom !== 'Manual') profileScore += 3;
    }

    const avgSkillLevel = profile?.skills?.length > 0
      ? profile.skills.reduce((sum, s) => sum + (s.level || 0), 0) / profile.skills.length
      : 0;
    const skillScore = Math.round((avgSkillLevel / 100) * 30);

    const progressPct = latestProgress?.progressPercentage || 0;
    const progressScore = Math.round((progressPct / 100) * 40);

    const readinessScore = Math.min(100, profileScore + skillScore + progressScore);

    // ── 3. Step completion stats ───────────────────────────────────────────
    const totalSteps = history.reduce((acc, p) => {
      if (p.phases) return acc + p.phases.reduce((a, ph) => a + (ph.steps?.length || 0), 0);
      return acc;
    }, 0);
    const completedSteps = completionLog.length; // real count from timestamps

    // Real study time: sum of (time spent per session, estimated from completion spread)
    // Group completions by day and estimate 30 min per step completed
    const studyHours = Math.round(completedSteps * 0.5 * 10) / 10; // 30 min per step

    // ── 4. Real Weekly Activity from completionLog timestamps ──────────────
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    let weeklyProgress = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(today);
      dayStart.setDate(today.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dayName = days[dayStart.getDay()];

      // Count real completions on this day from the log
      const stepsOnDay = completionLog.filter(log => {
        const d = new Date(log.completedAt);
        return d >= dayStart && d <= dayEnd;
      }).length;

      // Also count StudyPlan tasks for this day
      const dateStr = dayStart.toISOString().split('T')[0];
      const studyPlan = await StudyPlan.findOne({ userId, date: dateStr });
      const planTasks = studyPlan?.tasks?.filter(t => t.done)?.length || 0;

      // Use real step completions as hours (30 min each) + study plan tasks
      const hoursForDay = Math.round((stepsOnDay * 0.5 + planTasks) * 10) / 10;

      weeklyProgress.push({ day: dayName, hours: hoursForDay, steps: stepsOnDay });
    }

    // ── 5. Real Streak — consecutive days with any learning activity ───────
    let streak = 0;
    for (let i = 0; i < 30; i++) { // check last 30 days
      const dayStart = new Date(today);
      dayStart.setDate(today.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      const dateStr = dayStart.toISOString().split('T')[0];

      const activityOnDay = completionLog.some(log => {
        const d = new Date(log.completedAt);
        return d >= dayStart && d <= dayEnd;
      });

      const studyPlan = activityOnDay ? null : await StudyPlan.findOne({ userId, date: dateStr });
      const planActivity = studyPlan?.tasks?.some(t => t.done) || false;

      if (activityOnDay || planActivity) {
        streak++;
      } else if (i > 0) { // allow today to be 0 without breaking streak
        break;
      }
    }

    // ── 6. Badges — earned by real milestones ─────────────────────────────
    const badges = [
      completedSteps >= 1,          // 🎯 First Step
      completedSteps >= 5,          // 🚀 Getting Started
      completedSteps >= 10,         // 🔥 On a Roll
      completedSteps >= 25,         // 💪 Committed
      history.length >= 2,          // 🗺️ Explorer
      profile?.experience != null,  // 💼 Career Ready
      avgSkillLevel >= 70,          // ⭐ Skilled
    ].filter(Boolean).length;

    // ── 7. All skills for breakdown bars ──────────────────────────────────
    const skillBreakdown = profile?.skills?.map(s => ({ name: s.name, level: s.level || 50 })) || [];

    res.json({
      profile: profile || null,
      skillData,
      skillBreakdown,
      readinessScore,
      weeklyProgress,
      totalSteps,
      completedSteps,
      stats: {
        badges,
        studyHours,
        projects: history.length,
        streak,
        completedSteps,
        totalSteps,
        progressPercentage: progressPct
      }
    });
  } catch (err) {
    console.error('Analytics Error:', err);
    res.status(500).json({ message: 'Error fetching analytics', error: err.message });
  }
};
