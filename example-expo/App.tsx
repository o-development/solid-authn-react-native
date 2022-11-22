import React, {
  FunctionComponent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Button, View, Text, ScrollView, TextInput } from "react-native";
import useAsyncEffect from "use-async-effect";
import {
  handleIncomingRedirect,
  login,
  getDefaultSession,
  fetch,
  logout,
  onLogin,
  onLogout,
  onSessionRestore,
} from "solid-authn-react-native";
import { createURL } from "expo-linking";

const App: FunctionComponent = () => {
  const [webId, setWebId] = useState<string | undefined>();
  const [fetchUri, setFetchUri] = useState("");
  const [fetchResult, setFetchResult] = useState<
    { status: number; body: string } | undefined
  >(undefined);
  const [customIssuer, setCustomIssuer] = useState("https://inrupt.net");

  // Listeners
  useEffect(() => {
    onLogin(() => {
      console.log("onLogin", getDefaultSession().info);
    });
    onLogout(() => {
      console.log("onLogout", getDefaultSession().info);
    });
    onSessionRestore(() => {
      console.log("onSesionRestore", getDefaultSession().info);
    });
  }, []);

  const onSessionChanged = useCallback(() => {
    if (getDefaultSession().info.isLoggedIn) {
      setWebId(getDefaultSession().info.webId);
      setFetchUri(getDefaultSession().info.webId || "");
    } else {
      setWebId(undefined);
      setFetchUri("");
      setFetchResult(undefined);
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
      const callbackUrl = createURL("auth-callback");
      await login({
        oidcIssuer: issuer,
        redirectUrl: callbackUrl,
        clientName: "My application",
      });
      onSessionChanged();
    },
    [onSessionChanged]
  );

  // Fetch
  const onFetchPress = useCallback(async () => {
    try {
      const result = await fetch(fetchUri);
      if (result.status === 200) {
        setFetchResult({
          status: 200,
          body: await result.text(),
        });
      } else {
        setFetchResult({
          status: result.status,
          body: "",
        });
      }
    } catch (err) {
      console.error(err);
    }
  }, [fetchUri]);

  // Logout
  const onLogoutPress = useCallback(async () => {
    await logout();
    onSessionChanged();
  }, [onSessionChanged]);

  return (
    <View
      style={{
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: "stretch",
        justifyContent: "space-around",
        paddingHorizontal: 10,
      }}
    >
      <View style={{ flex: 1, justifyContent: "center" }}>
        <Text>
          {webId ? `You are logged in as ${webId}` : "You are not logged in"}
        </Text>
      </View>
      <View style={{ flex: 1, justifyContent: "space-between" }}>
        {webId ? (
          <Button title="Log Out" onPress={onLogoutPress} />
        ) : (
          <>
            <Button
              title="Log in with SolidWeb.org (NSS)"
              onPress={() => onLoginPress("https://solidweb.org")}
            />
            <Button
              title="Log in with SolidWeb.me (CSS)"
              onPress={() => onLoginPress("https://solidweb.me")}
            />
            <Button
              title="Log in with pod.Inrupt.com (ESS)"
              onPress={() => onLoginPress("https://broker.pod.inrupt.com")}
            />
            <TextInput
              style={{
                borderColor: "black",
                borderWidth: 1,
                marginVertical: 10,
                padding: 5,
              }}
              placeholder="Custom Issuer (https://inrupt.net)"
              value={customIssuer}
              onChangeText={(text) => setCustomIssuer(text)}
            />
            <Button
              title={`Log in with ${customIssuer}`}
              onPress={() => onLoginPress(customIssuer)}
            />
          </>
        )}
      </View>
      <ScrollView
        style={{
          flex: 2,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: "black",
          paddingVertical: 10,
        }}
      >
        <TextInput
          style={{
            borderColor: "black",
            borderWidth: 1,
            marginVertical: 10,
            padding: 5,
          }}
          placeholder="Fetch Uri (https://pod.example/private/)"
          value={fetchUri}
          onChangeText={(text) => setFetchUri(text)}
        />
        <Button title="Fetch" onPress={onFetchPress} />
        {fetchResult ? (
          <>
            <Text>Status: {fetchResult.status}</Text>
            <Text>{fetchResult.body}</Text>
          </>
        ) : undefined}
      </ScrollView>
    </View>
  );
};

export default App;
