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
const CID = require("cids");

const UploadFileContent = ({ inputFileRef }) => {
  return (
    <Flex
      justifyContent="center"
      alignItems="flex-start"
      w="100%"
      flexDir="column"
      cursor="pointer"
      onClick={() => inputFileRef?.current?.click()}
    >
      <Button
        color="orange.200"
        padding="50px !important"
        variant="outline"
        w="100%"
      >
        Attach File
      </Button>
      <Text color="orange.200" textAlign="left" mt="sm" fontSize="12px">
        Only JPG, PNG, XLS, CVS and PDF formats
      </Text>
      <Divider bg="orange" mt="10px" />
    </Flex>
  );
};

function Upload() {
  const [name, setName] = useState("");
  const [image, setImage] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [state, setState] = useState([]);
  const inputFileRef = React.useRef(null);
  const toast = useToast();
  const [config, ipfs] = React.useContext(CeramicConnectionContext);

  console.log("currency---->", config);

  React.useEffect(() => {
    fetch("https://ipfs.io/ipfs/QmdfTbBqBPQ7VNxZEYEj14VmRuZBkqFbiwReogJgS1zR1n")
      .then((res) => {
        return res.json();
      })
      .then((data) => console.log(data));
  }, []);

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
    setLoaded(true);

    for (let i = 0; i < state.length; i++) {
      const cid3 = await addEncryptedObject(state[i], [did.id]);
      allpromises.push(cid3.toString());
    }
    await idx.set("basicProfile", {
      name,
      avatar: allpromises,
    });
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
    let allFiles = [];
    for (let i = 0; i < e.target.files.length; i++) {
      let data = getBase64(e.target.files[i]);
      allFiles.push(data);
    }
    console.log("allFiles------>", allFiles);
    try {
      const finalOutput = await Promise.all(allFiles);
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
        justifyContent="Center"
        flexDirection={["column", "row"]}
      >
        <Flex
          height="auto"
          maxW="800px"
          marginX={["5px", "20px"]}
          flex="1"
          flexDirection="column"
          className="App"
          justifyContent="center"
          alignItems="center"
        >
          <UploadFileContent inputFileRef={inputFileRef} />
          <Button
            colorScheme="orange"
            mt="20px"
            w="100%"
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
        {state?.length > 0 && (
          <Flex flex="1" overflowY="scroll" height="90vh">
            <Flex flexWrap="wrap">
              {state.map((data, index) => {
                const fileType = data.split(";")[0].split(":")[1].split("/")[0];
                return (
                  <Box
                    position="relative"
                    m="10px"
                    width={["100%", "250px"]}
                    height="250px"
                  >
                    {fileType === "video" && (
                      <video controls="controls">
                        <source src={data} type="video/mp4" />
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
                );
              })}
            </Flex>
          </Flex>
        )}
      </Flex>
    </React.Fragment>
  );
}

export default Upload;
