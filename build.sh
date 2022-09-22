(trap 'kill 0' SIGINT; http-server -c-1 build & npx esbuild src/ts/index.ts --bundle --watch --outdir=build)
