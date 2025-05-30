import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRoutes from './routes/userRoutes';
import ativoRoutes from './routes/ativoRoutes';
import manutencaoRoutes from './routes/manutencaoRoutes';

const app = express();


const corsOptions = {
  origin: 'http://localhost:5173',
  credentials: true, 
};
app.use(cors(corsOptions)); 

app.use(express.json());
app.use(cookieParser());


app.use('/api', userRoutes);

app.use('/api', ativoRoutes);
app.use('/api', manutencaoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

export default app;