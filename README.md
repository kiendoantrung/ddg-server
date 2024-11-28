# DuckDuckGo Search MCP Server

A Model Context Protocol server that provides web search capabilities using DuckDuckGo.

## Features

- ddg_web_search - Perform web searches via DuckDuckGo

- query: Search query string (required)
- count: Number of results to return (default: 10)
- Returns formatted results with title, description and URL

## Installation

Install dependencies:

```bash
npm install
```

Build the server:

```bash
npm run build
```

For development with auto-rebuild:

```bash
npm run watch
```

## Installation

To use with Claude Desktop, add the server config:

On MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
On Windows: `%APPDATA%/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "ddg-server": {
      "command": "/path/to/ddg-server/build/index.js"
    }
  }
}
```

### Debugging

Since MCP servers communicate over stdio, debugging can be challenging. We recommend using the [MCP Inspector](https://github.com/modelcontextprotocol/inspector), which is available as a package script:

```bash
npm run inspector
```

The Inspector will provide a URL to access debugging tools in your browser.
