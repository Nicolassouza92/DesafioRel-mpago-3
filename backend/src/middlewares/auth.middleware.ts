import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

declare module 'express' {
    interface Request {
        user?: {
            id: number;
            email: string;
        }
    }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
    const token = req.cookies.token;~
    console.log('AUTH MIDDLEWARE: Cookies recebidos:', req.cookies);
    console.log('AUTH MIDDLEWARE: Token do cookie:', token);

    if (!token) {
        console.error('AUTH MIDDLEWARE: Token não fornecido');
        res.status(401).json({ error: 'Não autorizado - Token não fornecido' });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { id: number; email: string; iat: number; exp: number };
        console.log('AUTH MIDDLEWARE: Token decodificado:', decoded);
        
        if (typeof decoded === 'object' && decoded !== null && 'id' in decoded && 'email' in decoded) {
            req.user = {
                id: Number(decoded.id),
                email: String(decoded.email)
            };
            console.log('AUTH MIDDLEWARE: req.user populado:', req.user);
            next();
        } else {
            console.error('AUTH MIDDLEWARE: Token inválido - payload malformado', decoded);
            res.status(401).json({ error: 'Token inválido - payload malformado' });
        }
    } catch (error) {
        console.error('AUTH MIDDLEWARE: Erro ao verificar token:', error);
        res.status(401).json({ error: 'Não autorizado - Token inválido' });
    }
};