import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { parseHTML } from "linkedom";
import { Readability } from "@mozilla/readability";
import TurndownService from "turndown";
import { createDocument } from "@mixmark-io/domino";

// Define our MCP agent with tools
export class MyMCP extends McpAgent {
	server = new McpServer({
		name: "PowerGPT",
		version: "1.0.0",
		description:
			"A MCP agent with powerful tools to enhance LLM's capabilities.",
	});

	async init() {
		// Simple addition tool
		this.server.tool(
			"calculate_add",
			"Simple addition of two numbers",
			{
				a: z.number().describe("First number to add"),
				b: z.number().describe("Second number to add"),
			},
			async ({ a, b }) => ({
				content: [
					{
						type: "text",
						text: String(a + b),
					},
				],
			}),
		);

		// Simple subtraction tool
		this.server.tool(
			"calculate_subtract",
			"Simple subtraction of two numbers",
			{
				a: z.number().describe("First number to subtract"),
				b: z.number().describe("Second number to subtract"),
			},
			async ({ a, b }) => ({
				content: [
					{
						type: "text",
						text: String(a - b),
					},
				],
			}),
		);

		// Simple multiplication tool
		this.server.tool(
			"calculate_multiply",
			"Simple multiplication of two numbers",
			{
				a: z.number().describe("First number to multiply"),
				b: z.number().describe("Second number to multiply"),
			},
			async ({ a, b }) => ({
				content: [
					{
						type: "text",
						text: String(a * b),
					},
				],
			}),
		);

		// Simple division tool
		this.server.tool(
			"calculate_divide",
			"Simple division of two numbers",
			{
				a: z.number().describe("First number to divide"),
				b: z.number().describe("Second number to divide"),
			},
			async ({ a, b }) => ({
				content: [
					{
						type: "text",
						text: b === 0 ? "Error: Cannot divide by zero" : String(a / b),
					},
				],
			}),
		);

		// Random number tool
		this.server.tool(
			"random_number",
			"Generate a truly random number within a specified range using Cloudflare's drand service",
			{
				startRange: z.number().describe("Minimum value (inclusive)"),
				endRange: z.number().describe("Maximum value (inclusive)"),
			},
			async ({ startRange, endRange }) => {
				try {
					// Get true randomness from drand Cloudflare endpoint
					const response = await fetch(
						"https://drand.cloudflare.com/public/latest",
					);
					const data = (await response.json()) as { randomness: string };

					// Use the randomness value as seed
					// Take a random 8-character slice from the full randomness string
					const randomHex = data.randomness;
					const startIndex = Math.floor(Math.random() * (randomHex.length - 8));
					const randomValue = parseInt(
						randomHex.slice(startIndex, startIndex + 8),
						16,
					);

					// Scale to the requested range
					const scaledRandom =
						(Math.abs(randomValue) % (endRange - startRange + 1)) + startRange;

					return {
						content: [
							{
								type: "text",
								text: String(scaledRandom),
							},
						],
					};
				} catch (error) {
					// Fallback to Math.random if fetch fails
					console.log(
						"ERROR from random_number: Error fetching from drand:",
						error,
					);
					return {
						content: [
							{
								type: "text",
								text: String(
									Math.floor(Math.random() * (endRange - startRange + 1)) +
										startRange,
								),
							},
						],
					};
				}
			},
		);

		// Fetch URL and extract text content tool
		this.server.tool(
			"fetch_url",
			"Fetch content from a specified URL",
			{
				url: z.string().url().describe("The URL to fetch content from"),
			},
			async ({ url }) => {
				try {
					const response = await fetch(url);
					if (!response.ok) {
						return {
							content: [
								{
									type: "text",
									text: `Error: HTTP error! Status: ${response.status}`,
								},
							],
						};
					}

					const html = await response.text();

					// Parse HTML and extract readable content using Readability
					const { document } = parseHTML(html);
					const reader = new Readability(document);
					const article = reader.parse();

					// If Readability fails to parse, return an error message
					if (!article || !article.content) {
						return {
							content: [
								{
									type: "text",
									text: "Error: Unable to extract readable content from the page.",
								},
							],
						};
					}

					const turndownService = new TurndownService();

					// Turndown requires a DOM document object when running in an environment
					// like Cloudflare Workers that lacks a native DOM. We use `@mixmark-io/domino`
					// to provide a compatible DOM implementation.
					// See for more context: https://github.com/mixmark-io/turndown/issues/469
					const contentMarkdown = turndownService.turndown(
						createDocument(article.content),
					);

					return {
						content: [
							{
								type: "text",
								text: `${article.title}\n\n${contentMarkdown}`,
							},
						],
					};
				} catch (error) {
					console.log("ERROR from fetch_url: ", error);
					return {
						content: [
							{
								type: "text",
								text: `Error: Failed to fetch URL: ${
									error instanceof Error ? error.message : String(error)
								}`,
							},
						],
					};
				}
			},
		);
	}
}

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === "/sse" || url.pathname === "/sse/message") {
			return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
		}

		if (url.pathname === "/mcp") {
			return MyMCP.serve("/mcp").fetch(request, env, ctx);
		}

		return new Response("Not found", { status: 404 });
	},
};
