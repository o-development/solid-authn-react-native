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

  useAsyncEffect(async () => {
    await handleIncomingRedirect();
    if (getDefaultSession().info.isLoggedIn) {
      setWebId(getDefaultSession().info.webId);
    }
  }, []);

  const logIn = useCallback(async (issuer: string) => {
    const callbackUrl = makeUrl("auth-callback");
    console.log(callbackUrl);
    await login({
      oidcIssuer: issuer,
      redirectUrl: callbackUrl,
      clientName: "My application",
    });
    if (getDefaultSession().info.isLoggedIn) {
      setWebId(getDefaultSession().info.webId);
    }
  }, []);

  useAsyncEffect(async () => {
    const result = await crypto.subtle.generateKey(
      {
        name: "ECDSA",
        namedCurve: "P-256",
      },
      false,
      ["sign", "verify"]
    );
    console.log(result);
  });

  return (
    <View
      style={{ flex: 1, alignItems: "center", justifyContent: "space-around" }}
    >
      <Text>
        {webId ? `You are logged in as ${webId}` : "You are not logged in"}
      </Text>
      <Button
        title="Log in with SolidWeb.org (NSS)"
        onPress={() => logIn("https://solidweb.org")}
      />
      <Button
        title="Log in with SolidWeb.me (CSS)"
        onPress={() => logIn("https://solidweb.me")}
      />
      <Button
        title="Log in with pod.Inrupt.com (ESS)"
        onPress={() => logIn("https://broker.pod.inrupt.com")}
      />
    </View>
  );
};

export default App;
