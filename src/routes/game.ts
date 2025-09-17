import {FastifyInstance} from 'fastify';
import {createGame, getGame, joinGame, nextRound, setWord, startGame} from '../services/gameService'
import {Player} from "../models/player";
import {Clue} from "../models/clue";
import {giveClue, resolve} from "../services/playerService";

export default async function (fastify: FastifyInstance) {
    fastify.post('/games', async (request, reply) => {
        const {playerName} = request.body as { playerName: string };
        const game = await createGame(playerName);
        reply.code(201).send({gameId: game.id, playerId: game.players[0].id});
    });

    fastify.post('/games/:gameId/join', async (request, reply) => {
        const {playerName} = request.body as { playerName: string, gameId: string };
        const {gameId} = request.params as { gameId: string };
        let player: Player;
        player = await joinGame(gameId, playerName)
        const game = getGame(gameId)
        reply.code(201).send({playerId: player.id, players: game.players});
    });

    fastify.put('/games/:gameId/start', async (request, reply) => {
        const {gameId} = request.params as { gameId: string };
        await startGame(gameId)
        reply.code(204).send();
    });

    fastify.post('/games/:gameId/select-number/:number', async (request, reply) => {
        const {gameId} = request.params as { gameId: string };
        const {number} = request.params as { number: string };
        await setWord(gameId, Number(number))
        reply.code(204).send();
    });

    fastify.post('/clues', async (request, reply) => {
        const clue = request.body as Clue;
        await giveClue(clue);
        reply.code(204).send();
    });

    fastify.post('/games/:gameId/next-round', async (request, reply) => {
        const {gameId} = request.params as { gameId: string };
        await nextRound(gameId)
        reply.code(204).send();
    });

    fastify.post('/games/:gameId/guess', async (request, reply) => {
        const {gameId} = request.params as { gameId: string };
        const {playerId, word} = request.body as Clue;
        await resolve(gameId, playerId, word);
        reply.code(204).send();
    });

    // End game (host only)
    fastify.delete('/games/:gameId', async (request, reply) => {
        const { gameId } = request.params as { gameId: string };
        // TODO: Implement end game logic
        // await endGame(gameId);
        reply.code(204).send();
    });

    // Remove player from game (host only)
    fastify.delete('/games/:gameId/players/:playerId', async (request, reply) => {
        const { gameId, playerId } = request.params as { gameId: string; playerId: string };
        // TODO: Implement remove player logic
        // await removePlayer(gameId, playerId);
        reply.code(204).send();
    });
}