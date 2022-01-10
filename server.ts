import { Application, Context, ServerSentEvent } from "https://deno.land/x/oak@v10.1.0/mod.ts";
import { EventEmitter } from "https://deno.land/x/event_emitter@1.0.0/mod.ts";
import { readableStreamFromReader } from "https://deno.land/std@0.119.0/streams/conversion.ts";

interface ConnectionEvents {
	data: (data: Record<string, unknown>) => void;
}

let streamCount = 0;

class SSE extends EventEmitter<ConnectionEvents> {
	constructor() {
		super();
	}

	init(ctx: Context) {
		const target  = ctx.sendEvents();

		let id = 0;

		const dataListener = (data: Record<string, unknown>) => {
			const event = data.event && typeof data.event === "string" ? data.event : "message";
			
			target.dispatchEvent(new ServerSentEvent(event, data.data, { id: ++id }));
		}

		this.on("data", dataListener);

		target.addEventListener("close", () => {
			this.off("data", dataListener);

			--streamCount;
			
			console.log("Stream closed");
		});

		console.log(`Stream ${++streamCount} created`);
	}

	send(data: Record<string, unknown>) {
		this.emit("data", data);
	}
}

const app = new Application();
const sse = new SSE();

app.use(async (ctx, next) => {
	if (ctx.request.url.pathname === "/stream") {
		sse.init(ctx);

		return;
	}

	if (ctx.request.url.pathname === "/send-message") {
		const url = new URL(ctx.request.url.href);
		const message = url.searchParams.get("message");
		
		if (message === null) {
			return;
		}
		
		sse.send({ data: message });

		return;
	}

	await next();
});
  

app.use(async (ctx) => {
	const fileStream = readableStreamFromReader(await Deno.open("index.html"));

    ctx.response.headers.set('Content-Type', 'text/html');
    ctx.response.body = fileStream;
});

console.log("Server started on port 8080");

await app.listen({ port: 8080 });
