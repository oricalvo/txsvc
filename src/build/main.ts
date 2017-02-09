import * as path from "path";
import * as cli from "build-utils/cli";
import {copyGlob, copyFile} from "build-utils/fs";
import {exec} from "build-utils/process";

cli.command("patch", patch);
cli.command("pack", pack);

async function pack() {
    await exec(path.resolve("node_modules/.bin/tsc") + " -p ./build/tsconfig.build.json");
    await copyGlob("./build_tmp/*.js", "./package");
    await copyGlob("./build_tmp/*.d.ts", "./package");
    await copyFile("./package.json", "package/package.json");
}

async function patch() {
    await pack();

    await exec("npm version patch", {
        cwd: "./package",
    });

    await exec("npm publish", {
        cwd: "./package",
    });

    await copyFile("package/package.json", "./package.json");
}

cli.run();
