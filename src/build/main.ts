import * as path from "path";
import * as cli from "build-utils/cli";
import {copyGlob, copyFile} from "build-utils/fs";
import {exec} from "build-utils/process";

export async function test() {
    await compileTS();
    await jasmine();
}

async function compileTS() {
    console.log("Compiling typescript");

    await exec(path.resolve("node_modules/.bin/tsc"));
}

async function jasmine() {
    await exec(path.resolve("node_modules/.bin/jasmine"));
}

export async function pack() {
    console.log("Creating npm package");

    await exec(path.resolve("node_modules/.bin/tsc") + " -p ./build/tsconfig.pack.json");
    await copyGlob("./build_tmp/*.js", "./package");
    await copyGlob("./build_tmp/*.d.ts", "./package");
    await copyFile("./package.json", "package/package.json");
}

export async function patch() {
    await pack();

    await exec("npm version patch", {
        cwd: "./package",
    });

    await copyFile("../readme.md", "package/readme.md");

    await exec("npm publish", {
        cwd: "./package",
    });

    await copyFile("package/package.json", "./package.json");
}
