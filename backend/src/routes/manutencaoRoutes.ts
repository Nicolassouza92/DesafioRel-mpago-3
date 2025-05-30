import { Router } from "express";
import { ManutencaoController } from "../controllers/manutencao.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.use((req, res, next) => {
  console.log(`MANUTENCAO ROUTES: Recebida requisição para ${req.method} ${req.originalUrl}`);
  next();
});

router.use(authMiddleware); 

router.post("/manutencoes", ManutencaoController.criar);
router.get("/manutencoes/historico", ManutencaoController.listarManutencoesUsuario);
router.get("/manutencoes/pendentes", ManutencaoController.listarPendentes);  
router.put("/manutencoes/:id", ManutencaoController.atualizar);
router.delete("/manutencoes/:id", ManutencaoController.deletar);



export default router;