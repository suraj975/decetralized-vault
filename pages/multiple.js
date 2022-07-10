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
  const [image, setImage] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [state, setState] = useState([]);
  const ipfs = useIpfs();
  async function connect() {
    const addresses = await window.ethereum.request({
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
    const idx = new IDX({ ceramic });

    try {
      const data = await idx.get("basicProfile", `${address}@eip155:1`);
      console.log("Data----", data, data?.avatar?.length);
      let allPromises = [];
      debugger;
      for (let i = 0; i < 2; i++) {
        const link = data.avatar[i];

        console.log("link----", link);
        const cid = new CID(link);
        const cidToV1 = cid.toV1();
        const newData = await ipfs.dag.get(cidToV1);
        console.log("newData----", newData);
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

  async function encryptingfiles(did, payload, ceramic) {
    // sign the payload as dag-jose
    const { jws, linkedBlock } = await ceramic.did.createDagJWS(payload, [
      did.id,
    ]);
    // put the JWS into the ipfs dag
    const jwsCid = await ipfs.dag.put(jws, {
      format: "dag-jose",
      hashAlg: "sha2-256",
    });

    // put the payload into the ipfs dag
    const block = await ipfs.block.put(linkedBlock, jws.link);

    console.log((await ipfs.dag.get(jwsCid)).value);

    await ipfs.dag
      .get(jwsCid, { path: "/link" })
      .then((b) => console.log(b.value));

    console.log((await ipfs.dag.get(jws.link)).value);

    return jws.link.toString();
  }

  async function updateProfile() {
    const [address] = await connect();
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
    const allpromises = [];

    for (let i = 0; i < state.length; i++) {
      const result = encryptingfiles(did, state[i], ceramic);
      allpromises.push(result);
    }

    console.log("allpromises-----", allpromises);

    try {
      const finalOutput = await Promise.all(allpromises);
      console.log("Here, we know that all promises resolved", finalOutput);
      await idx.set("basicProfile", {
        name,
        avatar: finalOutput,
      });
    } catch (e) {
      console.log("If any of the promises rejected, so will Promise.all");
    }
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
  console.log(image[0]);
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
        image.map(({ value }) => (
          <img width="200px" height="200px" src={value} />
        ))}
      {!image && !name && loaded && <h4>No profile, please create one...</h4>}
    </div>
  );
}

export default App;
