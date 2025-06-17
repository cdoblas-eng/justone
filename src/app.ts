import Fastify from 'fastify';
import cors from '@fastify/cors';
import gameRoutes from './routes/game'
import sseRoute from './routes/sse'
import {HttpError} from "./errors/httpError";

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

export default buildApp;