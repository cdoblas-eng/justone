import {createPlayer, Player} from "./player";
import {Clue} from "./clue";
import {customAlphabet} from 'nanoid';


export enum GameStatus {
    WAITING_FOR_PLAYERS = 'waiting_for_players',
    IN_PROGRESS = 'in_progress',
    FINISHED = 'finished',
}

export interface Game {
    id: string;
    players: Player[];
    status: GameStatus;
    clues?: Clue[];
    currentWord?: string;
    round: number;
}

// Función que genera un nuevo juego con UUID único cada vez
export function createNewGame(playerName: string): Game {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const generateGameId = customAlphabet(alphabet, 6);
    return {
        id: generateGameId(), // Se genera al momento de llamar la función
        status: GameStatus.WAITING_FOR_PLAYERS,
        players: [createPlayer(playerName, true)],
        clues: [],
        round: 0
    };
}
