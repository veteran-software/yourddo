# Compendium Crawler (Go)

A high-performance ETL (Extract, Transform, Load) tool written in Go for crawling and parsing content from the [DDO Compendium](https://ddocompendium.com).

## Features

- **MediaWiki API Integration**: Efficiently fetches category members and their content with pagination support.
- **Specialized Parsers**: Includes dedicated logic for parsing item templates and augment templates.
- **Natural Sorting**: Sorts the resulting JSON output by item name using a case-insensitive, number-aware natural ordering algorithm (e.g., "Item 2" comes before "Item 10").
- **JSON Output**: Generates structured JSON data suitable for consumption by front-end applications or other tools.
- **TypeScript Definitions**: Includes shared TypeScript interfaces to ensure type safety in consuming projects.

## Prerequisites

- [Go 1.24+](https://go.dev/dl/)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/compendium-crawler-go.git
   cd compendium-crawler-go
   ```

2. Install dependencies:
   ```bash
   go mod download
   ```

## Usage

Run the crawler by providing a DDO Compendium category name as a command-line argument.

### General Usage

```bash
go run main.go <Category_Name_Without_Prefix>
```

### Examples

**Fetch all Items:**
```bash
go run main.go Items > items.json
```

**Fetch all Augments (specialized parsing):**
```bash
go run main.go Augments > augments.json
```

*Note: Logs and progress updates are sent to `stderr`, while the final JSON result is sent to `stdout`. Use redirection (e.g., `> output.json`) to save the data.*

## Project Structure

- `main.go`: Application entry point and CLI handler.
- `api/`: MediaWiki API client logic and pagination handling.
- `parser/`: Core transformation logic for converting Wikitext to structured data.
- `tsInterfaces/`: TypeScript interface definitions for the parsed data.
- `cleanup/`: Utility functions for cleaning and normalizing parsed text.

## How it Works

1. **Extraction**: The tool queries the DDO Compendium API for all members of a specified category.
2. **Transformation**:
   - For the **Augment** category, it uses `parser.ProcessAugmentMap`.
   - For all other categories, it uses `parser.ProcessContentMap`.
3. **Sorting**: Items are sorted naturally by name.
4. **Loading**: The final structured data is marshaled into JSON and printed to the standard output.

## License

[Insert License Here]
