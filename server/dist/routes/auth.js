import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { createId, get, nowIso, run } from '../db/sqlite.js';
import { requireAuth } from '../middleware/auth.js';
const registerSchema = z.object({
    name: z.string().trim().min(2).max(80),
    email: z.string().trim().email().transform((value) => value.toLowerCase()),
    password: z.string().min(8).max(128),
});
const loginSchema = registerSchema.pick({ email: true, password: true });
const toPublicUser = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
});
const createToken = (user) => jwt.sign({
    email: user.email,
    name: user.name,
    role: user.role,
}, env.jwtSecret, {
    subject: user.id,
    expiresIn: '7d',
});
export const authRouter = Router();
authRouter.post('/register', async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: 'Invalid registration data',
            issues: parsed.error.flatten().fieldErrors,
        });
    }
    const { name, email, password } = parsed.data;
    const existingUser = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (existingUser) {
        return res.status(409).json({ message: 'Email already in use' });
    }
    const timestamp = nowIso();
    const id = createId();
    const passwordHash = await bcrypt.hash(password, 10);
    await run(`INSERT INTO users (id, name, email, password_hash, role, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`, [id, name, email, passwordHash, 'CUSTOMER', timestamp, timestamp]);
    const user = {
        id,
        name,
        email,
        role: 'CUSTOMER',
        createdAt: timestamp,
        updatedAt: timestamp,
    };
    return res.status(201).json({
        token: createToken(user),
        user,
    });
});
authRouter.post('/login', async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({
            message: 'Invalid login data',
            issues: parsed.error.flatten().fieldErrors,
        });
    }
    const { email, password } = parsed.data;
    const user = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }
    const publicUser = toPublicUser(user);
    return res.json({
        token: createToken(publicUser),
        user: publicUser,
    });
});
authRouter.get('/me', requireAuth, async (req, res) => {
    const user = await get('SELECT * FROM users WHERE id = ?', [req.auth?.userId ?? '']);
    if (!user) {
        return res.status(404).json({ message: 'User not found' });
    }
    return res.json({
        user: toPublicUser(user),
    });
});
//# sourceMappingURL=auth.js.map