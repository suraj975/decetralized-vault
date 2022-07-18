import React from "react";
import { LogoIcon } from "../components/icons/logo";
import { Flex, Box, Heading, Image, Text } from "@chakra-ui/react";
import { InfuraLogoIcon } from "../components/icons/infura";
import { IPFSLogoIcon } from "../components/icons/ipfsLogo";
function App() {
  return (
    <Flex h="90vh" w="100%" justifyContent="center" alignItems="center">
      <Flex flexDir="column" flex="1" alignItems="center">
        <LogoIcon />
        <Flex mt="10" w="100%" justifyContent="center" alignItems="center">
          <IPFSLogoIcon
            style={{ marginRight: "10px" }}
            width="100px"
            height="100px"
          />
          <InfuraLogoIcon
            style={{ marginRight: "10px" }}
            width="60px"
            height="60px"
          />
          <Image
            w="60px"
            h="60px"
            mr="10px"
            src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
          />
          <Image
            w="60px"
            h="60px"
            src="https://blog.ceramic.network/content/images/2020/11/ceramic-no-shadow.png"
          />
        </Flex>
      </Flex>
      <Flex flexDir="column" flex="1">
        <Heading maxW="700px">
          A Decentralized Vault App to Protect Private Photos, Videos & Notes
        </Heading>
        <Text mt="10" maxW="700px">
          D-Vault is a personal vault web app designed to hide sensitive data
          with full encryption. You can hide your personal photos and documents
          to protect them from any unwanted intruders.
        </Text>
      </Flex>
    </Flex>
  );
}

export default App;
