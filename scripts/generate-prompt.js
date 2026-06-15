#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    dataFile: null,
    outputFile: null,
    verbose: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true;
    } else if (arg === '--output' || arg === '-o') {
      if (i + 1 < args.length) {
        options.outputFile = args[i + 1];
        i++; // Skip next arg since it's the output file
      } else {
        console.error('Error: --output requires a filename');
        process.exit(1);
      }
    } else if (!arg.startsWith('-')) {
      // Treat as data file if no flags
      options.dataFile = arg;
    } else {
      console.error(`Error: Unknown option ${arg}`);
      process.exit(1);
    }
  }

  return options;
}

function showHelp() {
  console.log(`Usage: generate-prompt [options] [data-file]

Generate chart2ai prompts using EXACT production functions.

Options:
  -o, --output <file>    Write output to file instead of terminal
  -v, --verbose          Show detailed generation progress
  -h, --help            Show this help message

Arguments:
  data-file             JSON file with chart form data (default: test-data.json)

Data Format:
  Chart locations can be city names (e.g., "New York, NY, USA") or coordinates (e.g., "40.7128,-74.0060")

Examples:
  generate-prompt                           # Use default test data, output to terminal
  generate-prompt my-chart.json             # Use custom data file
  generate-prompt -o prompt.txt             # Save output to file
  generate-prompt -v my-chart.json          # Show verbose progress
  generate-prompt -o output.txt -v          # Verbose mode with file output`);
}

// Import production functions using ts-node for TypeScript support
async function loadProductionFunctions() {
  try {
    // Register ts-node to handle TypeScript imports using scripts tsconfig
    require('ts-node').register({
      project: path.join(__dirname, 'tsconfig.json'),
      transpileOnly: true,
      ignore: [/node_modules/],
    });

    // Import the EXACT production functions
    const chartGenerator = require('../src/utils/chartGenerator.ts');

    return {
      generateChartText: chartGenerator.generateChartText,
      generateDisplayText: chartGenerator.generateDisplayText,
    };
  } catch (error) {
    throw new Error(`Failed to load production functions: ${error.message}`);
  }
}

async function main() {
  const options = parseArgs();

  if (options.help) {
    showHelp();
    return;
  }

  const dataFile = options.dataFile || path.join(__dirname, 'test-data.json');

  try {
    if (options.verbose) {
      console.error(`Reading data from: ${dataFile}`);
      console.error('\n=== USING EXACT PRODUCTION FUNCTIONS ===');
      console.error('✓ generateChartText from src/utils/chartGenerator.ts');
      console.error('✓ generateDisplayText from src/utils/chartGenerator.ts');
      console.error('✓ System prompts from src/data/ (exact same as UI)');
      console.error('✓ Real chart2txt analysis and API calls');
    }

    // Load production functions
    const productionFunctions = await loadProductionFunctions();

    const fileContent = fs.readFileSync(dataFile, 'utf-8');
    const formDataJson = JSON.parse(fileContent);

    // Convert date strings from JSON to Date objects using timezone-safe parsing
    const parseDateFromYMD = dateString => {
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day);
    };

    const formData = {
      ...formDataJson,
      charts: formDataJson.charts.map(chart => ({
        ...chart,
        date: parseDateFromYMD(chart.date),
      })),
      transit: formDataJson.transit
        ? {
            ...formDataJson.transit,
            date: parseDateFromYMD(formDataJson.transit.date),
          }
        : undefined,
    };

    // No location validation needed - geocoding handles both coordinates and location names

    // Use EXACT production functions
    if (options.verbose)
      console.error(
        '\nGenerating chart text using production chartGenerator...'
      );
    const chartText = await productionFunctions.generateChartText(formData);

    if (options.verbose)
      console.error(
        'Generating display text using production prompt system...'
      );
    const displayText = productionFunctions.generateDisplayText(
      chartText,
      formData,
      true
    );

    if (options.outputFile) {
      fs.writeFileSync(options.outputFile, displayText);
      if (options.verbose) {
        console.error(`\nPrompt saved to: ${options.outputFile}`);
      }
    } else {
      console.log(displayText);
    }
  } catch (error) {
    console.error(`Error generating prompt: ${error.message}`);
    process.exit(1);
  }
}

main();
