import { readableStreamFromReader as toStream } from "https://deno.land/std@0.119.0/streams/conversion.ts";

const server = Deno.listen({ port: 8080 });
console.log("Server started on port 8080");

for await (const conn of server) {
    serveHttp(conn);
}

async function serveHttp(conn: Deno.Conn) {
    const httpConn = Deno.serveHttp(conn);

    for await (const requestEvent of httpConn) {
        const fileStream = toStream(await Deno.open("index.html"));

        requestEvent.respondWith(
            new Response(fileStream, {
                status: 200,
            })
        );
    }
}
