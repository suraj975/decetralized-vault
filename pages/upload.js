import React, { useState } from "react";
import { Flex, Button, useToast } from "@chakra-ui/react";
import { IDX } from "@ceramicstudio/idx";
import { CeramicConnectionContext } from "./_app";
import UploadFileContent from "../components/file-uploads/uploader";
import {
  addEncryptedObject,
  getBase64,
  segregateFileInformation,
} from "../helpers/utils";
import { UploadedFilesList } from "../components/file-uploads/uploaded-file-list";
import { FileInput } from "../components/file-uploads/file-input";

function Upload() {
  const [fileNames, setFileNames] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [state, setState] = useState([]);
  const inputFileRef = React.useRef(null);
  const toast = useToast();
  const [config, ipfs] = React.useContext(CeramicConnectionContext);

  async function updateProfile() {
    const { ceramic, did, address } = config;
    const idx = new IDX({ ceramic });
    console.log("idx------", idx);
    const allpromises = [];
    setLoaded(true);

    for (let i = 0; i < state.length; i++) {
      const cid3 = await addEncryptedObject(state[i], [did.id], config, ipfs);
      console.log("cid3------", cid3);
      allpromises.push(cid3.toString());
    }
    const previousData = await idx.get("basicProfile", `${address}@eip155:1`);
    console.log("basicProfile", previousData);

    if (previousData?.files) {
      const files = segregateFileInformation(allpromises, fileNames);
      await idx.set("basicProfile", {
        files: { ...previousData?.files, ...files },
      });
    } else {
      const files = segregateFileInformation(allpromises, fileNames);
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

  const onChange = async (e) => {
    const { ceramic, did, address } = config;
    const idx = new IDX({ ceramic });
    let filesCidsPromises = [];
    let fileName = [];
    const previousData = await idx.get("basicProfile", `${address}@eip155:1`);
    console.log("basicProfile", previousData);
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
      toast({
        description: e,
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
        <UploadedFilesList filesList={state} isFileLoading={loaded} />
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
          <FileInput onChange={onChange} inputFileRef={inputFileRef} />
          <Button
            colorScheme="orange"
            mt="20px"
            w={["95%", "100%"]}
            isDisabled={!ipfs}
            onClick={updateProfile}
          >
            Set Profile
          </Button>
        </Flex>
      </Flex>
    </React.Fragment>
  );
}
export default Upload;
