import React, { useState } from "react";
import {
  Flex,
  Box,
  Text,
  Button,
  Image,
  Spinner,
  Input,
  Divider,
  useToast,
} from "@chakra-ui/react";
import { IDX } from "@ceramicstudio/idx";
import { CeramicConnectionContext } from "./_app";

const UploadFileContent = ({ inputFileRef }) => {
  return (
    <Flex
      justifyContent="center"
      alignItems="flex-start"
      w="100%"
      flexDir="column"
      paddingX={[3, 0]}
      cursor="pointer"
      onClick={() => inputFileRef?.current?.click()}
    >
      <Button
        color="orange.200"
        padding="50px !important"
        variant="outline"
        w="100%"
        paddingX={[3, 0]}
      >
        Attach File
      </Button>
      <Text
        paddingX={[3, 0]}
        color="orange.200"
        textAlign="left"
        mt="sm"
        fontSize="12px"
      >
        Only JPG, PNG, XLS, CVS and PDF formats
      </Text>
      <Divider bg="orange" mt="10px" />
    </Flex>
  );
};

function Upload() {
  const [fileNames, setFileNames] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [state, setState] = useState([]);
  const inputFileRef = React.useRef(null);
  const toast = useToast();
  const [config, ipfs] = React.useContext(CeramicConnectionContext);

  async function addEncryptedObject(cleartext, dids) {
    const { did } = config;
    const jwe = await did.createDagJWE(cleartext, dids);
    console.log("jwe-----", jwe);
    return ipfs.dag.put(jwe, {
      storeCodec: "dag-jose",
      hashAlg: "sha2-256",
      pin: true,
    });
  }

  async function updateProfile() {
    const { ceramic, did, address } = config;
    const idx = new IDX({ ceramic });
    const allpromises = [];
    setLoaded(true);

    for (let i = 0; i < state.length; i++) {
      const cid3 = await addEncryptedObject(state[i], [did.id]);
      allpromises.push(cid3.toString());
    }
    console.log("loadede----", cid3);
    const previousData = await idx.get("basicProfile", `${address}@eip155:1`);
    console.log("basicProfile", previousData);

    const segregateFileInformation = (fileData) => {
      return fileData?.reduce((acc, curr, index) => {
        acc[curr] = {
          ...fileNames[index],
          cid: curr,
        };
        return acc;
      }, {});
    };

    if (previousData?.files) {
      const files = segregateFileInformation(allpromises);
      await idx.set("basicProfile", {
        files: { ...previousData?.files, ...files },
      });
    } else {
      const files = segregateFileInformation(allpromises);
      await idx.set("basicProfile", {
        files,
      });
    }

    setLoaded(false);
    toast({
      description: "successfully uploaded",
      status: "success",
      position: "bottom-right",
    });
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
    let filesCidsPromises = [];
    let fileName = [];
    for (let i = 0; i < e.target.files.length; i++) {
      let data = getBase64(e.target.files[i]);
      fileName.push({
        name: e.target.files[i]?.name,
        type: e.target.files[i]?.type,
        size: e.target.files[i]?.size,
        createdAt: e.target.files[i]?.lastModified,
      });
      filesCidsPromises.push(data);
    }
    try {
      const finalOutput = await Promise.all(filesCidsPromises);
      setFileNames(fileName);
      setState(finalOutput);
      console.log("Here, we know that all promises resolved", finalOutput);
    } catch (e) {
      console.log("If any of the promises rejected, so will Promise.all");
      toast({
        description: "upload error",
        status: "error",
        position: "bottom-right",
      });
    }
  };
  return (
    <React.Fragment>
      <Flex
        minHeight="80vh"
        width="100%"
        className="App"
        alignItems="center"
        justifyContent="center"
        flexDirection="column"
      >
        <Flex maxW={["100%", "1000px"]} overflow="scroll">
          {state?.length > 0 &&
            state.map((data, index) => {
              const fileType = data.split(";")[0].split(":")[1].split("/")[0];
              return (
                <Box>
                  <Box
                    position="relative"
                    m="10px"
                    mb="0px"
                    width="300px"
                    height="250px"
                  >
                    {fileType === "video" && (
                      <video controls="controls">
                        <source src={data} type="video/mp4" height="250px" />
                      </video>
                    )}
                    {fileType === "image" && (
                      <Image
                        objectFit="cover"
                        key={index}
                        height="100%"
                        src={data}
                      />
                    )}
                    {loaded && (
                      <Flex
                        position="absolute"
                        top="0px"
                        width="100%"
                        height="100%"
                        bg="gray.100"
                        opacity="0.5"
                        justifyContent="center"
                        alignItems="center"
                      >
                        <Spinner color="orange.800" />
                      </Flex>
                    )}
                  </Box>
                </Box>
              );
            })}
        </Flex>
        <Flex
          width="100%"
          height="auto"
          marginX={["1px", "20px"]}
          mt="10"
          flexDirection="column"
          className="App"
          justifyContent="center"
          alignItems="center"
          maxW="1000px"
        >
          <UploadFileContent inputFileRef={inputFileRef} />
          <Button
            colorScheme="orange"
            mt="20px"
            w={["95%", "100%"]}
            isDisabled={!ipfs}
            onClick={updateProfile}
          >
            Set Profile
          </Button>
          <Input
            type="file"
            name="Asset"
            className="my-4"
            multiple
            onChange={onChange}
            paddingStart={0}
            mb="10px"
            border={0}
            ref={inputFileRef}
            id="uploadSheetInput"
            display="none"
            _focus={{ outline: 0 }}
          />
        </Flex>
      </Flex>
    </React.Fragment>
  );
}

export default Upload;
