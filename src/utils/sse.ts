import { FastifyReply } from 'fastify';
import { games } from "../services/gameService";
import { Player } from "../models/player";

let addedPlayer: Player;
const activePlayers: Record<string, FastifyReply> = {};


export function addPlayerSSE(reply: FastifyReply, gameId: string, playerId: string) {
    const game = games[gameId];
    if (!game) {
        reply.status(404).send({ error: "Game not found" });
        return;
    }

    game.players = game.players.map(player => {
        if (player.id === playerId) {
            activePlayers[player.id] = reply;
            addedPlayer = player;
        }
        return player;
    });

    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.setHeader('Access-Control-Allow-Origin', '*');
    reply.raw.flushHeaders();

    reply.raw.on('close', () => {

        delete activePlayers[playerId];
        console.log(`Jugador ${playerId} desconectado de la partida ${gameId}`);
        if (games[gameId].players.length === 1) {
            delete games[gameId];
        }
    });

    sendMsg(addedPlayer, { msg: "welcome" });
}


export function sendMsg(player: Player, message: {}) {
    const reply = activePlayers[player.id];
    if (reply && !reply.raw.writableEnded) {
        const formatted = `data: ${JSON.stringify(message)}\n\n`;
        reply.raw.write(formatted);
    }
}


export function sendMsgToAll(gameId: string, message: {}) {
    const game = games[gameId];
    if (!game) return;

    game.players.forEach(player => {
        sendMsg(player, message);
    });
}
