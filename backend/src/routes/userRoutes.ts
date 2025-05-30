import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use((req, res, next) => {
  console.log(`USER ROUTES: Recebida requisição para ${req.method} ${req.originalUrl}`);
  next();
});


router.post('/usuarios/registrar', UserController.criar);
router.post('/usuarios/login', UserController.login);
router.post('/usuarios/logout', UserController.logout);


router.get('/usuarios/perfil', authMiddleware, UserController.getProfile);
router.get('/usuarios', authMiddleware, UserController.listarTodos);
router.put('/usuarios/:id', authMiddleware, UserController.atualizar);
router.delete('/usuarios/:id', authMiddleware, UserController.deletar);

export default router;