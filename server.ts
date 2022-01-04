import { Application, Router, ServerSentEvent } from "https://deno.land/x/oak@v10.1.0/mod.ts";
import { readableStreamFromReader } from "https://deno.land/std@0.119.0/streams/conversion.ts";

const app = new Application();
const router = new Router();

let data: string | undefined;

router.get("/stream", (ctx) => {
    const target = ctx.sendEvents();
    
    let id = 0;
    
    const timer = setInterval(() => {
		if (data !== undefined && data !== "") {
			target.dispatchEvent(new ServerSentEvent("message", data, { id: ++id }));
		}
	}, 1000);

	setTimeout(async () => {
		clearInterval(timer);
	    target.dispatchEvent(new ServerSentEvent("end-of-stream", "this is the end"));
        await target.close();
	}, 10000);
});

router.get("/send-message", async (ctx) => {
    const url = new URL(ctx.request.url.href);
    const message = url.searchParams.get("message");
    
    if (message === null) {
        return;
    }
    
    const target = ctx.sendEvents();
    
    data = message;

    target.dispatchMessage(data);
    
    await target.close();
});

router.get("/", async (ctx) => {
    const fileStream = readableStreamFromReader(await Deno.open("index.html"));

    ctx.response.headers.set('Content-Type', 'text/html');
    ctx.response.body = fileStream;
});

console.log("Server started on port 8080");

app.use(router.routes());
await app.listen({ port: 8080 });
