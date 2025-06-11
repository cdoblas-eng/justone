import {createNewGame, Game, GameStatus} from "../models/game";
import {createPlayer} from "../models/player";
import {broadcast} from "../utils/sse";

export const games: Record<string, Game> = {};

export async function createGame(playerName: string): Promise<Game> {
    const newGame: Game = createNewGame(playerName);
    games[newGame.id] = newGame;
    return newGame;
}

export async function joinGame(gameId: string, playerName: string) {
    games[gameId].players.push(createPlayer(playerName));
}


export async function startGame(gameId: string) {
    if (games[gameId]) {
        games[gameId].status = GameStatus.IN_PROGRESS
        broadcast("start");
    }
    
}