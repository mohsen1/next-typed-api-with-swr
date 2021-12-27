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

  expect(spy).toMatchInlineSnapshot(`
[MockFunction] {
  "calls": Array [
    Array [
      "/Users/mohsen_azimi/Desktop/NextJsTypedApiWithSwrPlugin/__tests__/__fixtures__/swr-api-types.ts",
      "import { NextApiHandler } from \\"next\\";
import { Fetcher, SWRResponse } from \\"swr\\";
import pages_api_users from \\"pages/api/users\\";


type InferNextApiHandlerResponseType<T extends NextApiHandler> =
  T extends NextApiHandler<infer U> ? U : never;

declare module \\"swr\\" {
  export interface SWRHook {

    <Error = any>(
      key: \\"/api/users\\",
      fetcher?: Fetcher<
        InferNextApiHandlerResponseType<typeof pages_api_users>,
        \\"/api/users\\"
      >
    ): SWRResponse<
      InferNextApiHandlerResponseType<typeof pages_api_users>,
      Error
    >;
  }
}
",
    ],
  ],
  "results": Array [
    Object {
      "type": "return",
      "value": undefined,
    },
  ],
}
`);
});
