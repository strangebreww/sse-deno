# sse-deno

Deno server-sent events demo.

Run with

`deno run --allow-net --allow-read server.ts`.

Data can be sent with

`curl -X GET "http://localhost:8080/send-message?message=Hello"`.
