import {FastifyInstance} from 'fastify';
import {createGame, games, joinGame, nextRound, setWord, startGame} from '../services/gameService'
import {Player} from "../models/player";
import {sendMsgToAll} from "../utils/sse";
import {Clue} from "../models/clue";
import {giveClue} from "../services/playerService";

let contador = 0;

export default async function (fastify: FastifyInstance) {
    fastify.post('/game/create', async (request, reply) => {
        const {playerName} = request.body as { playerName: string };
        const game = await createGame(playerName);
        reply.code(201).send({gameId: game.id, playerId: game.players[0].id});
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
        startGame(gameId)
        reply.code(202).send();
    });

    fastify.post('/game/:gameId/giveNumber/:number', async (request, reply) => {
        const {gameId} = request.params as { gameId: string };
        const {number} = request.params as { number: string };
        await setWord(gameId, Number(number))
        reply.code(204).send();
    });

    fastify.post('/clue', async (request, reply) => {
        const clue = request.body as Clue;
        giveClue(clue);
        reply.code(204).send();
    });

    // fastify.post('/game/:gameId/resolve', async (request, reply) => {
    //     const {gameId} = request.params as { gameId: string };
    //     const {playerId, word} = request.body as Clue;
    //     await setWord(gameId, Number(number))
    //     reply.code(204).send();
    // });

    fastify.post('/game/nextRound/:gameId', async (request, reply) => {
        const {gameId} = request.params as { gameId: string };
        await nextRound(gameId)

        reply.code(204).send();
    });

    fastify.get('/debug/game', async (request, reply) => {
        const {gameId} = request.query as { gameId: string };
        console.log(gameId);
        sendMsgToAll(gameId, {msg: "MENSAJE " + contador});
        contador++;
        reply.code(200).send();
    });
}