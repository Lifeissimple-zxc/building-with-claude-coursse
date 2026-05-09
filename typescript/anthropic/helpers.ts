import { Message } from "@anthropic-ai/sdk/resources";

export function textFromMessage(msg: Message): string {
  return msg.content.
    filter(block => block.type === "text").
    map(block => block.text).
    join("\n")
}