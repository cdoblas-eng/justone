import Fastify from 'fastify';
import cors from '@fastify/cors';
import gameRoutes from './routes/game'
// import joinRoute from './routes/join'
import sseRoute from './routes/sse'

const buildApp = async () => {
    const app = Fastify({ logger: true });
    const appPrefix = process.env.APP_NAME || '';
    await app.register(cors);
    await app.register(gameRoutes, { prefix: appPrefix });
    await app.register(sseRoute, { prefix: appPrefix });

    app.get('/health', async () => {
        return { status: 'ok' };
    });

    return app;
};

export default buildApp;