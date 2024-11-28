#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import { search, SafeSearchType } from 'duck-duck-scrape';

const WEB_SEARCH_TOOL: Tool = {
  name: "ddg_web_search",
  description:
    "Performs a web search using the DuckDuckGo API, ideal for general queries, news, articles, and online content. " +
    "Use this for broad information gathering while respecting user privacy. " +
    "Returns relevant web results with titles, descriptions and URLs.",
  inputSchema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "Search query",
      },
      count: {
        type: "number",
        description: "Number of results (default 10)",
        default: 10,
      },
    },
    required: ["query"],
  },
};

interface DDGWebResult {
  title: string;
  link: string;
  snippet: string;
}

interface DDGResponse {
  results: DDGWebResult[];
}

function isDDGSearchArgs(
  args: unknown
): args is { query: string; count?: number } {
  return (
    typeof args === "object" &&
    args !== null &&
    "query" in args &&
    typeof (args as { query: string }).query === "string"
  );
}

async function performWebSearch(
  query: string,
  count: number = 10
): Promise<string> {
  try {
    const searchResults = await search(query, {
      safeSearch: SafeSearchType.MODERATE,
    });

    if (!searchResults || !searchResults.results) {
      return 'No results found';
    }

    return searchResults.results
      .slice(0, count)
      .map(result => 
        `Title: ${result.title}\nDescription: ${result.description}\nURL: ${result.url}`
      )
      .join('\n\n');
      
  } catch (error) {
    throw new Error(`Search failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Server implementation
const server = new Server(
  {
    name: "example-servers/ddg-search",
    version: "0.1.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [WEB_SEARCH_TOOL],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    const { name, arguments: args } = request.params;

    if (!args) {
      throw new Error("No arguments provided");
    }

    switch (name) {
      case "ddg_web_search": {
        if (!isDDGSearchArgs(args)) {
          throw new Error("Invalid arguments for ddg_web_search");
        }
        const { query, count = 10 } = args;
        const results = await performWebSearch(query, count);
        return {
          content: [{ type: "text", text: results }],
          isError: false,
        };
      }

      default:
        return {
          content: [{ type: "text", text: `Unknown tool: ${name}` }],
          isError: true,
        };
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
      isError: true,
    };
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("DuckDuckGo Search MCP Server running on stdio");
}

runServer().catch((error) => {
  console.error("Fatal error running server:", error);
  process.exit(1);
});
