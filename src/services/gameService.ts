import {createNewGame, Game, GameStatus} from "../models/game";
import {createPlayer} from "../models/player";
import fs from 'fs'
import path from 'path'
import {sendMsg, sendMsgToAll} from "./sseService";
import {HttpError} from "../errors/httpError";

const filePath = path.join(__dirname, '../../assets/animales.csv')
export const games: Record<string, Game> = {};
export const gamePossibleWords: Record<string, string[]> = {};

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
    sendMsgToAll(gameId, {msg: playerName});
    return createdPlayer;
}

export async function startGame(gameId: string) {
    const game = getGame(gameId);
    checkGameStatus(game, GameStatus.WAITING_FOR_PLAYERS)
    checkPlayerNumber(game);

    sendMsgToAll(gameId, {msg: "THE GAME STARTED"});
    games[gameId].activePlayerIndex = getRandomUniqueIndices(1, game.players.length)[0];
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
        generatePossibleWords(gameId)

        game.players.filter(p => p.id !== player.id).forEach(value => sendMsg(value, {msg: gamePossibleWords[gameId]}));
        sendMsg(player, {msg: 'Select a number from 1 to 5'});
        game.status = GameStatus.WAITING_FOR_NUMBER;
    }

}

export async function setWord(gameId: string, number: number) {
    const game = getGame(gameId);
    checkGameStatus(game, GameStatus.WAITING_FOR_NUMBER);
    checkPlayerNumber(game);

    game.currentWord = gamePossibleWords[gameId][number];
    const player = game.players[game.activePlayerIndex];
    game.players.filter(p => p.id !== player.id).forEach(value => sendMsg(value, {msg: game.currentWord}));
    game.status = GameStatus.WAITING_FOR_CLUES;
    sendMsg(player, {msg: 'A la espera de pistas...'});

}

function getRandomWordsFromCSV(filePath: string, count: number = 5): string[] {
    const content = fs.readFileSync(filePath, 'utf-8')
    const words = content
        .split('\n')
        .map(w => w.trim())

    const wordRandomIndexes = getRandomUniqueIndices(5, words.length)

    return wordRandomIndexes.map(index => words[index].trim())
}

function getRandomUniqueIndices(n: number, max: number): number[] {
    if (n > max) {
        throw new Error('No se pueden generar más valores únicos que el rango disponible')
    }

    const indices: number[] = []
    const used = new Set<number>()

    while (indices.length < n) {
        const rand = Math.floor(Math.random() * max)
        if (!used.has(rand)) {
            used.add(rand)
            indices.push(rand)
        }
    }

    return indices
}

function generatePossibleWords(gameId:string){
    gamePossibleWords[gameId] = getRandomWordsFromCSV(filePath);
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


