import { Router } from 'express';
import * as c from '../controllers/tasks.controller';

const router = Router();

router.get('/stats', c.getTaskStats);
router.get('/', c.listTasks);
router.get('/:id', c.getTaskById);
router.post('/', c.createTask);
router.patch('/:id', c.updateTask);
router.delete('/:id', c.deleteTask);

export default router;
