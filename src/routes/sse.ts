import {FastifyInstance} from "fastify";
import {addPlayerSSE} from "../services/sseService";

export default async function (fastify: FastifyInstance) {

    fastify.get('/sse/join/:gameId/player/:playerId', async (request, reply) => {
        const {gameId} = request.params as { gameId: string }
        const {playerId} = request.params as { playerId: string }
        addPlayerSSE(reply, gameId, playerId);
    })

}