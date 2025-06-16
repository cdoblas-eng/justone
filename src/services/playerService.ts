import {sendMsg, sendMsgToAll} from "../utils/sse";
import {gamePossibleWords, games} from "./gameService";
import {Clue} from "../models/clue";


export async function giveClue(clue: Clue): Promise<void> {

    const game = games[clue.gameId];
    if (game) {
        //Si el jugador ha dado ya una pista

        if (game.clues.filter(c => c.playerId === clue.playerId).length > 0) {
            return
        }
        //Se escapan
        clue.word = clue.word.trim()
        //Se introduce pista
        game.clues.push(clue)

        if (game.clues.length !== game.players.length - 1) {
            sendMsgToAll(game.id, {msg: `Ha llegado una pista, quedan ${(game.players.length - 1) - game.clues.length}`});
        }else{ // CUANDO TODOS LOS JUGADORES HAN MANDADO LAS PITAS SE PROCESAN
            sendMsgToAll(game.id, {msg: `PISTAS: ${removeAllSimilarWords(game.clues.map(value => value.word))}`});
        }
    }
}


function normalize(word: string): string {
    return word
        .toLowerCase()
        .normalize("NFD")                // eliminar tildes
        .replace(/[\u0300-\u036f]/g, "") // eliminar diacríticos
        .replace(/(es|s)$/, "");         // eliminar plurales comunes
}

export function removeAllSimilarWords(words: string[]): string[] {
    const normalizedMap = new Map<string, string[]>();

    for (const word of words) {
        const normalized = normalize(word);
        if (!normalizedMap.has(normalized)) {
            normalizedMap.set(normalized, []);
        }
        normalizedMap.get(normalized)!.push(word);
    }

    // Solo mantener palabras que no tienen duplicados similares
    const result: string[] = [];

    for (const [_, group] of normalizedMap.entries()) {
        if (group.length === 1) {
            result.push(group[0]);
        }
        // si hay más de 1 palabra similar, las eliminamos todas
    }

    return result;
}