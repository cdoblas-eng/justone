import {FastifyInstance} from "fastify";
import {joinGame} from "../services/gameService";
import {addClient, broadcast} from "../utils/sse";

export default async function (fastify: FastifyInstance) {

    fastify.get('/sse', async (request, reply) => {
        addClient(reply)
    })

}