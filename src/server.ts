import Fastify from 'fastify';
import cors from '@fastify/cors';
import gameRoutes from './routes/game'
import sseRoute from './routes/sse'
import {HttpError} from "./errors/httpError";

import dotenv from 'dotenv';

dotenv.config();

const buildApp = async () => {
    const app = Fastify({logger: true});
    const appPrefix = process.env.APP_NAME || '';
    await app.register(cors);
    await app.register(gameRoutes, {prefix: appPrefix});
    await app.register(sseRoute, {prefix: appPrefix});

    app.setErrorHandler((error, request, reply) => {
        if (error instanceof HttpError) {
            reply.status(error.statusCode).send({ error: error.message });
        } else {
            reply.status(500).send({ error: 'Internal Server Error' });
            console.error(error);
        }
    });


    app.get('/health', async () => {
        return {status: 'ok'};
    });

    return app;
};

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

