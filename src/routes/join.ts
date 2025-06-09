import {FastifyInstance} from "fastify";
import {joinGame} from "../services/gameService";

export default async function (fastify: FastifyInstance) {
    fastify.post('/myGame/join/:gameId', async (request, reply) => {
        const { playerName } = request.body as { playerName: string, gameId: string };
        const { gameId } = request.params as { gameId: string };
        const game = await joinGame(gameId, playerName);
        reply.code(201).send(game);
    });
}