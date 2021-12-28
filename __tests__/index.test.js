const path = require("path");
const { NextJsTypedApiWithSwrPlugin } = require("..");
const fs = require("fs");

describe("NextJsTypedApiWithSwrPlugin", () => {
  let spy;
  beforeEach(() => {
    spy = jest.spyOn(fs.promises, "writeFile").mockImplementation(() => {});
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("generates correct content with default configurations", async () => {
    const plugin = new NextJsTypedApiWithSwrPlugin();
    let tapFn;
    const compiler = {
      context: path.resolve(__dirname, "__fixtures__"),
      hooks: {
        thisCompilation: {
          tap: (_name, fn) => {
            tapFn = fn;
          },
        },
      },
    };

    plugin.apply(compiler);
    await tapFn();

    expect(spy.mock.calls[0][0]).toContain("__fixtures__/swr-api-types.ts");
    expect(spy.mock.calls[0][1]).toMatchSnapshot();
  });

  it("generates correct content with custom configurations", async () => {
    const plugin = new NextJsTypedApiWithSwrPlugin({
      outputFilePath: "__generated__/api_types.ts",
    });
    let tapFn;
    const compiler = {
      context: path.resolve(__dirname, "__fixtures__"),
      hooks: {
        thisCompilation: {
          tap: (_name, fn) => {
            tapFn = fn;
          },
        },
      },
    };

    plugin.apply(compiler);
    await tapFn();

    expect(spy.mock.calls[0][0]).toContain(
      "__fixtures__/__generated__/api_types.ts"
    );
    expect(spy.mock.calls[0][1]).toMatchSnapshot();
  });
});
