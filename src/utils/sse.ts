import { FastifyReply } from 'fastify'

type Client = {
    id: number
    reply: FastifyReply
}

let clients: Client[] = []
let clientIdCounter = 0

export function addClient(reply: FastifyReply) {
    const id = clientIdCounter++
    const client = { id, reply }

    clients.push(client)

    // Configurar cabeceras SSE
    reply
        .raw.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
    })

    // Enviar evento de bienvenida
    reply.raw.write(`data: Bienvenido cliente ${id}\n\n`)

    reply.raw.on('close', () => {
        clients = clients.filter(c => c.id !== id)
    })
}

export function broadcast(message: string) {
    for (const client of clients) {
        client.reply.raw.write({data: "Broadcast", msg: message})
    }
}
