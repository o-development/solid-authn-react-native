// import {
//   handleIncomingRedirect as importHandleIncomingRedirect,
//   login as importLogin,
//   fetch as importFetch,
//   getDefaultSession as importGetDefaultSession,
// } from "@inrupt/solid-client-authn-browser";
import { Session } from "@inrupt/solid-client-authn-browser";
import { IHandleIncomingRedirectOptions } from "@inrupt/solid-client-authn-browser/dist/Session";
import {
  ILoginInputOptions,
  ISessionInfo,
} from "@inrupt/solid-client-authn-core";

// export const handleIncomingRedirect = importHandleIncomingRedirect;
// export const login = importLogin;
// export const fetch = importFetch;
// export const getDefaultSession = importGetDefaultSession;

export const handleIncomingRedirect = async (
  inputOptions?: string | IHandleIncomingRedirectOptions | undefined
): Promise<ISessionInfo | undefined> => {
  console.log("Handle incoming redirect", inputOptions);
  return undefined;
};
export const login = async (options: ILoginInputOptions): Promise<void> => {
  console.log("Login", options);
};
export const fetch = async (
  url: RequestInfo,
  init?: RequestInit | undefined
): Promise<Response> => {
  console.log("fetch", url, init);
  throw new Error("not implemented");
};
export const getDefaultSession = (): Session => {
  console.log("getDefaultSession");
  return {
    info: {
      isLoggedIn: true,
      webId: "https://cooddude.com",
    },
  } as Session;
};
