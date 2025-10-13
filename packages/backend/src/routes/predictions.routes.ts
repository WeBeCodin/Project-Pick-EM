import { Router } from 'express';
import { predictionsController } from '../controllers/predictions.controller';

const router = Router();

/**
 * Predictions Routes
 */

// Create or update prediction
router.post('/', predictionsController.createOrUpdate.bind(predictionsController));

// Get user predictions (with optional filters)
router.get('/', predictionsController.getUserPredictions.bind(predictionsController));

// Get lock availability for a league/week
router.get(
  '/locks/availability',
  predictionsController.getLockAvailability.bind(predictionsController)
);

// Get single prediction
router.get('/:id', predictionsController.getPrediction.bind(predictionsController));

// Delete prediction
router.delete('/:id', predictionsController.deletePrediction.bind(predictionsController));

export default router;
