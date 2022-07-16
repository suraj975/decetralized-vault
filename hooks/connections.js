import React, { useState } from "react";

import CeramicClient from "@ceramicnetwork/http-client";
import ThreeIdResolver from "@ceramicnetwork/3id-did-resolver";

import { EthereumAuthProvider, ThreeIdConnect } from "@3id/connect";
import { DID } from "dids";
import { create } from "ipfs-http-client";

const projectId = process.env.NEXT_PUBLIC_INFURA_IPFS_ID;
const projectSecret = process.env.NEXT_PUBLIC_INFURA_IPFS_KEY;
const auth =
  "Basic " + Buffer.from(projectId + ":" + projectSecret).toString("base64");
export const endpoint = "https://ceramic-clay.3boxlabs.com";

export const useIpfs = () => {
  const [ipfs, setIpfs] = useState();

  React.useEffect(() => {
    const getIpfsInstance = async () => {
      const client = create({
        host: "ipfs.infura.io",
        port: 5001,
        protocol: "https",
        headers: {
          authorization: auth,
        },
      });
      setIpfs(client);
    };
    if (!ipfs) {
      getIpfsInstance();
    }
  }, []);

  return ipfs;
};

export async function connect() {
  if (typeof window !== "undefined") {
    const addresses = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    console.log("addressss", addresses);
    return addresses;
  }
}

export const useAccountCeramicConnection = async (config, setConfig) => {
  if (config) return;
  if (typeof window == "undefined") return;
  const [address] = await connect();
  const ceramic = new CeramicClient(endpoint);
  const threeIdConnect = new ThreeIdConnect();
  const getData = async () => {
    const provider = new EthereumAuthProvider(window.ethereum, address);
    await threeIdConnect.connect(provider);
    const did = new DID({
      provider: threeIdConnect.getDidProvider(),
      resolver: {
        ...ThreeIdResolver.getResolver(ceramic),
      },
    });

    ceramic.setDID(did);
    await ceramic.did.authenticate();
    setConfig({ ceramic, did, address });
  };
  await getData();
};
