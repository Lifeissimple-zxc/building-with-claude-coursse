import { Anthropic } from "@anthropic-ai/sdk"
import type { MessageParam } from "@anthropic-ai/sdk/resources"

enum Role {
  User = "user",
  Assistant = "assistant"
}

export interface ChatParams {
  model: string
  maxTokens: number
}

export class ClientWithMessageHistory {
  client: Anthropic
  model: string
  maxTokens: number
  messageHistory: MessageParam[]

  constructor(client: Anthropic) {
    this.client = client
    this.messageHistory = []
  }

  addUserMessage(content: string) {
    this.messageHistory.push({ role: Role.User, content: content})
  }

  addAssistantMessage(content: string) {
    this.messageHistory.push({ role: Role.Assistant, content: content})
  }

  async chat(message: string, params: ChatParams): Promise<string> {
    const resp = await this.client.messages.create({
      model: params.model,
      max_tokens: params.maxTokens,
      messages: [...this.messageHistory, {role: Role.User, content: message}]
    })

    const content = resp.content[0]
    if (content.type !== 'text') {
      throw `expected text message type, got: ${content.type}`
    }
    return content.text
  }
}