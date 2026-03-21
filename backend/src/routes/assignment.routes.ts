import { Router } from 'express';
import multer from 'multer';
import { createAssignment ,getAssignments, deleteAssignment } from '../controllers/assignment.controller';

const router = Router();

// Configure multer to save uploaded files to an 'uploads' directory
const upload = multer({ dest: 'uploads/' });

// Route expects multipart/form-data
router.post('/', upload.single('file'), createAssignment);
router.get('/', getAssignments);
router.delete('/:id', deleteAssignment);

export default router;