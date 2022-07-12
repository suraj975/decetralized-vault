import "../styles/globals.css";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import NavBar from "../components/navbar";
import React from "react";
import { useAccountCeramicConnection, useIpfs } from "../hooks/connections";

const colors = {
  brand: {
    900: "#1a365d",
    800: "#153e75",
    700: "#2a69ac",
  },
};

export const CeramicConnectionContext = React.createContext(null);

const theme = extendTheme({ colors });
function MyApp({ Component, pageProps }) {
  const [config, setConfig] = React.useState();
  useAccountCeramicConnection(config, setConfig);
  const ipfs = useIpfs();
  return (
    <ChakraProvider>
      <CeramicConnectionContext.Provider value={[config, ipfs]}>
        <NavBar />
        <Component {...pageProps} theme={theme} />
      </CeramicConnectionContext.Provider>
    </ChakraProvider>
  );
}

export default MyApp;
