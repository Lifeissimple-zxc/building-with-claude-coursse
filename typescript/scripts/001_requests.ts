import { Anthropic } from "@anthropic-ai/sdk"




const client = new Anthropic()

const msgOne = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1000,
  messages: [
    {
      role: "user",
      content: "What is looksmaxxxing? Answer in 1 sentence please" 
    }
  ]
})
if (msgOne.content[0].type === "text") {                                                                       
  console.log(msgOne.content[0].text)
}

const msgTwo = await client.messages.create({
  model: "claude-sonnet-4-6",
  max_tokens: 1000,
  messages: [
    {
      role: "user",
      content: "Generate another sentence" 
    }
  ]
})
if (msgTwo.content[0].type === "text") {                                                                       
  console.log(msgTwo.content[0].text)
}

  


