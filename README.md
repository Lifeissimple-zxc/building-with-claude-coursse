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

We can control it by prepending an assitant message and adding stop sequences. Assistant 