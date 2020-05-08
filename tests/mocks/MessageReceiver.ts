import Bot from "../../src/core/Bot";

export function awaitResponse(client: Bot) {
  return new Promise((resolve) => {
    client.on("message", resolve);
  });
}
