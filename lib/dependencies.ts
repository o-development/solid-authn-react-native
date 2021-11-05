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

/**
 * @hidden
 * @packageDocumentation
 */

/**
 * Top Level core document. Responsible for setting up the dependency graph
 */
import { IStorage, InMemoryStorage } from "@inrupt/solid-client-authn-core";
import StorageUtility from "@inrupt/solid-client-authn-browser/dist/storage/StorageUtility";
import ClientAuthentication from "@inrupt/solid-client-authn-browser/dist/ClientAuthentication";
import OidcLoginHandler from "@inrupt/solid-client-authn-browser/dist/login/oidc/OidcLoginHandler";
import AuthorizationCodeWithPkceOidcHandler from "@inrupt/solid-client-authn-browser/dist/login/oidc/oidcHandlers/AuthorizationCodeWithPkceOidcHandler";
import IssuerConfigFetcher from "@inrupt/solid-client-authn-browser/dist/login/oidc/IssuerConfigFetcher";
import { FallbackRedirectHandler } from "@inrupt/solid-client-authn-browser/dist/login/oidc/redirectHandler/FallbackRedirectHandler";
import GeneralLogoutHandler from "@inrupt/solid-client-authn-browser/dist/logout/GeneralLogoutHandler";
import { SessionInfoManager } from "@inrupt/solid-client-authn-browser/dist/sessionInfo/SessionInfoManager";
import { AuthCodeRedirectHandler } from "@inrupt/solid-client-authn-browser/dist/login/oidc/redirectHandler/AuthCodeRedirectHandler";
import AggregateRedirectHandler from "@inrupt/solid-client-authn-browser/dist/login/oidc/redirectHandler/AggregateRedirectHandler";
import ClientRegistrar from "@inrupt/solid-client-authn-browser/dist/login/oidc/ClientRegistrar";
import { ErrorOidcHandler } from "@inrupt/solid-client-authn-browser/dist/login/oidc/redirectHandler/ErrorOidcHandler";
import TokenRefresher from "@inrupt/solid-client-authn-browser/dist/login/oidc/refresh/TokenRefresher";
import ReactNativeStorage from "./storage/ReactNativeStorage";
import ReactNativeRedirector from "./login/ReactNativeRedirector";
import ReactNativeHandleRedirect from "./login/ReactNativeHandleRedirect";

/**
 *
 * @param dependencies
 */
export function getClientAuthenticationWithDependencies(dependencies: {
  secureStorage?: IStorage;
  insecureStorage?: IStorage;
}): ClientAuthentication {
  const inMemoryStorage = new InMemoryStorage();
  const secureStorage = dependencies.secureStorage || inMemoryStorage;
  const insecureStorage =
    dependencies.insecureStorage || new ReactNativeStorage();

  const storageUtility = new StorageUtility(secureStorage, insecureStorage);

  const issuerConfigFetcher = new IssuerConfigFetcher(storageUtility);
  const clientRegistrar = new ClientRegistrar(storageUtility);

  const sessionInfoManager = new SessionInfoManager(storageUtility);

  const tokenRefresher = new TokenRefresher(
    storageUtility,
    issuerConfigFetcher,
    clientRegistrar
  );

  const redirectHandler = new AggregateRedirectHandler([
    new ErrorOidcHandler(),
    new AuthCodeRedirectHandler(
      storageUtility,
      sessionInfoManager,
      issuerConfigFetcher,
      clientRegistrar,
      tokenRefresher
    ),
    // This catch-all class will always be able to handle the
    // redirect IRI, so it must be registered last.
    new FallbackRedirectHandler(),
  ]);

  // make new handler for redirect and login
  const loginHandler = new OidcLoginHandler(
    storageUtility,
    new AuthorizationCodeWithPkceOidcHandler(
      storageUtility,
      new ReactNativeRedirector(new ReactNativeHandleRedirect(redirectHandler))
    ),
    issuerConfigFetcher,
    clientRegistrar
  );

  return new ClientAuthentication(
    loginHandler,
    redirectHandler,
    new GeneralLogoutHandler(sessionInfoManager),
    sessionInfoManager,
    issuerConfigFetcher
  );
}
