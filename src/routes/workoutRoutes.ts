import express from 'express';
import { 
  createWorkout,
  getWorkouts,
  getWorkoutById,
  updateWorkout,
  deleteWorkout
} from '../controllers/workoutController';
import { protect } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Workouts
 *   description: Workout management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Workout:
 *       type: object
 *       required:
 *         - title
 *         - activity
 *       properties:
 *         _id:
 *           type: string
 *           description: Auto-generated ID of the workout
 *         title:
 *           type: string
 *           description: Workout title
 *         description:
 *           type: string
 *           description: Detailed description of the workout
 *         activity:
 *           type: string
 *           description: Type of activity (running, cycling, etc.)
 *         duration:
 *           type: number
 *           description: Duration in minutes
 *         intensity:
 *           type: string
 *           enum: [low, medium, high]
 *           description: Workout intensity level
 *         user:
 *           type: string
 *           description: Reference to the user who created the workout
 *         location:
 *           type: string
 *           description: Location where the workout takes place
 *         date:
 *           type: string
 *           format: date-time
 *           description: Date and time of the workout
 *         notes:
 *           type: string
 *           description: Additional notes about the workout
 *       example:
 *         title: Morning Run
 *         description: 5K run around the park
 *         activity: running
 *         duration: 30
 *         intensity: medium
 *         location: Central Park
 *         date: 2023-04-15T08:00:00Z
 *         notes: Remember to bring water
 */

// All workout routes are protected
router.use(protect);

/**
 * @swagger
 * /workouts:
 *   get:
 *     summary: Get all workouts for the logged-in user
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: activity
 *         schema:
 *           type: string
 *         description: Filter by activity type
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by start date (YYYY-MM-DD)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter by end date (YYYY-MM-DD)
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *         description: Sort order (e.g., -date for descending date)
 *     responses:
 *       200:
 *         description: List of workouts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 count:
 *                   type: integer
 *                 workouts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Workout'
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 * 
 *   post:
 *     summary: Create a new workout
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Workout'
 *     responses:
 *       201:
 *         description: Workout created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 workout:
 *                   $ref: '#/components/schemas/Workout'
 *       401:
 *         description: Not authorized
 *       500:
 *         description: Server error
 */
router.route('/')
  .get(getWorkouts)
  .post(createWorkout);

/**
 * @swagger
 * /workouts/{id}:
 *   get:
 *     summary: Get a workout by ID
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workout ID
 *     responses:
 *       200:
 *         description: Workout details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 workout:
 *                   $ref: '#/components/schemas/Workout'
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - not owner of the workout
 *       404:
 *         description: Workout not found
 *       500:
 *         description: Server error
 * 
 *   put:
 *     summary: Update a workout
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workout ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Workout'
 *     responses:
 *       200:
 *         description: Workout updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 workout:
 *                   $ref: '#/components/schemas/Workout'
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - not owner of the workout
 *       404:
 *         description: Workout not found
 *       500:
 *         description: Server error
 * 
 *   delete:
 *     summary: Delete a workout
 *     tags: [Workouts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Workout ID
 *     responses:
 *       200:
 *         description: Workout deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Not authorized
 *       403:
 *         description: Forbidden - not owner of the workout
 *       404:
 *         description: Workout not found
 *       500:
 *         description: Server error
 */
router.route('/:id')
  .get(getWorkoutById)
  .put(updateWorkout)
  .delete(deleteWorkout);

export default router;
