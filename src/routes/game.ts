import {FastifyInstance} from 'fastify';
import {createGame, games, joinGame, startGame} from '../services/gameService'
import {Player} from "../models/player";

export default async function (fastify: FastifyInstance) {
    fastify.post('/game/create', async (request, reply) => {
        const {playerName} = request.body as { playerName: string };
        const game = await createGame(playerName);
        reply.code(201).send(game);
    });

    fastify.get('/game', async (request, reply) => {
        reply.code(200).send(games);
    });

    fastify.post('/game/join/:gameId', async (request, reply) => {
        const {playerName} = request.body as { playerName: string, gameId: string };
        const {gameId} = request.params as { gameId: string };
        let player: Player;
        player = await joinGame(gameId, playerName)

        reply.code(201).send({playerId: player.id, game: games[gameId]});
    });

    fastify.put('/game/start/:gameId', async (request, reply) => {
        const {gameId} = request.params as { gameId: string };
        startGame(gameId);
        reply.code(201).send();
    });
}