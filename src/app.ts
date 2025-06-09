import Fastify from 'fastify';
import cors from '@fastify/cors';
import createRoute from './routes/create'
import joinRoute from './routes/join'

const buildApp = async () => {
    const app = Fastify({ logger: true });

    await app.register(cors);
    await app.register(createRoute);
    await app.register(joinRoute);

    app.get('/health', async () => {
        return { status: 'ok' };
    });

    return app;
};

export default buildApp;