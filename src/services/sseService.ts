import { FastifyReply } from 'fastify';
import {checkIfPlayerExists, getGame, removePlayer} from "./gameService";

const activePlayers: Record<string, FastifyReply> = {};

export function addPlayerSSE(reply: FastifyReply, gameId: string, playerId: string) {
    checkIfPlayerExists(gameId, playerId);
    activePlayers[playerId] = reply;


    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.setHeader('Access-Control-Allow-Origin', '*');
    reply.raw.flushHeaders();

    reply.raw.on('close', () => {
        delete activePlayers[playerId];
        removePlayer(gameId, playerId);
    });

    sendMsg(playerId, { msg: "welcome" });
}


export function sendMsg(playerId: string, message: {}) {
    const reply = activePlayers[playerId];
    if (reply && !reply.raw.writableEnded) {
        const formatted = `data: ${JSON.stringify(message)}\n\n`;
        reply.raw.write(formatted);
    }
}

export function sendMsgToAll(playersId: string[], message: {}) {
    playersId.forEach(playerId => {
        sendMsg(playerId, message);
    });
}

export function disconnect(playerId: string) {
    const reply = activePlayers[playerId];
    if (reply) {
        reply.raw.end();
        delete activePlayers[playerId];
        console.log(`Jugador ${playerId} desconectado manualmente`);
    } else {
        console.warn(`No se encontró la conexión activa para el jugador ${playerId}`);
    }
}

export function disconectAll(gameId: string) {
    const game = getGame(gameId);
    game.players.forEach(player => {
        disconnect(player.id);
    })
}
