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

Run the crawler to process DDO Compendium categories and save them directly to the `src/data/loot/runtime/` directory.

### Process a Category
```bash
go run main.go Jewelry
```
This will process all Jewelry sub-categories (Goggles, Ring, etc.) and save them to their respective JSON files.

### Examples

**Fetch all Items:**
```bash
go run main.go Items
```

**Fetch all Augments (specialized parsing):**
```bash
go run main.go Augment
```

**Run Set Bonus Indexer:**
```bash
go run indexer/main.go
```

*Note: The Set Bonus Indexer automatically scans the `src/data/loot/runtime/` directory and generates `setBonusIndex.json` in the same directory.*

*Note: Data is saved directly to `src/data/loot/runtime/` based on the category processed.*

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
