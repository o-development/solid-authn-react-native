import base64 from "base-64";
// No typings for msrcrypto
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { subtle } from "msrcrypto";

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
crypto.subtle = {
  ...subtle,
  generateKey: async (
    algorithm: RsaHashedKeyGenParams | EcKeyGenParams,
    extractable: boolean,
    keyUsages: KeyUsage[]
  ) => {
    const result = await subtle.generateKey(algorithm, extractable, keyUsages);
    if (result.publicKey) {
      // Extractable is read-only. I am overwriting this because this API
      // differs with the web api. In the web API, if "extactable" is false
      // the public keys's extactable is always true.
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      result.publicKey.extractable = true;
    }
    return result;
  },
};

// Need to rebind CryptoKey to Object since "isomorphic-webcrypto" doesn't use
// "CryptoKey" it uses a regular Object
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.CryptoKey = Object;
// btoa is not available in React Native. It is needed for Jose.
global.btoa = (input: string): string => {
  return base64.encode(input);
};
global.atob = (input: string): string => {
  const result = base64.decode(input);
  return result;
};
