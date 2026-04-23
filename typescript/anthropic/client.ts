import { Anthropic } from "@anthropic-ai/sdk"
import type { MessageParam, MessageCreateParamsNonStreaming } from "@anthropic-ai/sdk/resources"

enum Role {
  User = "user",
  Assistant = "assistant"
}

export interface ChatParams {
  model: string
  maxTokens: number
  temperature?: number
  systemPrompt?: string
}

export class ClientWithMessageHistory {
  client: Anthropic
  messageHistory: MessageParam[]
  systemPrompt?: string

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
    this.addUserMessage(message)
    const body: MessageCreateParamsNonStreaming = {
      model: params.model,
      max_tokens: params.maxTokens,
      messages: this.messageHistory
    }
    if (this.systemPrompt?.length !== 0) {
      body.system = this.systemPrompt
    }

    const resp = await this.client.messages.create(body)

    const content = resp.content[0]
    if (content.type !== 'text') {
      throw `expected text message type, got: ${content.type}`
    }
    this.addAssistantMessage(content.text)
    return content.text
  }
}