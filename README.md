# Building With Claude

## Learnings

### System Prompts
System prompts customize the model's tone and style of response. This is where people typically give persona to the model.

### Temperature (deprecated in claude it looks like)
Low -> more deterministic output. Facts, coding, data extraction.
High -> more variadic output. All the creative business.
Deprecated in Opus 4.6.

### Structured data
Asking a model to generate JSON is tricky because it wraps what we actually need (ie a JSON string) with bloat describing it or formatting it markdown:

For example, a simple structured message like
```
{
  "id": 1,
  "name": "user1"
}
```

Becomes
```
\`\`\`json
{
  "id": 1,
  "name": "user1"
}
```

We can control it by prepending an assitant message and adding stop sequences. A modern alternative is to add the format requirement to both the user message and the system prompt.

### Evals
A prompt eval is a function that assigns a score to an output given its input. It can be:
- code
- model
- human

### Prompting
#### Clear and Direct
First two lines of the prompt are the most important. Start with a verb. Examples:
- Write three...
- Identify the latest ....
- Locate ...
- Design ...

#### Being Specific
Every prompt needs to have guidelines. These can either be qualities that the output has to have OR steps for the model to follow. More often than not the two are combined.

#### XML tags
Good when we pass a lot of context inside it. Tags are delimiters for Claude. They help the model understand the semantics of the info inside of the tags.

#### Examples (one and multi shot prompting)
Acc to the course, it's the most effective technique. When giving examples, it's smart to provide both regular and corner cases. In addition, it's useful to provide reasoning explaining WHAT makes and ideal example ideal.


### Tools
Tool functions are plain functions that will be executed when Claude decides it needs some extra info to help the user. Best practices:
- Well-named (haha) and descriptive args.
- Inputs need to be validated and valiation failures need to nave explicit messages.
- The error messages need to enable Claude to reason about the needed changes to make the call succeed.

#### Tool Schemas
A tool schema is a JSON describing the information required to invoke a tool. The most important fields are:
- name: tool name
- description: description of the tool (when to use it, what it returns, etc 3-4 sentences long)
- input_schema: argument description, can be kinda nested
- required: mandatory arguments
- Claude and LLMs are pretty good at generating tool schema descriptions from the provided code.
- Tools are run on server, we basically serve requests from claude to run them