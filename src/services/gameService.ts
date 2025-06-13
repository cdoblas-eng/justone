import {createNewGame, Game, GameStatus} from "../models/game";
import {createPlayer} from "../models/player";
import fs from 'fs'
import path from 'path'
import {sendMsg} from "../utils/sse";
// Ejemplo de uso
const filePath = path.join(__dirname, '../../assets/animales.csv')
export const games: Record<string, Game> = {};

export async function createGame(playerName: string): Promise<Game> {
    const newGame: Game = createNewGame(playerName);
    games[newGame.id] = newGame;
    return newGame;
}

export async function joinGame(gameId: string, playerName: string) {
    const createdPlayer = createPlayer(playerName)
    games[gameId].players.push(createdPlayer);
    return createdPlayer;
}


export async function startGame(gameId: string) {
    if (games[gameId]) {
        games[gameId].status = GameStatus.IN_PROGRESS
        games[gameId].players.forEach(player => {
            sendMsg(player, {msg: "THE GAME STARTED"});
        })
    }
}

export async function stopGame(gameId: string) {
    if (games[gameId]) {
        games[gameId].players.forEach((player) => {
        })
        games[gameId].players.forEach(player => {
            sendMsg(player, {msg: "THE GAME FINISHED"});
        })
        delete games[gameId];
    }
}

function getRandomWordsFromCSV(filePath: string, count: number): string[] {
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

console.log(getRandomWordsFromCSV(filePath, 5))

