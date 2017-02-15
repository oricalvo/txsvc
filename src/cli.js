const path = require("path");
const cli = require("build-utils/cli");
const {exec} = require("build-utils/process");
const build = require("./build/main");

cli.command("patch", build.patch);
cli.command("pack", build.pack);
cli.command("test", build.test);

console.log("Compiling build scripts");
exec(path.resolve("node_modules/.bin/tsc") + " -p ./build/tsconfig.build.json").then(()=> {
    cli.run();
});
