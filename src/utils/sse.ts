import {FastifyReply} from 'fastify'
import {games} from "../services/gameService";
import {Player} from "../models/player";

let addedPlayer: Player;

export function addPlayerSSE(reply: FastifyReply, gameId: string, playerId: string) {
    games[gameId].players.map(player => {
        // player.reply = playerId == player.id ? reply : player.reply;
        if (playerId == player.id) {
            player.reply = reply;
            addedPlayer = player;
        }
        return player;
    })

    // Configurar cabeceras SSE
    reply
        .raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
    })

    // Enviar evento de bienvenida
    reply.raw.write({msg: "welcolme"})

    //Remove player
    reply.raw.on('close', () => {
        games[gameId].players = games[gameId].players.filter(player => player.id !== playerId)
        //Enviar mensaje de que un jugador a salido de la sala
    })
}

export function sendMsg(player: Player, message: {}) {
    if (player.reply)
        player.reply.raw.write(message)
}
