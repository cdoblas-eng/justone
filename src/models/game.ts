import {createPlayer, Player} from "./player";
import {Clue} from "./clue";
import {customAlphabet} from 'nanoid';


export enum GameStatus {
    WAITING_FOR_PLAYERS = 'waiting_for_players',
    STARTED = 'started',
    WAITING_FOR_NUMBER = 'waiting_for_number',
    WAITING_FOR_CLUES = 'waiting_for_clues',
    WAITING_TO_BE_RESOLVED = 'waiting_for_resolution',
}

export interface Game {
    id: string;
    players: Player[];
    status: GameStatus;
    clues: Clue[];
    currentWord: string;
    round: number;
    activePlayerIndex: number;
}

export function createNewGame(playerName: string): Game {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const generateGameId = customAlphabet(alphabet, 6);
    return {
        id: generateGameId(),
        status: GameStatus.WAITING_FOR_PLAYERS,
        players: [createPlayer(playerName, true)],
        clues: [],
        currentWord: '',
        round: 0,
        activePlayerIndex: -1,
    };
}
