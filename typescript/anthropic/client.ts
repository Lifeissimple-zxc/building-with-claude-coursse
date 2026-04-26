import { Anthropic } from "@anthropic-ai/sdk"
import type {
  MessageParam,
  MessageCreateParamsNonStreaming,
} from "@anthropic-ai/sdk/resources"

enum Role {
  User = "user",
  Assistant = "assistant"
}

export interface ChatParams {
  model?: string
  maxTokens?: number
  temperature?: number
  systemPrompt?: string
}

export class ClientWithMessageHistory {
  client: Anthropic
  messageHistory: MessageParam[]
  maxTokens: number
  model: string
  systemPrompt?: string

  constructor(client: Anthropic, model: string, maxTokens: number) {
    this.client = client
    this.messageHistory = []
    this.model = model
    this.maxTokens = maxTokens
  }

  addUserMessage(content: string) {
    this.messageHistory.push({ role: Role.User, content: content})
  }

  addAssistantMessage(content: string) {
    this.messageHistory.push({ role: Role.Assistant, content: content})
  }

  buildBody(params?: ChatParams): MessageCreateParamsNonStreaming {
    const body: MessageCreateParamsNonStreaming = {
      model: params?.model ?? this.model,
      max_tokens: params?.maxTokens ?? this.maxTokens,
      messages: this.messageHistory,
    }

    const systemPrompt = params?.systemPrompt ?? this.systemPrompt
    if (systemPrompt) body.system = systemPrompt

    if (params?.temperature !== undefined) body.temperature = params.temperature

    return body
  }

  async chat(message: string, params?: ChatParams): Promise<string> {
    this.addUserMessage(message)

    const body = this.buildBody(params)

    const resp = await this.client.messages.create(body)

    const content = resp.content[0]
    if (content.type !== 'text') {
      throw `expected text message type, got: ${content.type}`
    }
    this.addAssistantMessage(content.text)
    return content.text
  }

  async stream(message: string, params?: ChatParams): Promise<string> {
    this.addUserMessage(message)

    const body = this.buildBody(params)

    const stream = await this.client.messages.stream(body)
    stream.on("text", (delta) => process.stdout.write(delta))  

    const finalMessage = await stream.finalMessage()
    const content = finalMessage.content[0]
    if (content.type !== 'text') {
      throw `expected text message type, got: ${content.type}`
    }
    this.addAssistantMessage(content.text)
    return content.text
  }
}