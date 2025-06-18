import {FastifyInstance} from 'fastify';
import {createGame, getGame, joinGame, nextRound, setWord, startGame} from '../services/gameService'
import {Player} from "../models/player";
import {Clue} from "../models/clue";
import {giveClue, resolve} from "../services/playerService";

export default async function (fastify: FastifyInstance) {
    fastify.post('/game/create', async (request, reply) => {
            const {playerName} = request.body as { playerName: string };
            const game = await createGame(playerName);
            reply.code(201).send({gameId: game.id, playerId: game.players[0].id});
    });

    fastify.post('/game/join/:gameId', async (request, reply) => {
        const {playerName} = request.body as { playerName: string, gameId: string };
        const {gameId} = request.params as { gameId: string };
        let player: Player;
        player = await joinGame(gameId, playerName)
        const game = getGame(gameId)
        reply.code(201).send({playerId: player.id, players: game.players});
    });

    fastify.put('/game/start/:gameId', async (request, reply) => {
        const {gameId} = request.params as { gameId: string };
        await startGame(gameId)
        reply.code(204).send();
    });

    fastify.post('/game/:gameId/giveNumber/:number', async (request, reply) => {
        const {gameId} = request.params as { gameId: string };
        const {number} = request.params as { number: string };
        await setWord(gameId, Number(number))
        reply.code(204).send();
    });

    fastify.post('/clue', async (request, reply) => {
        const clue = request.body as Clue;
        await giveClue(clue);
        reply.code(204).send();
    });

    fastify.post('/game/nextRound/:gameId', async (request, reply) => {
        const {gameId} = request.params as { gameId: string };
        await nextRound(gameId)
        reply.code(204).send();
    });

    fastify.post('/game/:gameId/resolve', async (request, reply) => {
        const {gameId} = request.params as { gameId: string };
        const {playerId, word} = request.body as Clue;
        await resolve(gameId,playerId, word)
        reply.code(204).send();
    });

}