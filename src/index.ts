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

		// Simple exponentiation tool
		this.server.tool(
			"calculate_exponent",
			"Simple exponentiation of two numbers",
			{
				base: z.number().describe("Base number"),
				exponent: z.number().describe("Exponent number"),
			},
			async ({ base, exponent }) => ({
				content: [
					{
						type: "text",
						text: String(base ** exponent),
					},
				],
			}),
		);

		// Root extraction tool
		this.server.tool(
			"calculate_root",
			"Extract the n-th root of a number",
			{
				number: z.number().describe("The number to extract the root from"),
				root: z.number().describe("The degree of the root to extract"),
			},
			async ({ number, root }) => ({
				content: [
					{
						type: "text",
						text: root === 0 ? "Error: Root degree cannot be zero" : String(number ** (1 / root)),
					},
				],
			}),
		);

		// Modulus tool
		this.server.tool(
			"calculate_modulus",
			"Calculate the modulus of two numbers",
			{
				a: z.number().describe("The dividend"),
				b: z.number().describe("The divisor"),
			},
			async ({ a, b }) => ({
				content: [
					{
						type: "text",
						text: b === 0 ? "Error: Cannot perform modulus with divisor zero" : String(a % b),
					},
				],
			}),
		);

		// Factorial tool
		this.server.tool(
			"calculate_factorial",
			"Calculate the factorial of a non-negative integer",
			{
				n: z.number().describe("The non-negative integer"),
			},
			async ({ n }) => {
				const factorial = (num: number): number => {
					if (num < 0) return NaN; // Factorial is not defined for negative numbers
					if (!Number.isInteger(num)) return NaN; // Factorial is only defined for integers
					if (num === 0 || num === 1) return 1;

					let result = 1;
					for (let i = 2; i <= num; i++) {
						result *= i;
					}

					return result;
				};
				return {
					content: [
						{
							type: "text",
							text: Number.isNaN(factorial(n)) ? "Error: Input must be a non-negative integer" : String(factorial(n)),
						},
					],
				};
			},
		);

		// Fibonacci number at position tool
		this.server.tool(
			"calculate_fibonacci",
			"Calculate the Fibonacci number at a specific position (0-indexed)",
			{
				position: z.number().describe("The position in the Fibonacci sequence (0-indexed)"),
			},
			async ({ position }) => {
				if (position < 0 || !Number.isInteger(position)) {
					return {
						content: [
							{
								type: "text",
								text: "Error: Position must be a non-negative integer",
							},
						],
					};
				}
				let a = 0, b = 1, fib = position === 0 ? 0 : 1;
				for (let i = 2; i <= position; i++) {
					fib = a + b;
					a = b;
					b = fib;
				}
				return {
					content: [
						{
							type: "text",
							text: String(fib),
						},
					],
				};
			},
		);

		// Prime number check tool
		this.server.tool(
			"check_prime",
			"Check if a number is prime",
			{
				n: z.number().describe("The number to check for primality"),
			},
			async ({ n }) => {
				if (n <= 1 || !Number.isInteger(n)) {
					return {
						content: [
							{
								type: "text",
								text: "Error: Input must be an integer greater than 1",
							},
						],
					};
				}
				for (let i = 2; i <= Math.sqrt(n); i++) {
					if (n % i === 0) {
						return {
							content: [
								{
									type: "text",
									text: `${n} is not a prime number`,
								},
							],
						};
					}
				}
				return {
					content: [
						{
							type: "text",
							text: `${n} is a prime number`,
						},
					],
				};
			},
		);

		// Greatest common divisor (GCD) tool
		this.server.tool(
			"calculate_gcd",
			"Calculate the greatest common divisor (GCD) of two numbers",
			{
				a: z.number().describe("First number"),
				b: z.number().describe("Second number"),
			},
			async ({ a, b }) => {
				const gcd = (x: number, y: number): number => {
					if (!Number.isInteger(x) || !Number.isInteger(y)) return NaN;
					x = Math.abs(x);
					y = Math.abs(y);
					while (y) {
						const temp = y;
						y = x % y;
						x = temp;
					}
					return x;
				};
				const result = gcd(a, b);
				return {
					content: [
						{
							type: "text",
							text: Number.isNaN(result) ? "Error: Inputs must be integers" : String(result),
						},
					],
				};
			},
		);

		// Least common multiple (LCM) tool
		this.server.tool(
			"calculate_lcm",
			"Calculate the least common multiple (LCM) of two numbers",
			{
				a: z.number().describe("First number"),
				b: z.number().describe("Second number"),
			},
			async ({ a, b }) => {
				const gcd = (x: number, y: number): number => {
					if (!Number.isInteger(x) || !Number.isInteger(y)) return NaN;
					x = Math.abs(x);
					y = Math.abs(y);
					while (y) {
						const temp = y;
						y = x % y;
						x = temp;
					}
					return x;
				};
				const lcm = (x: number, y: number): number => {
					if (!Number.isInteger(x) || !Number.isInteger(y)) return NaN;
					if (x === 0 || y === 0) return 0;
					return Math.abs((x * y) / gcd(x, y));
				};
				const result = lcm(a, b);
				return {
					content: [
						{
							type: "text",
							text: Number.isNaN(result) ? "Error: Inputs must be integers" : String(result),
						},
					],
				};
			},
		);

		// Compare two numbers tool
		this.server.tool(
			"compare_numbers",
			"Compare two numbers and determine their relationship",
			{
				a: z.number().describe("First number to compare"),
				b: z.number().describe("Second number to compare"),
			},
			async ({ a, b }) => {
				let comparison: string;
				if (a < b) {
					comparison = "less than";
				} else if (a > b) {
					comparison = "greater than";
				} else {
					comparison = "equal to";
				}
				return {
					content: [
						{
							type: "text",
							text: `${a} is ${comparison} ${b}`,
						},
					],
				};
			},
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
