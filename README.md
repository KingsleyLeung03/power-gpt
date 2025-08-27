# PowerGPT — Empower your LLMs with MCPs ⚡️

Kingsley Leung (Zihong Liang)  

A small, focused remote MCP (Model Context Protocol) server deployed on Cloudflare Workers that exposes customised tools to remote MCP clients.

## Why this project exists 💡

- Large language models still struggle with basic arithmetic and numeric reasoning. Short, viral examples like the "9.11 vs 9.9, which is bigger" question highlighted how easily models can make simple mistakes (see this article for one viral example: https://towardsdatascience.com/9-11-or-9-9-which-one-is-higher-6efbdbd6a025/). This project provides reliable, auditable tools (for example, calculators) that can be plugged into LLM workflows via MCP so clients can delegate numeric tasks to a deterministic service.
- I also noticed some locally hosted LLMs may not have internet access. To address this, the server includes an MCP tool that extracts and returns text from a URL. That lets offline or restricted models access web content via the MCP while centralising fetching and sanitisation, which improves security and auditability.

## Live deployment 🚀

- Example deployed URL: `https://power-gpt.kingsleyleung2003.workers.dev/mcp`

## Available tools 🧰

Below are the MCP tools currently exposed by this server. Each tool lists its purpose and the input parameters it expects.

- 🔢 calculate_add — Simple addition
  - Inputs: `a: number`, `b: number`
- ➖ calculate_subtract — Simple subtraction
  - Inputs: `a: number`, `b: number`
- ✖️ calculate_multiply — Simple multiplication
  - Inputs: `a: number`, `b: number`
- ➗ calculate_divide — Simple division (returns an error if dividing by zero)
  - Inputs: `a: number`, `b: number`
- ^ calculate_exponent — Exponentiation (base \*\* exponent)
  - Inputs: `base: number`, `exponent: number`
- √ calculate_root — Extract the n-th root of a number (error if `root === 0`)
  - Inputs: `number: number`, `root: number`
- % calculate_modulus — Modulus (a % b; error if divisor is zero)
  - Inputs: `a: number`, `b: number`
- ! calculate_factorial — Factorial of a non-negative integer (errors on negative/non-integer)
  - Inputs: `n: number`
- 🔁 calculate_fibonacci — Fibonacci number at a 0-indexed position (errors on negative/non-integer)
  - Inputs: `position: number`
- 🔎 check_prime — Primality check (errors for <= 1 or non-integer)
  - Inputs: `n: number`
- 🧮 calculate_gcd — Greatest common divisor (integers required)
  - Inputs: `a: number`, `b: number`
- 🔗 calculate_lcm — Least common multiple (integers required)
  - Inputs: `a: number`, `b: number`
- ⚖️ compare_numbers — Compare two numbers (less than / greater than / equal)
  - Inputs: `a: number`, `b: number`
- 🎲 random_number — Generate a random number within a range (uses drand with Math.random fallback)
  - Inputs: `startRange: number`, `endRange: number`
- 🌐 fetch_url — Fetch a URL and extract readable content (returns title + markdown). Handles HTTP errors and parsing failures.
  - Inputs: `url: string` (must be a valid URL)

## Get started ▶️

### Connect from Cloudflare AI Playground

1. Open https://playground.ai.cloudflare.com/
2. Enter the MCP server SSE/endpoint URL: `https://power-gpt.kingsleyleung2003.workers.dev/mcp`
3. Use the tools from the playground UI.

### Connect Claude Desktop (or other local MCP clients)

- **Prerequisites**
  - **Bun** - [Download](https://bun.sh/)
  - **Claude Desktop** - [Download](https://claude.ai/desktop)

- Follow [Anthropic's Quickstart](https://modelcontextprotocol.io/quickstart/user)
- In Claude Desktop go to Settings > Developer > Edit Config
- Update with this configuration:

```json
{
  "mcpServers": {
    "PowerGPT by Kingsley": {
      "command": "bun x",
      "args": [
        "mcp-remote",
        "https://power-gpt.kingsleyleung2003.workers.dev/mcp"
      ]
    }
  }
}
```

## Tech stack 🛠️

- TypeScript
- Bun
- Cloudflare Workers (serverless runtime)
- Wrangler (Cloudflare CLI) / Cloudflare dashboard for deployment
- Model Context Protocol (MCP) for tooling integration
- mcp-remote (local proxy for MCP servers)
- Cloudflare AI Playground and Claude Desktop for testing and clients
- GitHub Actions for auto deployment

## Project layout 📁

- `src/` — Worker entry and tool definitions (`src/index.ts`)
- `wrangler.jsonc`, `package.json`, `tsconfig.json` — project config and build setup

## Deploy to your Cloudflare Workers 🚀

[![Deploy to Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/KingsleyLeung03/power-gpt/tree/main)

This will deploy your MCP server to a URL like: `power-gpt.<your-account>.workers.dev/sse`

## Local deployment 🖥️
- **Prerequisites**
  - **Bun** - [Download](https://bun.sh/)

```bash
bun install
bun start
```
