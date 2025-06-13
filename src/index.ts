import dotenv from 'dotenv';

dotenv.config();

import buildApp from './app';

const start = async () => {
    const app = await buildApp();
    try {
        await app.listen({port: Number(process.env.PORT) || 3000});
        console.log("Server is running on port %d", process.env.PORT);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
};

start();