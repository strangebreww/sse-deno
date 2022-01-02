import { Application } from "https://deno.land/x/oak@v10.1.0/mod.ts";
import { readableStreamFromReader } from "https://deno.land/std@0.119.0/streams/conversion.ts";

const app = new Application();

app.use(async ctx => {
    const fileStream = readableStreamFromReader(await Deno.open("index.html"));

    ctx.response.headers.set('Content-Type', 'text/html');
    ctx.response.body = fileStream;
});

console.log("Server started on port 8080");
await app.listen({ port: 8080 });
