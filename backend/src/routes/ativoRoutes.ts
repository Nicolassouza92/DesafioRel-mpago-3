import { Router } from "express";
import { AtivoController } from "../controllers/ativo.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use((req, res, next) => {
  console.log(`ATIVO ROUTES: Recebida requisição para ${req.method} ${req.originalUrl}`);
  next();
});

router.use(authMiddleware);

router.post("/ativos", AtivoController.criar);
router.get("/ativos", AtivoController.listarTodos);
router.put("/ativos/:id", AtivoController.atualizar);
router.delete("/ativos/:id", AtivoController.deletar);

export default router;
