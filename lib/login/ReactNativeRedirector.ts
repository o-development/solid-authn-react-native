import {
  IRedirector,
  IRedirectorOptions,
} from "@inrupt/solid-client-authn-core";
import { openAuthSessionAsync } from "expo-web-browser";
import { IReactNativeHandleRedirect } from "./ReactNativeHandleRedirect";

export default class ReactNativeRedirector implements IRedirector {
  constructor(private reactNativeHandleRedirect: IReactNativeHandleRedirect) {}

  redirect(redirectUrl: string, options?: IRedirectorOptions): void {
    if (options && options.handleRedirect) {
      options.handleRedirect(redirectUrl);
    } else if (options && options.redirectByReplacingState) {
      throw new Error("Redirect by replacing state not implemented");
    } else {
      // Redirect due to login
      new Promise(async (resolve, reject) => {
        try {
          // TODO replace hard coded url with the actual url
          const result = await openAuthSessionAsync(
            redirectUrl,
            "exp://192.168.0.105:19000/--/auth-callback"
          );
          await this.reactNativeHandleRedirect.handle(result);
        } catch (err) {
          reject(err);
        }
      });
    }
  }
}
