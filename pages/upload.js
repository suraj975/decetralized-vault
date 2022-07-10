import React, { useState } from "react";

import CeramicClient from "@ceramicnetwork/http-client";
import ThreeIdResolver from "@ceramicnetwork/3id-did-resolver";

import { EthereumAuthProvider, ThreeIdConnect } from "@3id/connect";
import { DID } from "dids";
import { IDX } from "@ceramicstudio/idx";
import * as IPFS from "ipfs-core";
import NavBar from "../components/navbar";
const CID = require("cids");

const endpoint = "https://ceramic-clay.3boxlabs.com";

const useIpfs = () => {
  const [ipfs, setIpfs] = useState();

  React.useEffect(() => {
    const getIpfsInstance = async () => {
      const data = await IPFS.create({ repo: "ok" + Math.random() });
      setIpfs(data);
    };
    getIpfsInstance();
  }, []);

  return ipfs;
};

async function connect() {
  if (!window) return;
  const addresses = await window.ethereum.request({
    method: "eth_requestAccounts",
  });
  return addresses;
}

const useAccountCeramicConnection = async (setConfig) => {
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

function App() {
  const [name, setName] = useState("");
  const [image, setImage] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [state, setState] = useState([]);
  const [config, setConfig] = useState();
  const ipfs = useIpfs();
  useAccountCeramicConnection(setConfig);

  React.useEffect(() => {
    fetch("https://ipfs.io/ipfs/QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n")
      .then((res) => {
        return res.json();
      })
      .then((data) => console.log(data));
  }, []);

  async function readProfile() {
    const { did } = config;
    const [address] = await connect();
    const ceramic = new CeramicClient(endpoint);
    const idx = new IDX({ ceramic });
    console.log("idx daat----", ipfs, await idx.get("basicProfile", did.id));

    try {
      const data = await idx.get("basicProfile", `${address}@eip155:1`);
      console.log("data----", data);
      console.log(
        "ipfs.dht.findProvs(cid)----",
        ipfs.dht.findProvs(data.avatar[0])
      );
      let allPromises = [];
      for (let i = 0; i < data.avatar.length; i++) {
        console.log("data----", data);
        const link = data.avatar[i];
        const cid = new CID(link);

        const cidToV1 = cid.toV1();
        const newData = await followSecretPath(cidToV1, did);

        allPromises.push(newData);
      }

      try {
        const finalOutput = await Promise.all(allPromises);
        setImage(finalOutput);
        console.log("Here, we know that all promises resolved", finalOutput);
      } catch (e) {
        console.log("If any of the promises rejected, so will Promise.all");
      }
    } catch (error) {
      console.log("error: ", error);
      setLoaded(true);
    }
  }

  async function followSecretPath(cid, did) {
    const jwe = (await ipfs.dag.get(cid)).value;
    const cleartext = await did.decryptDagJWE(jwe);
    return cleartext;
  }

  async function addEncryptedObject(cleartext, dids) {
    console.log("ipfs-----", ipfs);
    const { did } = config;
    const jwe = await did.createDagJWE(cleartext, dids);
    return ipfs.dag.put(jwe, { storeCodec: "dag-jose", hashAlg: "sha2-256" });
  }

  async function updateProfile() {
    const { ceramic, did } = config;
    const idx = new IDX({ ceramic });
    const allpromises = [];

    for (let i = 0; i < state.length; i++) {
      const cid3 = await addEncryptedObject(state[i], [did.id]);
      allpromises.push(cid3.toString());
    }
    await idx.set("basicProfile", {
      name,
      avatar: allpromises,
    });
    console.log("allpromises-----", allpromises);
  }

  function getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  }

  const onChange = async (e) => {
    let allFiles = [];
    for (let i = 0; i < e.target.files.length; i++) {
      let data = getBase64(e.target.files[i]);
      allFiles.push(data);
    }
    try {
      const finalOutput = await Promise.all(allFiles);
      setState(finalOutput);
      console.log("Here, we know that all promises resolved", finalOutput);
    } catch (e) {
      console.log("If any of the promises rejected, so will Promise.all");
    }
  };

  return (
    <>
      <NavBar />
      <div className="App">
        <input placeholder="Name" onChange={(e) => setName(e.target.value)} />
        <input
          placeholder="Profile Image"
          onChange={(e) => setImage(e.target.value)}
        />
        <button onClick={updateProfile}>Set Profile</button>
        <button onClick={readProfile}>Read Profile</button>
        <input
          type="file"
          name="Asset"
          className="my-4"
          multiple
          onChange={onChange}
          paddingStart={0}
          mb="10px"
          border={0}
          id="uploadSheetInput"
          display="none"
          _focus={{ outline: 0 }}
        />
        {name && <h3>{name}</h3>}
        {image &&
          image?.length > 0 &&
          image.map((data, index) => (
            <img key={index} width="200px" height="200px" src={data} />
          ))}
        {!image && !name && loaded && <h4>No profile, please create one...</h4>}
      </div>
    </>
  );
}

export default App;
