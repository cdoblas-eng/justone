import fs from "fs";
import path from "path";

const filePath = path.join(__dirname, '../../assets/animales.csv')

export function getRandomWords(count: number = 5): string[] {
    return getRandomWordsFromCSV(filePath);
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

