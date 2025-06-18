import {createNewGame, Game, GameStatus} from "../models/game";
import {createPlayer} from "../models/player";
import {sendMsg, sendMsgToAll} from "./sseService";
import {HttpError} from "../errors/httpError";
import {getRandomWords} from "./wordsService";

const games: Record<string, Game> = {};

export function getGame(gameId: string) {
    if (!games[gameId.trim()]) {
        throw new HttpError(400, 'Invalid game ID or game doesnt exist.');
    }
    return games[gameId]
}

export function checkPlayerName(playerName: string) {
    if (playerName.trim().length === 0) {
        throw new HttpError(400, 'Invalid username name.');
    }
}

export function checkPlayerNumber(game: Game) {
    if (game.players.length < 2){
        throw new HttpError(409, "There are no players playing in the game");
    }
}

export function checkGameStatus(game: Game, requiredStatus: GameStatus) {
    if (game.status !== requiredStatus) {
        throw new HttpError(409, `Game status is not: ${requiredStatus}`);
    }
}

export function checkIfPlayerExists(gameId: string, playerId: string) {
    const game = getGame(gameId);
    if (game.players.find(value => value.id === playerId) === null) {
        throw new HttpError(409, `Player doesnt exist on game: ${game.id}`);
    }
}

export async function createGame(playerName: string): Promise<Game> {
    checkPlayerName(playerName);
    const newGame: Game = createNewGame(playerName);
    games[newGame.id] = newGame;
    return newGame;
}

export async function joinGame(gameId: string, playerName: string) {
    const game = getGame(gameId);
    checkPlayerName(playerName);
    checkGameStatus(game, GameStatus.WAITING_FOR_PLAYERS)

    const createdPlayer = createPlayer(playerName)
    games[gameId].players.push(createdPlayer);

    const playerIdList = game.players.map(value => {
        return value.id
    });
    sendMsgToAll(playerIdList, {msg: playerName});
    return createdPlayer;
}

export async function startGame(gameId: string) {
    const game = getGame(gameId);
    checkGameStatus(game, GameStatus.WAITING_FOR_PLAYERS)
    checkPlayerNumber(game);

    const playerIdList = game.players.map(value => {
        return value.id
    });
    sendMsgToAll(playerIdList, {msg: "THE GAME STARTED"});
    games[gameId].activePlayerIndex = Math.floor(Math.random() * game.players.length);
    await nextRound(gameId)
}

export async function nextRound(gameId: string) {
    const game = getGame(gameId);
    checkGameStatus(game, GameStatus.WAITING_FOR_PLAYERS)
    checkPlayerNumber(game);

    const nextGamePlayerIndex = (games[gameId].activePlayerIndex + 1) % game.players.length;
    games[gameId].activePlayerIndex = nextGamePlayerIndex
    game.clues = []
    let player = game.players.at(nextGamePlayerIndex);
    if (player) {
        game.candidateWords = getRandomWords();

        game.players.filter(p => p.id !== player.id).forEach(value => sendMsg(value.id, {msg: game.candidateWords}));
        sendMsg(player.id, {msg: 'Select a number from 1 to 5'});
        game.status = GameStatus.WAITING_FOR_NUMBER;
    }

}

export async function setWord(gameId: string, number: number) {
    const game = getGame(gameId);
    checkGameStatus(game, GameStatus.WAITING_FOR_NUMBER);
    checkPlayerNumber(game);

    game.currentWord = game.candidateWords[number];
    const player = game.players[game.activePlayerIndex];
    game.players.filter(p => p.id !== player.id).forEach(value => sendMsg(value.id, {msg: game.currentWord}));
    game.status = GameStatus.WAITING_FOR_CLUES;
    sendMsg(player.id, {msg: 'A la espera de pistas...'});

}

export function removePlayer(gameId: string, playerId: string) {
    const game = getGame(gameId);
    checkGameStatus(game, GameStatus.WAITING_FOR_PLAYERS);

    game.players.filter(value => value.id !== playerId);
    if (game.players.length === 1) {
        delete games[gameId];
    }
    console.log(`Jugador ${playerId} desconectado de la partida ${gameId}`);
}

// export async function stopGame(gameId: string) {
//     if (games[gameId]) {
//
//         games[gameId].players.forEach(player => {
//             sendMsg(player, {msg: "THE GAME FINISHED"});
//         })
//         delete games[gameId];
//     }
// }


