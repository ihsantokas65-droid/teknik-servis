export function GET() {
  return new Response("Gone", {
    status: 410,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

export function HEAD() {
  return new Response(null, {
    status: 410,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
