import * as path from "path";
import {copyGlob, copyFile} from "build-utils/fs";
import {exec} from "build-utils/process";

export async function pack() {
    await exec(path.resolve("node_modules/.bin/ngc") + " -p ./build/tsconfig.pack.json");
    await copyGlob("./build_tmp/*.js", "./package");
    await copyGlob("./build_tmp/*.d.ts", "./package");
    await copyGlob("./build_tmp/*.metadata.json", "./package");
    await copyFile("./package.json", "package/package.json");
}

export async function patch() {
    await pack();

    await exec("npm version patch", {
        cwd: "./package",
    });

    await exec("npm publish", {
        cwd: "./package",
    });

    await copyFile("package/package.json", "./package.json");
}
