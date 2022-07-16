import { Flex, Button, Text, Divider } from "@chakra-ui/react";
import React from "react";

export default function UploadFileContent({ inputFileRef }) {
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
}
