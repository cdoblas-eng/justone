import {Game, createNewGame} from "../models/game";
import {createPlayer} from "../models/player";

export const games: Record<string, Game> = {};

export async function createGame(playerName: string): Promise<Game> {
    const newGame: Game = createNewGame(playerName);
    games[newGame.id] = newGame;
    return newGame;
}

export async function joinGame(gameId: string, playerName: string) {
    games[gameId].players.push(createPlayer(playerName));
}