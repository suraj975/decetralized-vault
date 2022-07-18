import React from "react";
import { CeramicConnectionContext } from "./_app";
import { Flex, Box, Text, Spinner } from "@chakra-ui/react";
import { IDX } from "@ceramicstudio/idx";
import CID from "cids";
import {
  DocFileType,
  ImageFileType,
  VidieoFileType,
} from "../components/file-uploads/fileTypes";
import { DownloadIcon, DeleteIcon } from "@chakra-ui/icons";
import { unpinCids } from "../helpers/utils";

async function followSecretPath(cid, did, ipfs) {
  const jwe = (await ipfs.dag.get(cid)).value;
  const cleartext = await did.decryptDagJWE(jwe);
  return cleartext;
}

export async function readProfile(config, ipfs) {
  const { did, ceramic, address } = config;
  const idx = new IDX({ ceramic });
  try {
    const data = await idx.get("basicProfile", `${address}@eip155:1`);
    if (!data?.files) return;

    let allPromises = [];
    const uploadedCidsList = Object.keys(data?.files);
    const uploadedCidsData = Object.values(data?.files);

    for (let i = 0; i < uploadedCidsList.length; i++) {
      const link = uploadedCidsData[i].cid;
      const cid = new CID(link);
      const cidToV1 = cid.toV1();
      const newData = await followSecretPath(cidToV1, did, ipfs);
      allPromises.push({ imageBytes: newData, ...uploadedCidsData[i] });
    }
    return allPromises;
  } catch (error) {
    console.log("error: ", error);
  }
}

const Loader = () => {
  return (
    <Flex h="90vh" justifyContent="center" alignItems="center">
      <Spinner />
    </Flex>
  );
};

const ImageLoader = () => {
  return (
    <Flex
      border="1px solid"
      borderColor="gray.700"
      bg="#202023"
      w="400px"
      height="250px"
      justifyContent="center"
      alignItems="center"
    >
      <Spinner />
    </Flex>
  );
};

function Account() {
  const [config, ipfs, decryptedData, setDecryptedData] = React.useContext(
    CeramicConnectionContext
  );
  const [loaded, setLoaded] = React.useState();
  const [image, setImage] = React.useState(decryptedData);

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
    setDecryptedData(imageFiles);
    setImage(imageFiles);
  };

  React.useEffect(() => {
    if (!ipfs || !config) return;
    const captureEncrptedData = async () => {
      setLoaded(true);
      const data = await readProfile(config, ipfs);
      setImage(data);
      setDecryptedData(data);
      setLoaded(false);
    };
    captureEncrptedData();
  }, [config?.address]);
  return (
    <Flex p="10px" w="100%" justifyContent="center" alignItems="center">
      {loaded && !Object.keys(decryptedData).length && <Loader />}
      {image?.length > 0 && (
        <Flex w="100%" overflowY="scroll" height="90vh">
          <Flex w="100%" flexWrap="wrap" justifyContent="center">
            {image.map((data, index) => {
              const fileType = data?.type?.split("/")[0];
              const date = new Date(data?.createdAt).toLocaleDateString(
                "en-US"
              );
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
            {loaded && Object.keys(decryptedData).length > 0 && <ImageLoader />}
          </Flex>
        </Flex>
      )}
    </Flex>
  );
}

export default Account;
