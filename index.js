// @ts-check
const fs = require("fs");
const path = require("path");
const os = require("os");

/**
 * @typedef {Object} NextJsTypedApiWithSwrPluginOptions
 * @property {string=} apiPath Path to the directory that contains Next.js API paths
 * @property {string=} outputFilePath Path of output file to be written
 */

/**
 * Typed APIs using SWR and Next.js
 * @see https://github.com/mohsen1/automatic-use-swr-types
 */
class NextJsTypedApiWithSwrPlugin {
  /**
   * @param options {NextJsTypedApiWithSwrPluginOptions}
   */
  constructor(options = {}) {
    /** @type {NextJsTypedApiWithSwrPluginOptions} */
    this.options = {
      apiPath: "pages/api",
      outputFilePath: "swr-api-types.ts",
      ...options,
    };

    if (path.parse(this.options.outputFilePath).ext !== ".ts") {
      throw new Error(
        `${NextJsTypedApiWithSwrPlugin.name} only supports .ts output files.`
      );
    }
  }

  /** @param compiler {import("webpack").Compiler} */
  apply(compiler) {
    compiler.hooks.thisCompilation.tap(
      NextJsTypedApiWithSwrPlugin.name,
      async () => {
        const outputFilePath = path.resolve(
          compiler.context,
          this.options.outputFilePath
        );
        const apiPath = path.resolve(compiler.context, this.options.apiPath);
        const outputFilePathDir = path.dirname(outputFilePath);

        const output = await generateOutput(apiPath, outputFilePath);

        // Create the directory to write the output file to.
        if (!fs.existsSync(outputFilePathDir)) {
          await fs.promises.mkdir(outputFilePathDir, { recursive: true });
        }

        await fs.promises.writeFile(outputFilePath, output);
      }
    );
  }
}

/**
 * Walk a directory recursively and find all files
 * @param {string} dir
 * @returns {AsyncIterableIterator<string>}
 */
async function* walk(dir) {
  for await (const d of await fs.promises.opendir(dir)) {
    const entry = path.join(dir, d.name);
    if (d.isDirectory()) yield* walk(entry);
    else if (d.isFile()) yield entry;
  }
}

/**
 * Sanitize the given string by removing all non-alphanumeric characters
 * @param {string} fileName
 * @returns
 */
function sanitize(fileName) {
  return fileName.replace(/\.ts$/, "").replace(/[^a-zA-Z0-9_]/g, "_");
}

/**
 * Generate output file's content
 * @param {string} apiPath Net.js API path. Often `pages/api`
 * @param {string} outputFilePath Output file path
 * @returns
 */
async function generateOutput(apiPath, outputFilePath) {
  /**
   * @type {[filePath: string, importPath: string][]}
   * List of full file paths and import paths (from output file) of API files
   */
  const apiFiles = [];

  for await (const file of walk(apiPath)) {
    if (![".ts", ".tsx"].includes(path.extname(file))) continue;
    const relativePath = path.relative(path.parse(outputFilePath).dir, file);
    const parsedPath = path.parse(relativePath);
    const importPath = path.join(parsedPath.dir, parsedPath.name);
    apiFiles.push([file, importPath]);
  }

  const fileImports = apiFiles.map(([_filePath, importPath]) => {
    return `import ${sanitize(importPath)} from "${importPath}";`;
  });

  const overloads = apiFiles.map(([filePath, importPath]) => {
    const sanitizedFileName = sanitize(importPath);
    const apiPathDirectoryName = apiPath.split(path.sep).pop();
    const parsed = path.parse(
      path.join(
        "/",
        apiPathDirectoryName,
        path.relative(apiPath, filePath).split(path.sep).join("/")
      )
    );
    const key = path.join(parsed.dir, parsed.name);

    return `
    <Error = any>(
      key: "${key}",
      fetcher?: Fetcher<
        InferNextApiHandlerResponseType<typeof ${sanitizedFileName}>,
        "${key}"
      >
    ): SWRResponse<
      InferNextApiHandlerResponseType<typeof ${sanitizedFileName}>,
      Error
    >;`;
  });

  return `import { NextApiHandler } from "next";
import { Fetcher, SWRResponse } from "swr";
${fileImports.join(os.EOL)}


type InferNextApiHandlerResponseType<T extends NextApiHandler> =
  T extends NextApiHandler<infer U> ? U : never;

declare module "swr" {
  export interface SWRHook {
${overloads.join(os.EOL)}
  }
}
`;
}

function withNextJsTypedApiWithSwrPlugin(nextConfig = {}, options = {}) {
  return Object.assign({}, nextConfig, {
    webpack(config) {
      config.plugins.push(new NextJsTypedApiWithSwrPlugin(options));

      if (typeof nextConfig.webpack === "function") {
        return nextConfig.webpack(config, options);
      }

      return config;
    },
  });
}

module.exports = withNextJsTypedApiWithSwrPlugin;
module.exports.NextJsTypedApiWithSwrPlugin = NextJsTypedApiWithSwrPlugin;
