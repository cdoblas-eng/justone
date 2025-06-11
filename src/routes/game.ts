import { FastifyInstance } from 'fastify';
import {createGame, games, joinGame} from '../services/gameService'

export default async function (fastify: FastifyInstance) {
    fastify.post('/game/create', async (request, reply) => {
        const { playerName } = request.body as { playerName: string };
        const game = await createGame(playerName);
        reply.code(201).send(game);
    });

    fastify.get('/game', async (request, reply) => {
        reply.code(200).send(games);
    });

    fastify.post('/game/join/:gameId', async (request, reply) => {
        const { playerName } = request.body as { playerName: string, gameId: string };
        const { gameId } = request.params as { gameId: string };
        const game = await joinGame(gameId, playerName);
        reply.code(201).send(game);
    });

    fastify.post('/game/start/:gameId', async (request, reply) => {
        const { playerName } = request.body as { playerName: string, gameId: string };
        const { gameId } = request.params as { gameId: string };
        const game = await joinGame(gameId, playerName);
        reply.code(201).send(game);
    });
}