import { FastifyReply } from 'fastify';
import { games } from "../services/gameService";
import { Player } from "../models/player";

let addedPlayer: Player;
const activePlayers: Record<string, FastifyReply> = {};

/**
 * Establece una conexión SSE para un jugador dentro de una partida.
 */
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

    // Cabeceras SSE
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');
    reply.raw.setHeader('Access-Control-Allow-Origin', '*');
    // reply.raw.flushHeaders();

    // Manejar desconexión
    reply.raw.on('close', () => {
        console.log(`Jugador ${playerId} desconectado de la partida ${gameId}`);
        games[gameId].players = games[gameId].players.filter(player => player.id !== playerId);
        // Aquí puedes notificar al resto de jugadores si quieres
    });


    // Enviar mensaje inicial
    sendMsg(addedPlayer, { msg: "welcome" });
}

/**
 * Envía un mensaje SSE a un jugador.
 */
export function sendMsg(player: Player, message: {}) {
    const reply = activePlayers[player.id];
    if (reply && !reply.raw.writableEnded) {
        const formatted = `data: ${JSON.stringify(message)}\n\n`;
        reply.raw.write(formatted);
    }
}

/**
 * Envía un mensaje SSE a todos los jugadores de una partida.
 */
export function sendMsgToAll(gameId: string, message: {}) {
    const game = games[gameId];
    if (!game) return;

    game.players.forEach(player => {
        sendMsg(player, message);
    });
}
