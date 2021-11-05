import { EventEmitter } from "events";
import {
  EVENTS,
  ILoginInputOptions,
  ISessionInfo,
  IStorage,
} from "@inrupt/solid-client-authn-core";
import ClientAuthentication from "@inrupt/solid-client-authn-browser/dist/ClientAuthentication";
import { v4 } from "uuid";
import { getClientAuthenticationWithDependencies } from "./dependencies";

export interface ISessionOptions {
  /**
   * A private storage, unreachable to other scripts on the page. Typically in-memory.
   */
  secureStorage: IStorage;
  /**
   * A storage where non-sensitive information may be stored, potentially longer-lived than the secure storage.
   */
  insecureStorage: IStorage;
  /**
   * Details about the current session
   */
  sessionInfo: ISessionInfo;
  /**
   * An instance of the library core. Typically obtained using `getClientAuthenticationWithDependencies`.
   */
  clientAuthentication: ClientAuthentication;
}

export interface IHandleIncomingRedirectOptions {
  /**
   * If the user has signed in before, setting this to `true` will automatically
   * redirect them to their Solid Identity Provider, which will then attempt to
   * re-activate the session and send the user back to your app without
   * requiring user interaction.
   * If your app's access has not expired yet and re-activation completed
   * successfully, a `sessionRestore` event will be fired with the URL the user
   * was at before they were redirected to their Solid Identity Provider.
   * {@see onSessionRestore}
   */
  restorePreviousSession?: boolean;

  /**
   * Inrupt's Enterprise Solid Server can set a cookie to allow the browser to
   * access private resources on a Pod. In order to mitigate the logout-on-refresh
   * issue on the short term, the server also implemented a session endpoint
   * enabling the client app to know whether the cookie is set. When a user
   * logs in to a server that has that capability enabled, applications that set
   * this option to `true` will be able to make use of it.
   *
   * If your app supports the newest session restore approach, and `restorePreviousSession`
   * is set to true, this option is automatically set to false, but your app will
   * not be logged out when reloaded.
   *
   * `useEssSession` defaults to false and will be removed in the future; to
   * preserve sessions across page reloads, use of `restorePreviousSession` is
   * recommended.
   */
  useEssSession?: boolean;
  /**
   * The URL of the page handling the redirect, including the query
   * parameters — these contain the information to process the login.
   * Note: as a convenience, if no URL value is specified here, we default to
   * using the browser's current location.
   */
  url?: string;
}

/**
 * A {@link Session} object represents a user's session on an application. The session holds state, as it stores information enabling acces to private resources after login for instance.
 */
export class Session extends EventEmitter {
  public readonly info: ISessionInfo;
  private clientAuthentication: ClientAuthentication;

  constructor(
    sessionOptions: Partial<ISessionOptions> = {},
    sessionId?: string
  ) {
    super();

    if (sessionOptions.clientAuthentication) {
      this.clientAuthentication = sessionOptions.clientAuthentication;
    } else {
      this.clientAuthentication = getClientAuthenticationWithDependencies({
        secureStorage: sessionOptions.secureStorage,
        insecureStorage: sessionOptions.insecureStorage,
      });
    }

    if (sessionOptions.sessionInfo) {
      this.info = {
        sessionId: sessionOptions.sessionInfo.sessionId,
        isLoggedIn: false,
        webId: sessionOptions.sessionInfo.webId,
      };
    } else {
      this.info = {
        sessionId: sessionId ?? v4(),
        isLoggedIn: false,
      };
    }
  }

  /**
   * Triggers the login process. Note that this method will redirect the user away from your app.
   *
   * @param options Parameter to customize the login behaviour. In particular, two options are mandatory: `options.oidcIssuer`, the user's identity provider, and `options.redirectUrl`, the URL to which the user will be redirected after logging in their identity provider.
   * @returns This method should redirect the user away from the app: it does not return anything. The login process is completed by {@linkcode handleIncomingRedirect}.
   */
  // Define these functions as properties so that they don't get accidentally re-bound.
  // Isn't Javascript fun?
  login = async (options: ILoginInputOptions): Promise<void> => {
    console.log("Login 4");
    try {
      await this.clientAuthentication.login(
        {
          sessionId: this.info.sessionId,
          ...options,
          tokenType: options.tokenType ?? "DPoP",
        },
        this
      );
    } catch (err) {
      console.error(err);
    }
  };

  /**
   * Fetches data using available login information. If the user is not logged in, this will behave as a regular `fetch`. The signature of this method is identical to the [canonical `fetch`](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API).
   *
   * @param url The URL from which data should be fetched.
   * @param init Optional parameters customizing the request, by specifying an HTTP method, headers, a body, etc. Follows the [WHATWG Fetch Standard](https://fetch.spec.whatwg.org/).
   */
  fetch = async (url: RequestInfo, init?: RequestInit): Promise<Response> => {
    console.log("Fetch");
    throw new Error("Not Implemented");
  };

  /**
   * Logs the user out of the application. This does not log the user out of their Solid identity provider, and should not redirect the user away.
   */
  logout = async (): Promise<void> => {
    console.log("Logout");
  };

  /**
   * Completes the login process by processing the information provided by the
   * Solid identity provider through redirect.
   *
   * @param options See {@see IHandleIncomingRedirectOptions}.
   */
  handleIncomingRedirect = async (
    inputOptions: string | IHandleIncomingRedirectOptions = {}
  ): Promise<ISessionInfo | undefined> => {
    console.log("Handle Incoming Redirect");
    return undefined;
  };

  /**
   * Register a callback function to be called when a user completes login.
   *
   * The callback is called when {@link handleIncomingRedirect} completes successfully.
   *
   * @param callback The function called when a user completes login.
   */
  onLogin(callback: () => unknown): void {
    this.on("login", callback);
  }

  /**
   * Register a callback function to be called when a user logs out:
   *
   * @param callback The function called when a user completes logout.
   */
  onLogout(callback: () => unknown): void {
    this.on("logout", callback);
  }

  /**
   * Register a callback function to be called when a user logs out:
   *
   * @param callback The function called when an error occurs.
   * @since 1.11.0
   */
  onError(
    callback: (
      error: string | null,
      errorDescription?: string | null
    ) => unknown
  ): void {
    this.on(EVENTS.ERROR, callback);
  }

  /**
   * Register a callback function to be called when a session is restored.
   *
   * Note: the callback will be called with the saved value of the 'current URL'
   * at the time the session was restored.
   *
   * @param callback The function called when a user's already logged-in session is restored, e.g., after a silent authentication is completed after a page refresh.
   */
  onSessionRestore(callback: (currentUrl: string) => unknown): void {
    this.on("sessionRestore", callback);
  }

  /**
   * Register a callback that runs when the session expires and can no longer
   * make authenticated requests, but following a user logout.
   * @param callback The function that runs on session expiration.
   * @since 1.11.0
   */
  onSessionExpiration(callback: () => unknown): void {
    this.on(EVENTS.SESSION_EXPIRED, callback);
  }
}
