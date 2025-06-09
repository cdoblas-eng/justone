import {v4 as uuidv4} from "uuid";
import {Clue} from "./clue";
import {GameStatus} from "./game";
import {nanoid} from "nanoid";

export interface Player {
    id: string;
    name: string;
    host: boolean;
}

// Función que genera un nuevo juego con UUID único cada vez
export function createPlayer(playerName: string, userHost?: boolean): Player {
    return {
        id: nanoid(), // Se genera al momento de llamar la función
        name: playerName,
        host: userHost ?? false
    };
}