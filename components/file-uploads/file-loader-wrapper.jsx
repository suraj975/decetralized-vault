import { Flex, Spinner } from "@chakra-ui/react";

export const FileLoaderWrapper = ({ loaded }) => {
  if (!loaded) return;
  return (
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
  );
};
