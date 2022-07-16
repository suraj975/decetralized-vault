import React from "react";
import { CeramicConnectionContext } from "./_app";
import { Flex, Box, Image } from "@chakra-ui/react";
import { IDX } from "@ceramicstudio/idx";
import CID from "cids";

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
      console.log("Data----->", data);
      // if (!data?.files) return;
      setLoaded(true);
      let allPromises = [];
      const uploadedCidsList = Object.keys(data?.files);
      const uploadedCidsData = Object.values(data?.files);
      for (let i = 0; i < uploadedCidsList.length; i++) {
        const link = uploadedCidsData[i].cid;
        const cid = new CID(link);
        const cidToV1 = cid.toV1();
        console.log("link----->", link, cid, cidToV1);
        const newData = await followSecretPath(cidToV1, did);
        console.log("newData----->", newData);
        allPromises.push({ imageBytes: newData, ...uploadedCidsData[i] });
      }
      console.log("allPromises----->", allPromises);
      setImage(allPromises);
      setLoaded(false);
    } catch (error) {
      console.log("error: ", error);
    }
  }

  React.useEffect(() => {
    if (!ipfs || !config) return;
    console.log("renderr----", ipfs, config);
    readProfile();
  }, [config?.address]);
  return (
    <Flex>
      {image?.length > 0 && (
        <Flex flex="1" overflowY="scroll" height="90vh">
          <Flex flexWrap="wrap">
            {image.map((data) => {
              const fileType = data?.type?.split("/")[0];
              return (
                <Box
                  key={data?.createdAt}
                  marginX="10px"
                  maxW="200px"
                  height="200px"
                >
                  <a download href={data?.imageBytes}>
                    {fileType === "video" && (
                      <video height="100%" controls="controls">
                        <source src={data?.imageBytes} type="video/mp4" />
                      </video>
                    )}
                    {fileType === "image" && (
                      <Image
                        objectFit="cover"
                        height="100%"
                        src={data?.imageBytes}
                        download="myimage"
                      />
                    )}
                    {fileType === "application" && (
                      <Image
                        objectFit="cover"
                        height="100%"
                        src={data?.imageBytes}
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
