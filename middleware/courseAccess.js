const User = require('./models/User');
const Subscription = require('./models/Subscription');

const checkCourseAccess = async (req, res, next) => {
    try {
        const courseId = req.params.courseId;
        const userId = req.user._id;

  
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }


        if (user.purchasedCourses.includes(courseId)) {
            return next(); // Grant access
        }

        const subscription = await Subscription.findOne({
            user: userId,
            isActive: true,
            endDate: { $gte: new Date() },
        }).populate('plan');

        if (!subscription) {
            return res.status(403).json({ message: 'No active subscription or purchased access found.' });
        }

        const isCourseIncluded = subscription.plan.includedCourses.some(
            (id) => id.toString() === courseId
        );

        if (!isCourseIncluded) {
            return res.status(403).json({ message: 'Access denied. Please purchase the course or subscribe.' });
        }
        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = checkCourseAccess;
