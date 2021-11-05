import {
  IRedirector,
  IRedirectorOptions,
} from "@inrupt/solid-client-authn-core";
import { openAuthSessionAsync } from "expo-web-browser";

export default class ReactNativeRedirector implements IRedirector {
  redirect(redirectUrl: string, options?: IRedirectorOptions): void {
    if (options && options.handleRedirect) {
      options.handleRedirect(redirectUrl);
    } else if (options && options.redirectByReplacingState) {
      throw new Error("Redirect by replacing state not implemented");
    } else {
      console.log(`Redirect to ${redirectUrl}`);
      openAuthSessionAsync(redirectUrl, "example");
    }
  }
}
