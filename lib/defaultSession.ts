/*
 * Copyright 2021 Inrupt Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal in
 * the Software without restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
 * Software, and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// Typescript doesn't recognized react-native's special import rules
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Session } from "./Session";
import { IHandleIncomingRedirectOptions } from "@inrupt/solid-client-authn-browser/dist/Session";
import {
  ILoginInputOptions,
  ISessionInfo,
} from "@inrupt/solid-client-authn-core";

let defaultSession: Session;

/**
 * Obtain the {@link Session} used when not explicitly instantiating one yourself.
 *
 * When using the top-level exports {@link fetch}, {@link login}, {@link logout},
 * {@link handleIncomingRedirect}, {@link onLogin} and {@link onLogout}, these apply to an
 * implicitly-instantiated {@link Session}.
 * This function returns a reference to that Session in order to obtain e.g. the current user's
 * WebID.
 * @since 1.3.0
 */
export function getDefaultSession(): Session {
  if (typeof defaultSession === "undefined") {
    defaultSession = new Session({}, "default");
  }
  return defaultSession;
}

/**
 * This function's signature is equal to `window.fetch`, but if the current user is authenticated
 * (see [[login]] and [[handleIncomingRedirect]]), requests made using it will include that user's
 * credentials. If not, this will behave just like the regular `window.fetch`.
 *
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/fetch}
 * @since 1.3.0
 */
export const fetch = (
  url: RequestInfo,
  init?: RequestInit
): Promise<Response> => {
  const session = getDefaultSession();
  return session.fetch(url, init);
};

/**
 * Triggers the login process. Note that this method will redirect the user away from your app.
 *
 * @param options Parameter to customize the login behaviour. In particular, two options are mandatory: `options.oidcIssuer`, the user's identity provider, and `options.redirectUrl`, the URL to which the user will be redirected after logging in their identity provider.
 * @returns This method should redirect the user away from the app: it does not return anything. The login process is completed by [[handleIncomingRedirect]].
 * @since 1.3.0
 */
export const login = (options: ILoginInputOptions): Promise<void> => {
  const session = getDefaultSession();
  return session.login(options);
};

/**
 * Logs the user out of the application. This does not log the user out of their
 * Solid identity provider, and should not redirect the user away.
 *
 * @since 1.3.0
 */
export const logout = (): Promise<void> => {
  const session = getDefaultSession();
  return session.logout();
};

/**
 * Completes the login process by processing the information provided by the Solid identity provider through redirect.
 *
 * @param url The URL of the page handling the redirect, including the query parameters — these contain the information to process the login.
 * @since 1.3.0
 */
export const handleIncomingRedirect = (
  inputOptions: string | IHandleIncomingRedirectOptions = {}
): Promise<ISessionInfo | undefined> => {
  const session = getDefaultSession();
  return session.handleIncomingRedirect(inputOptions);
};

/**
 * Register a callback function to be called when a user completes login.
 *
 * The callback is called when {@link handleIncomingRedirect} completes successfully.
 * @since 1.3.0
 *
 * @param callback The function called when a user completes login.
 */
export const onLogin = (callback: () => unknown): void => {
  const session = getDefaultSession();
  return session.onLogin(callback);
};

/**
 * Register a callback function to be called when a user logs out:
 *
 * @param callback The function called when a user completes logout.
 * @since 1.3.0
 */
export const onLogout = (callback: () => unknown): void => {
  const session = getDefaultSession();
  return session.onLogout(callback);
};

/**
 * Register a callback function to be called when a session is restored:
 *
 * @param callback The function called when a session is restored.
 * @since 1.3.0
 */
export const onSessionRestore = (
  callback: (currentUrl: string) => unknown
): void => {
  const session = getDefaultSession();
  return session.onSessionRestore(callback);
};
