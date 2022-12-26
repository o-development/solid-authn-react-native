import * as jose from "jose";
import { PREFERRED_SIGNING_ALG } from "@inrupt/solid-client-authn-core";

export default async function generateDpopKeyPair() {
  const { privateKey, publicKey } = await jose.generateKeyPair(
    PREFERRED_SIGNING_ALG[0]
  );
  // HACK: msrcrypto subtle crypto modifies the public and private key when calling
  // subtle.exportKey (https://github.com/kevlened/msrCrypto/blob/master/msrCrypto/msrcrypto.js#L10217)
  // This causes problems because the algorithm for the private key must be in its uppercase form
  // We clone the algorithm here.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (privateKey as any).algorithm = { ...(privateKey as any).algorithm };
  const dpopKeyPair = {
    privateKey,
    publicKey: await jose.exportJWK(publicKey),
  };
  [dpopKeyPair.publicKey.alg] = PREFERRED_SIGNING_ALG;
  return dpopKeyPair;
}
