import {sendMsgToAll} from "../utils/sse";
import {canBePlayable, games} from "./gameService";
import {Clue} from "../models/clue";
import {GameStatus} from "../models/game";
import {HttpError} from "../errors/httpError";


export async function giveClue(clue: Clue): Promise<void> {
    const game = games[clue.gameId];
    if (canBePlayable(game.id, GameStatus.WAITING_FOR_CLUES)) {
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
            game.status = GameStatus.WAITING_TO_BE_RESOLVED;
        }
    }
}

export async function resolve(gameId: string, playerId: string, solution: string){
    const game = games[gameId];
    const activePlayer = game.players[game.activePlayerIndex];
    if (canBePlayable(gameId, GameStatus.WAITING_TO_BE_RESOLVED) && activePlayer.id === playerId) {
        solution = solution.trim()

        if (normalize(game.currentWord) === normalize(solution)) {
            sendMsgToAll(game.id, {msg: "YESSSSSSSSSS"})
            game.status = GameStatus.WAITING_FOR_PLAYERS;
        } else{
            sendMsgToAll(game.id, {msg: "NOOOOOOOOOOO, cagó. Try again"})
        }
    }else{
        throw new HttpError(400, "You are not the active player.");
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

    const result: string[] = [];

    for (const [_, group] of normalizedMap.entries()) {
        if (group.length === 1) {
            result.push(group[0]);
        }
    }

    return result;
}