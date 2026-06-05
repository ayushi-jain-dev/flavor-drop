import 'dotenv/config';
const requiredNumber = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};
export const env = {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: requiredNumber(process.env.PORT, 4000),
    jwtSecret: process.env.JWT_SECRET ?? 'dev-secret-change-me',
    clientOrigin: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
};
//# sourceMappingURL=env.js.map