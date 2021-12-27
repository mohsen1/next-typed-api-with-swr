const path = require("path");
const { NextJsTypedApiWithSwrPlugin } = require("..");
const fs = require("fs");

it("generates correct content with default configurations", async () => {
  const spy = jest.spyOn(fs.promises, "writeFile").mockImplementation(() => {});
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

  expect(spy).toMatchSnapshot();
});
