import React from "react";
import { LogoIcon } from "../components/icons/logo";
import { Flex, Box, Heading } from "@chakra-ui/react";
function App() {
  return (
    <Flex h="90vh" w="100%" justifyContent="center" alignItems="center">
      <Flex flex="1" justifyContent="center">
        <LogoIcon />
      </Flex>
      <Flex flex="1">
        <Heading maxW="500px">
          The Decentralized Photo, Document and Video Vault with complete
          encryption
        </Heading>
      </Flex>
    </Flex>
  );
}

export default App;
