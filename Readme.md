# Solid Authn React Native

⚠️ WARNING: Use at your own risk. This library has not undergone a 3rd party security review. 

A library for Solid Authentication in React Native Expo:
 - Support for iOS, Android, and Web
 - Works with the following servers:
   - ✅ Node Solid Server
   - ❎ Community Solid Server (CSS does not currently allow mobile URL schemes. I'll fix that in the future, but for now you can't use this library with CSS)
   - 🆗 Enterprise Solid Server (ESS allows you to log in, but fetches return a 401. I'll have to look into that)
 - Same API for mobile and web.
 - Works with Expo (This has not been tested with ejected React Native)

## Installation

```bash
npm i solid-authn-react-native
```

Add a `scheme` to Expo's [app.json file](https://docs.expo.dev/versions/latest/config/app/#scheme). This will allow the Pod's Identity Provider to redirect back to your app.

```json
{
  "expo": {
    // ...
    "scheme": "mycustomscheme",
    // ...
  }
}
```

## Usage
For a full example, see the [example-expo project](./example-expo).

This project follows the same interface as the `@inrupt/solid-client-authn-browser` library. See Inrupt's documentation [here](https://docs.inrupt.com/developer-tools/javascript/client-libraries/authentication/)

```typescript
import React, { FunctionComponent, useCallback, useState } from "react";
import { Button, View, Text } from "react-native";
import useAsyncEffect from "use-async-effect";
import {
  handleIncomingRedirect,
  login,
  getDefaultSession,
} from "solid-authn-react-native";
import { makeUrl } from "expo-linking";

const App: FunctionComponent = () => {
  const [webId, setWebId] = useState<string | undefined>();

  const onSessionChanged = useCallback(() => {
    if (getDefaultSession().info.isLoggedIn) {
      setWebId(getDefaultSession().info.webId);
    } else {
      setWebId(undefined);
    }
  }, []);

  // Handle Incoming Redirect
  useAsyncEffect(async () => {
    await handleIncomingRedirect({
      restorePreviousSession: true,
    });
    onSessionChanged();
  }, [onSessionChanged]);

  // Login
  const onLoginPress = useCallback(
    async (issuer: string) => {
      // The makeUrl function will make a url using the mobile scheme
      const callbackUrl = makeUrl("auth-callback");
      await login({
        oidcIssuer: issuer,
        redirectUrl: callbackUrl,
        clientName: "My application",
      });
      onSessionChanged();
    },
    [onSessionChanged]
  );

  return (
    <View style={{ paddingTop: 100 }}>
      <Text>
        {webId ? `You are logged in as ${webId}` : "You are not logged in"}
      </Text>
      <Button
        title="Log in with SolidWeb.org (NSS)"
        onPress={() => onLoginPress("https://solidweb.org")}
      />
    </View>
  );
};

export default App;
```
