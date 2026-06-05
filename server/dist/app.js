import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { cartRouter } from './routes/cart.js';
import { authRouter } from './routes/auth.js';
import { ordersRouter } from './routes/orders.js';
import { restaurantsRouter } from './routes/restaurants.js';
export const app = express();
app.use(cors({
    origin: env.clientOrigin,
}));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (_req, res) => {
    res.json({
        ok: true,
        message: 'Food delivery API is running',
        timestamp: new Date().toISOString(),
    });
});
app.use('/api/auth', authRouter);
app.use('/api/cart', cartRouter);
app.use('/api/restaurants', restaurantsRouter);
app.use('/api/orders', ordersRouter);
app.use((_req, res) => {
    res.status(404).json({ message: 'Route not found' });
});
//# sourceMappingURL=app.js.map