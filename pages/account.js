import React from "react";
import { CeramicConnectionContext } from "./_app";
import { Flex, Box, Text } from "@chakra-ui/react";
import { IDX } from "@ceramicstudio/idx";
import CID from "cids";
import {
  DocFileType,
  ImageFileType,
  VidieoFileType,
} from "../components/file-uploads/fileTypes";
import { DownloadIcon, DeleteIcon } from "@chakra-ui/icons";
import { unpinCids } from "../helpers/utils";

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

      if (!data?.files) return;
      setLoaded(true);
      let allPromises = [];
      const uploadedCidsList = Object.keys(data?.files);
      const uploadedCidsData = Object.values(data?.files);
      for (let i = 0; i < uploadedCidsList.length; i++) {
        const link = uploadedCidsData[i].cid;
        const cid = new CID(link);
        const cidToV1 = cid.toV1();
        const newData = await followSecretPath(cidToV1, did);
        allPromises.push({ imageBytes: newData, ...uploadedCidsData[i] });
      }
      setImage(allPromises);
      setLoaded(false);
    } catch (error) {
      console.log("error: ", error);
    }
  }

  const deleteFile = async (cid, index) => {
    const { ceramic, address } = config;
    const idx = new IDX({ ceramic });
    const data = await idx.get("basicProfile", `${address}@eip155:1`);
    delete data.files[cid];
    await unpinCids(cid);
    await idx.set("basicProfile", {
      files: data?.files,
    });
    let imageFiles = [...image];
    imageFiles.splice(index, 1);
    setImage(imageFiles);
    console.log("imageFiles----", imageFiles);
  };

  React.useEffect(() => {
    if (!ipfs || !config) return;
    readProfile();
  }, [config?.address]);
  console.log("image-----", image);
  return (
    <Flex w="100%" justifyContent="center" alignItems="center">
      {image?.length > 0 && (
        <Flex w="100%" overflowY="scroll" height="90vh">
          <Flex w="100%" flexWrap="wrap" justifyContent="center">
            {image.map((data, index) => {
              const fileType = data?.type?.split("/")[0];
              const date = new Date(data?.createdAt).toLocaleDateString(
                "en-US"
              );
              console.log("data----", data?.createdAt);
              return (
                <Box key={data?.cid} mb="10" marginStart="2" color="white">
                  <Flex
                    bg="#202023"
                    key={data?.createdAt}
                    marginX="10px"
                    w="400px"
                    flexDir="column"
                    alignItems="center"
                    height="200px"
                    overflowY="scroll"
                  >
                    <VidieoFileType
                      fileType={fileType}
                      file={data?.imageBytes}
                    />
                    <ImageFileType
                      fileType={fileType}
                      file={data?.imageBytes}
                    />
                    <DocFileType fileType={fileType} file={data?.imageBytes} />
                  </Flex>
                  <Flex paddingStart="2" bg="#171923">
                    <Box w="100%">
                      <Text
                        w="150px"
                        textOverflow="ellipsis"
                        whiteSpace="nowrap"
                        overflow="hidden"
                      >
                        {data?.name}
                      </Text>
                      <Box w="100%" bg="#171923" paddingStart="2">
                        {date}
                      </Box>
                    </Box>
                    <Flex px="2">
                      <DeleteIcon
                        cursor="pointer"
                        mx="2"
                        h="40px"
                        onClick={() => deleteFile(data?.cid, index)}
                        w="22px"
                        color="#c1a25e"
                      />
                      <a download href={data?.imageBytes}>
                        <DownloadIcon h="40px" w="24px" color="#c1a25e" />
                      </a>
                    </Flex>
                  </Flex>
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
