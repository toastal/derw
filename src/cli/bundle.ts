import {
    allErrors,
    bothFlag,
    empty,
    help,
    longFlag,
    parse,
    parser,
    string,
} from "@eeue56/baner";
import * as chokidar from "chokidar";
import * as esbuild from "esbuild";
import path from "path";
import { compileFiles } from "./compile";

const bundleParser = parser([
    longFlag("entry", "Entry point file to bundle up", string()),
    longFlag("output", "Output file to generate", string()),
    longFlag("quiet", "Dont print any output", empty()),
    longFlag("watch", "Watch Derw files for changes", empty()),
    bothFlag("h", "help", "This help text", empty()),
]);

function showBundleHelp(): void {
    console.log(
        "To bundle, run `derw build --entry {filename} --output {filename}`"
    );
    console.log("To watch use the --watch flag");
    console.log(help(bundleParser));
}

export async function bundle(
    isInPackageDirectory: boolean,
    argv: string[]
): Promise<void> {
    if (!isInPackageDirectory) {
        console.log(
            "No derw-package.json found. Maybe you need to run `derw init` first?"
        );
        process.exit(1);
    }

    const program = parse(bundleParser, argv);
    if (program.flags["h/help"].isPresent) {
        showBundleHelp();
        return;
    }

    const errors = allErrors(program);
    if (errors.length > 0) {
        console.log("Errors:");
        console.log(errors.join("\n"));
        process.exit(1);
    }

    const output =
        program.flags.output.isPresent &&
        program.flags.output.arguments.kind === "ok" &&
        (program.flags.output.arguments.value as string);

    if (!output) {
        console.log(
            "You must provide an output filename with --output <filename>"
        );
        process.exit(1);
    }

    let entry: string | false =
        program.flags.entry.isPresent &&
        program.flags.entry.arguments.kind === "ok" &&
        (program.flags.entry.arguments.value as string);

    if (!entry) {
        console.log(
            "You must provide an entry filename with --entry <filename>"
        );
        process.exit(1);
    }

    if (entry.endsWith(".derw")) {
        entry = entry.split(".").slice(0, -1).join(".") + ".ts";
    }

    const args = program.flags.quiet.isPresent ? [ "--quiet" ] : [ ];

    async function build() {
        await compileFiles(isInPackageDirectory, args);
        try {
            await esbuild.build({
                entryPoints: [ entry as string ],
                bundle: true,
                outfile: output as string,
                logLevel: "error",
            });
        } catch (e) {}
    }

    if (program.flags.watch.isPresent) {
        console.log("Watching src...");
        let timer: any;
        chokidar
            .watch(path.join(process.cwd(), "src"))
            .on("all", async (event: Event, path: string): Promise<any> => {
                if (path.endsWith(".derw")) {
                    if (timer !== null) {
                        clearTimeout(timer);
                    }
                    timer = setTimeout(async () => {
                        await build();
                    }, 300);
                }
            });
    } else {
        if (!program.flags.quiet.isPresent) {
            console.log("Bundling...");
        }
        await build();
    }
}
