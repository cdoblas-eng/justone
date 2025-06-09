import { FastifyInstance } from 'fastify';
import { createGame, games } from '../services/gameService'

export default async function (fastify: FastifyInstance) {
    fastify.post('/myGame/create', async (request, reply) => {
        const { playerName } = request.body as { playerName: string };
        const game = await createGame(playerName);
        reply.code(201).send(game);
    });

    fastify.get('/myGame', async (request, reply) => {
        reply.code(200).send(games);
    });
}
