import * as path from "path";
import * as cli from "build-utils/cli";
import {copyGlob, copyFile, exec} from "build-utils";

async function patch() {
    await exec(path.resolve("node_modules/.bin/tsc") + " -p ./build");
    await copyGlob("./build_tmp/*.js", "./package");
    await copyGlob("./build_tmp/*.d.ts", "./package");
    await copyFile("./package.json", "package/package.json");
    await exec("npm version patch", {
        cwd: "./package",
    });
    await exec("npm publish", {
        cwd: "./package",
    });
    await copyFile("package/package.json", "./package.json");
}

cli.command("patch", patch);

cli.run();
