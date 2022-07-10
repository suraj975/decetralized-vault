import React from "react";
import * as IPFS from "ipfs-core";
import * as dagJose from "dag-jose";
import { DID } from "dids";
import { Ed25519Provider } from "key-did-provider-ed25519";
import KeyResolver from "key-did-resolver";
import { randomBytes } from "@stablelib/random";

function IPFS_PRIVATE_UPLOAD() {
  const [state, setState] = React.useState();
  const ipfsInstance = async () => {
    const ipfs = await IPFS.create({ repo: "ok" + Math.random() });

    const seed = randomBytes(32);

    // create did instance
    const provider = new Ed25519Provider(seed);

    const did = new DID({ provider, resolver: KeyResolver.getResolver() });
    await did.authenticate();

    // const seed2 = randomBytes(32);

    // // create did instance
    // const provider2 = new Ed25519Provider(seed2);

    // const did2 = new DID({ provider2, resolver: KeyResolver.getResolver() });

    // await did2.authenticate();

    window.did = did;

    console.log("Connected with DID:", did);

    async function addSignedObject(payload) {
      // sign the payload as dag-jose
      const { jws, linkedBlock } = await did.createDagJWS(payload);

      // put the JWS into the ipfs dag
      const jwsCid = await ipfs.dag.put(jws, {
        storeCodec: dagJose.name,
        hashAlg: "sha2-256",
      });

      // put the payload into the ipfs dag
      await ipfs.block.put(linkedBlock, jws.link);

      return jwsCid;
    }
    const cid1 = await addSignedObject({ image: state });

    // Log the DagJWS:
    console.log((await ipfs.dag.get(cid1)).value);

    await ipfs.dag
      .get(cid1, { path: "/link" })
      .then((b) => console.log(b.value));

    // Create another signed object that links to the previous one
    const cid2 = await addSignedObject({
      hello: "getting the hang of this",
      prev: cid1,
    });

    // Log the new payload:
    await ipfs.dag
      .get(cid2, { path: "/link" })
      .then((b) => console.log("firstData", b.value));

    // > {
    // >   hello: 'getting the hang of this'
    // >   prev: CID(bagcqcerappi42sb4uyrjkhhakqvkiaibkl4pfnwpyt53xkmsbkns4y33ljzq)
    // > }

    // // Log the old payload:
    // await ipfs.dag
    //   .get(cid2, { path: "/link/prev/link" })
    //   .then((b) => console.log("secondData", b.value));
    // // > { hello: 'world' }
    const jws1 = await ipfs.dag.get(cid1);
    const jws2 = await ipfs.dag.get(cid2);

    const signingDID1 = await did.verifyJWS(jws1.value);
    const data = await did.verifyJWS(jws2.value);
    console.log("cid1======>", signingDID1, jws1);
    console.log("newd dadaata----", await did.decryptDagJWE(jws1.value));
  };

  React.useEffect(() => {
    if (!state) return;
    console.log("state---", state);

    ipfsInstance();
  }, [state]);

  const onChange = (e) => {
    const file = e.target.files[0];
    var reader = new FileReader();
    reader.onloadend = function () {
      setState(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <div>Suraj</div>
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
    </>
  );
}

export default IPFS_PRIVATE_UPLOAD;
