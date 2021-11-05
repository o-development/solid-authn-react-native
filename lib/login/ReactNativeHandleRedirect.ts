import { IRedirectHandler } from "@inrupt/solid-client-authn-core";
import { WebBrowserAuthSessionResult } from "expo-web-browser";

export interface IReactNativeHandleRedirect {
  handle: (authRequestResult: WebBrowserAuthSessionResult) => Promise<void>;
}

export default class ReactNativeHandleRedirect
  implements IReactNativeHandleRedirect
{
  constructor(private redirectHandler: IRedirectHandler) {}

  async handle(authRequestResult: WebBrowserAuthSessionResult): Promise<void> {
    console.log(authRequestResult);
    if (authRequestResult.type === "success") {
      const result = await this.redirectHandler.handle(
        authRequestResult.url,
        undefined
      );
      console.log(result);
    }
  }
}
