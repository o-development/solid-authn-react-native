//
// Copyright 2022 Inrupt Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal in
// the Software without restriction, including without limitation the rights to use,
// copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the
// Software, and to permit persons to whom the Software is furnished to do so,
// subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
// INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
// PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
// HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//

/**
 * @hidden
 * @packageDocumentation
 */

import {
  ILoginHandler,
  ILogoutHandler,
  IIncomingRedirectHandler,
  ISessionInfo,
  ISessionInfoManager,
  IIssuerConfigFetcher,
  ISessionInternalInfo,
  ILoginOptions,
} from "@inrupt/solid-client-authn-core";
import { removeOidcQueryParam } from "@inrupt/oidc-client-ext";
import { EventEmitter } from "events";

// By only referring to `window` at runtime, apps that do server-side rendering
// won't run into errors when rendering code that instantiates a
// ClientAuthentication:
const globalFetch: typeof window.fetch = (request, init) =>
  window.fetch(request, init);

/**
 * @hidden
 */
export default class ClientAuthenticationReactNative {
  constructor(
    private loginHandler: ILoginHandler,
    private redirectHandler: IIncomingRedirectHandler,
    private logoutHandler: ILogoutHandler,
    private sessionInfoManager: ISessionInfoManager,
    private issuerConfigFetcher: IIssuerConfigFetcher
  ) {}

  // Define these functions as properties so that they don't get accidentally re-bound.
  // Isn't Javascript fun?
  login = async (
    options: ILoginOptions,
    eventEmitter: EventEmitter
  ): Promise<void> => {
    // In order to get a clean start, make sure that the session is logged out
    // on login.
    // But we may want to preserve our client application info, particularly if
    // we used Dynamic Client Registration to register (since we don't
    // necessarily want the user to have to register this app each time they
    // login).
    await this.sessionInfoManager.clear(options.sessionId);
    const redirectUrl = options.redirectUrl
      ? removeOidcQueryParam(options.redirectUrl)
      : undefined;

    const loginResult = await this.loginHandler.handle({
      ...options,
      redirectUrl,
      // If no clientName is provided, the clientId may be used instead.
      clientName: options.clientName ?? options.clientId,
      eventEmitter,
    });
    if (loginResult?.fetch) {
      this.fetch = loginResult.fetch;
    }
  };

  // By default, our fetch() resolves to the environment fetch() function.
  fetch = globalFetch;

  logout = async (sessionId: string): Promise<void> => {
    await this.logoutHandler.handle(sessionId);

    // Restore our fetch() function back to the environment fetch(), effectively
    // leaving us with un-authenticated fetches from now on.
    this.fetch = globalFetch;
  };

  getSessionInfo = async (
    sessionId: string
  ): Promise<(ISessionInfo & ISessionInternalInfo) | undefined> => {
    // TODO complete
    return this.sessionInfoManager.get(sessionId);
  };

  getAllSessionInfo = async (): Promise<ISessionInfo[]> => {
    return this.sessionInfoManager.getAll();
  };

  // Collects session information from storage, and returns them. Returns null
  // if the expected information cannot be found.
  // Note that the ID token is not stored, which means the session information
  // cannot be validated at this point.
  validateCurrentSession = async (
    currentSessionId: string
  ): Promise<(ISessionInfo & ISessionInternalInfo) | null> => {
    const sessionInfo = await this.sessionInfoManager.get(currentSessionId);
    if (
      sessionInfo === undefined ||
      sessionInfo.clientAppId === undefined ||
      sessionInfo.issuer === undefined
    ) {
      return null;
    }
    return sessionInfo;
  };

  restoreSession = async (
    sessionId: string,
    eventEmitter: EventEmitter
  ): Promise<void> => {
    const sessionInfo = await this.getSessionInfo(sessionId);
    if (sessionInfo && sessionInfo.refreshToken && sessionInfo.clientAppId) {
      await this.login(
        {
          sessionId,
          refreshToken: sessionInfo.refreshToken,
          oidcIssuer: sessionInfo.issuer,
          tokenType: sessionInfo.tokenType || "DPoP",
          redirectUrl: sessionInfo.redirectUrl,
          clientId: sessionInfo.clientAppId,
          clientSecret: sessionInfo.clientAppSecret,
        },
        eventEmitter
      );
    }
  };
}
