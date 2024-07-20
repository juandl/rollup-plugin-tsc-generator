import ts, {type ParsedCommandLine} from "typescript";
import chalk from "chalk";
import path from "node:path";

const DEFAULT_CONFIG = {
    dist: "./dist",
};

const PluginConfig = {
    name: "rollup-plugin-tsc-generator",
};

type StatePlugin = {
    config: {
        dist: string;
    },
    typescript: {
        file?: string,
        content?: string,
        options: {
            emitDeclarationOnly: boolean,
            noEmit: boolean,
        },
        command?: ParsedCommandLine,
    }
}

/**
 * Typescript plugin to generate types using native tsc with typechecking
 * @param {Object} opts
 * @param {string} opts.dist - Folder to export types
 * @returns
 */
export const tscGenerator = (opts: StatePlugin["config"] = DEFAULT_CONFIG) => {
    const persistent = {
        writeIsDone: false,
        failed: false
    };

    return {
        name: PluginConfig.name,
        /**
         * Using a written bundle to make sure it generates types even if there's multiples build steps.
         */
        writeBundle() {
            //Run once
            if (persistent.writeIsDone) {
                return;
            }

            const state: StatePlugin = {
                config: {...DEFAULT_CONFIG},
                typescript: {
                    options: {
                        emitDeclarationOnly: true,
                        noEmit: false,
                    },
                },
            };

            //Merge config
            Object.assign(state.config, opts);

            // Load the TypeScript config file (e.g., tsconfig.json)
            state.typescript.file = ts.findConfigFile("./", ts.sys.fileExists, "tsconfig.json");

            if (!state.typescript.file) {
                throw new Error('Could not find a valid "tsconfig.json".');
            }

            //Read configuration
            state.typescript.content = ts.readConfigFile(state.typescript.file, ts.sys.readFile).config;

            logger.info(`Tsconfig loaded: ${state.typescript.file}`);

            //Add dist folder
            Object.assign(state.typescript.options, {
                outDir: state.config.dist,
            });

            // Parse JSON string content to compiler options
            state.typescript.command = ts.parseJsonConfigFileContent(
                state.typescript.content,
                ts.sys,
                path.dirname(state.typescript.file),
                state.typescript.options,
                state.typescript.file,
            );

            // Create a program instance to compile files
            const tsProgram = ts.createProgram(state.typescript.command.fileNames, state.typescript.command.options);

            logger.info("Generating declarations");

            const tsProgramEmitResult = tsProgram.emit();

            // Check for and report any errors
            const diagnostics = ts.getPreEmitDiagnostics(tsProgram).concat(tsProgramEmitResult.diagnostics);

            for (const diagnostic of diagnostics) {
                if (diagnostic.file && diagnostic.start) {
                    const {line, character} = ts.getLineAndCharacterOfPosition(diagnostic.file, diagnostic.start);

                    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");

                    logger.error(`${diagnostic.file.fileName} (${line + 1},${character + 1}): ${message}`);

                    //Mark as failed
                    persistent.failed = true;
                } else {
                    logger.error(ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n"));

                    //Mark as failed
                    persistent.failed = true;
                }
            }

            if (persistent.failed) {
                throw new Error('TypeScript emit failed');
            }

            // Check if there were any emitted errors
            if (tsProgramEmitResult.emitSkipped) {
                logger.error("TypeScript emit failed");
            } else {
                logger.info("TypeScript emit success");
            }

            //Write once only.
            persistent.writeIsDone = true;
        },
    };
};

/**
 * Logger helper
 * @param message
 * @param color
 */
const logger = {
    base: (message: string) => {
        console.log(chalk.blue(`[${PluginConfig.name}]`), message);
    },
    info: (message: string) => {
        logger.base(chalk.green(message))
    },
    error: (message: string) => {
        logger.base(chalk.red(message))
    }
}
