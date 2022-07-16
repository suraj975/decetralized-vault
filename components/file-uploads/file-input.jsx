import { Input } from "@chakra-ui/react";

export const FileInput = ({ onChange, inputFileRef }) => {
  return (
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
  );
};
