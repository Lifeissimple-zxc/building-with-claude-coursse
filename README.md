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