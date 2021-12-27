import { NextApiHandler } from "next";
import { Fetcher, SWRResponse } from "swr";
import pages_api_users from "pages/api/users";


type InferNextApiHandlerResponseType<T extends NextApiHandler> =
  T extends NextApiHandler<infer U> ? U : never;

declare module "swr" {
  export interface SWRHook {

    <Error = any>(
      key: "/api/users",
      fetcher?: Fetcher<
        InferNextApiHandlerResponseType<typeof pages_api_users>,
        "/api/users"
      >
    ): SWRResponse<
      InferNextApiHandlerResponseType<typeof pages_api_users>,
      Error
    >;
  }
}
