const Enrollment = require('../models/Enrollment');

/**
 * Idempotently create an enrollment.
 * If enrollment already exists for this (user, course), returns existing record.
 */
const createOrGetEnrollment = async ({ userId, courseId, paymentId }) => {
  const existing = await Enrollment.findOne({ user: userId, course: courseId });

  if (existing) {
    if (existing.status !== 'active') {
      existing.status = 'active';
      existing.enrolledAt = new Date();
      if (paymentId) existing.payment = paymentId;
      await existing.save();
    }
    return existing;
  }

  const enrollment = await Enrollment.create({
    user: userId,
    course: courseId,
    payment: paymentId || null,
    status: 'active',
    enrolledAt: new Date(),
  });

  return enrollment;
};

module.exports = {
  createOrGetEnrollment,
};
