import  {Router} from 'express';
import { addBPReading, getBPHistory } from '../controllers/bp.controller.js';
const router = Router();
router.post('/add',addBPReading);
router.get('/history',getBPHistory)
export default router;