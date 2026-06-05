import { app } from './app.js';
import { env } from './config/env.js';
import { getDatabase } from './db/sqlite.js';
const start = async () => {
    await getDatabase();
    app.listen(env.port, () => {
        console.log(`API listening on http://localhost:${env.port}`);
    });
};
void start();
//# sourceMappingURL=index.js.map