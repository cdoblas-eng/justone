import {nanoid} from "nanoid";

export interface Player {
    id: string;
    name: string;
    host: boolean;
}

export function createPlayer(playerName: string, userHost?: boolean): Player {
    return {
        id: nanoid(),
        name: playerName,
        host: userHost ?? false,
    };
}