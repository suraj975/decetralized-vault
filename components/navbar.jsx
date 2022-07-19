import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  useDisclosure,
  useColorModeValue,
  Stack,
  Text,
  useToast,
  Avatar,
} from "@chakra-ui/react";
import Link from "next/link";
import React from "react";
import { HamburgerIcon, CloseIcon } from "@chakra-ui/icons";
import { NameLogoIcon } from "./icons/name-logo";
import { CeramicConnectionContext } from "../pages/_app";

const Links = [
  { name: "Home", route: "/" },
  { name: "Upload", route: "/upload" },
  { name: "Account", route: "/account" },
];

const AuthRoutes = ["Upload", "Account"];

const NavLink = ({ children, link }) => (
  <Link
    style={{ padding: "10px" }}
    _hover={{
      textDecoration: "none",
      bg: useColorModeValue("gray.200", "gray.700"),
    }}
    href={link}
  >
    {children}
  </Link>
);

export default function NavBar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [config] = React.useContext(CeramicConnectionContext);
  const toast = useToast();
  const handleConnect = () => {
    if (typeof window.ethereum == "undefined") {
      toast({
        description: "MetaMask is not available",
        status: "error",
        position: "bottom-right",
      });
    }
  };
  return (
    <>
      <Box bg={useColorModeValue("gray.100", "gray.900")} px={4}>
        <Flex h={16} alignItems={"center"} justifyContent={"space-between"}>
          <IconButton
            size={"md"}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={"Open Menu"}
            display={{ md: "none" }}
            onClick={isOpen ? onClose : onOpen}
          />
          <HStack spacing={8} alignItems={"center"}>
            <Box>
              <NameLogoIcon />
            </Box>
            <HStack
              as={"nav"}
              spacing={4}
              display={{ base: "none", md: "flex" }}
            >
              x
              {Links.map((link) => {
                if (!config?.address && AuthRoutes.includes(link.name))
                  return <></>;
                return (
                  <NavLink key={link} link={link.route}>
                    {link.name}
                  </NavLink>
                );
              })}
            </HStack>
          </HStack>
          {!config && (
            <Flex alignItems={"center"}>
              <Button
                onClick={handleConnect}
                variant={"solid"}
                colorScheme={"teal"}
                size={"sm"}
                mr={4}
              >
                Connect
              </Button>
            </Flex>
          )}
          {config && (
            <Flex>
              <Text
                overflow="hidden"
                whiteSpace="nowrap"
                textOverflow="ellipsis"
                w="100px"
                mr="2"
                borderRadius="10px"
                p="1"
                px="2"
                bg="gray.800"
              >
                {config?.address}
              </Text>
              <Avatar size="sm" name="" src="" />
            </Flex>
          )}
        </Flex>

        {isOpen ? (
          <Box pb={4} display={{ md: "none" }}>
            <Stack as={"nav"} spacing={4}>
              {Links.map((link) => (
                <NavLink key={link}>{link.name}</NavLink>
              ))}
            </Stack>
          </Box>
        ) : null}
      </Box>
    </>
  );
}
