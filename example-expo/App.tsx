import React, { FunctionComponent, useCallback, useState } from "react";
import { Button, View, Text } from "react-native";
import useAsyncEffect from "use-async-effect";
import {
  handleIncomingRedirect,
  login,
  getDefaultSession,
} from "solid-authn-react-native";

const App: FunctionComponent = () => {
  const [webId, setWebId] = useState<string | undefined>();

  useAsyncEffect(async () => {
    await handleIncomingRedirect();
    if (getDefaultSession().info.isLoggedIn) {
      setWebId(getDefaultSession().info.webId);
    }
  }, []);

  const logIn = useCallback((issuer: string) => {
    login({
      oidcIssuer: issuer,
      redirectUrl: "https://192.168.0.105:19006",
      clientName: "My application",
    });
  }, []);

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
