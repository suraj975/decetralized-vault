import React from "react";
import { CeramicConnectionContext } from "./_app";
import { Flex, Box, Image } from "@chakra-ui/react";
import { IDX } from "@ceramicstudio/idx";
const CID = require("cids");
function Account() {
  const [config, ipfs] = React.useContext(CeramicConnectionContext);
  const [loaded, setLoaded] = React.useState();
  const [image, setImage] = React.useState();

  async function followSecretPath(cid, did) {
    const jwe = (await ipfs.dag.get(cid)).value;
    const cleartext = await did.decryptDagJWE(jwe);
    return cleartext;
  }

  async function readProfile() {
    const { did, ceramic, address } = config;
    const idx = new IDX({ ceramic });

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

  React.useEffect(() => {
    if (!ipfs || !config) return;
    readProfile();
  }, [ipfs, config]);
  return (
    <Flex>
      {image?.length > 0 && (
        <Flex flex="1" overflowY="scroll" height="90vh">
          <Flex flexWrap="wrap">
            {image.map((data, index) => {
              const fileType = data.split(";")[0].split(":")[1].split("/")[0];
              return (
                <Box marginX="10px" maxW="200px" height="200px">
                  <a download href={data}>
                    {fileType === "video" && (
                      <video height="100%" controls="controls">
                        <source src={data} type="video/mp4" />
                      </video>
                    )}
                    {fileType === "image" && (
                      <Image
                        objectFit="cover"
                        key={index}
                        height="100%"
                        src={data}
                        download="myimage"
                      />
                    )}
                  </a>
                </Box>
              );
            })}
          </Flex>
        </Flex>
      )}
    </Flex>
  );
}

export default Account;
