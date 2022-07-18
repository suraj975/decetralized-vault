import React, { useState } from "react";

import CeramicClient from "@ceramicnetwork/http-client";
import ThreeIdResolver from "@ceramicnetwork/3id-did-resolver";

import { EthereumAuthProvider, ThreeIdConnect } from "@3id/connect";
import { DID } from "dids";
import { IDX } from "@ceramicstudio/idx";
import * as IPFS from "ipfs-core";
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

function App() {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [state, setState] = useState();
  const [jwcID, setjwcid] = useState();
  const ipfs = useIpfs();
  async function connect() {
    const addresses = await window?.ethereu?.request({
      method: "eth_requestAccounts",
    });
    return addresses;
  }

  React.useEffect(() => {
    fetch("https://ipfs.io/ipfs/QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n")
      .then((res) => {
        return res.json();
      })
      .then((data) => console.log(data));
  }, []);

  async function readProfile() {
    const [address] = await connect();
    const ceramic = new CeramicClient(endpoint);
    // const ipfs = await IPFS.create({ repo: "ok" + Math.random() });
    const idx = new IDX({ ceramic });

    try {
      const data = await idx.get("basicProfile", `${address}@eip155:1`);
      console.log("data: ", data);
      const cid = new CID(data.avatar);

      const data2 = cid.toV1();
      console.log("Data------", data2);
      console.log((await ipfs.dag.get(data2)).value);

      if (data.name) setName(data.name);
      if (data.avatar) setImage(data.avatar);
    } catch (error) {
      console.log("error: ", error);
      setLoaded(true);
    }
  }

  async function followSecretPath(cid, did) {
    const jwe = (await ipfs.dag.get(cid)).value;
    const cleartext = await did.decryptDagJWE(jwe);
    console.log(cleartext);
    if (cleartext.prev) {
      await followSecretPath(cleartext.prev);
    }
  }

  async function addEncryptedObject(cleartext, dids, did) {
    const jwe = await did.createDagJWE(cleartext, dids);
    return ipfs.dag.put(jwe, { storeCodec: "dag-jose", hashAlg: "sha2-256" });
  }

  async function updateProfile() {
    const [address] = await connect();
    // const ipfs = await IPFS.create({ repo: "ok" + Math.random() });

    console.log("address---", address);
    const ceramic = new CeramicClient(endpoint);
    const threeIdConnect = new ThreeIdConnect();

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

    const idx = new IDX({ ceramic });

    const payload = state;

    // sign the payload as dag-jose
    const { jws, linkedBlock } = await ceramic.did.createDagJWS(payload, [
      did.id,
    ]);

    const cid3 = await addEncryptedObject(payload, [did.id], did);
    console.log("ci3---------->", cid3);
    await followSecretPath(cid3, did);

    // put the JWS into the ipfs dag
    const jwsCid = await ipfs.dag.put(jws, {
      format: "dag-jose",
      hashAlg: "sha2-256",
    });

    setjwcid(jwsCid);
    // window.localStorage.setItem("my-key", JSON.stringify(jwsCid));
    // put the payload into the ipfs dag
    const block = await ipfs.block.put(linkedBlock, jws.link);

    //const jwe = (await ipfs.dag.get(jwsCid)).value;
    // const cleartext = await did.decryptDagJWE(jwe);
    // console.log("jwsCid----", jwsCid.toString());
    // console.log("jwe----", jwe);
    // console.log("cleartext----", cleartext);

    await ipfs.dag
      .get(jwsCid, { path: "/link" })
      .then((b) => console.log(b.value));

    // console.log("jws----", jws, jws.link.toString());

    // console.log((await ipfs.dag.get(jws.link)).value);

    await idx.set("basicProfile", {
      name,
      avatar: jwsCid.toString(),
    });

    console.log("Profile updated!");
  }

  const onChange = (e) => {
    const file = e.target.files[0];
    console.log("file----", file);
    var reader = new FileReader();
    reader.onloadend = function () {
      setState(reader.result);
      console.log("file----", reader);
    };
    reader.readAsDataURL(file);
  };

  return (
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
        onChange={onChange}
        paddingStart={0}
        mb="10px"
        border={0}
        id="uploadSheetInput"
        display="none"
        _focus={{ outline: 0 }}
      />
      {name && <h3>{name}</h3>}
      {image && <img style={{ width: "400px" }} src={image} />}
      {!image && !name && loaded && <h4>No profile, please create one...</h4>}
    </div>
  );
}

export default App;
