import "../styles/globals.css";
import { ChakraProvider, extendTheme, ColorModeScript } from "@chakra-ui/react";
import NavBar from "../components/navbar";
import React from "react";
import { useAccountCeramicConnection, useIpfs } from "../hooks/connections";

// 2. Add your color mode config
const config = {
  initialColorMode: "dark",
  useSystemColorMode: false,
};

// 3. extend the theme
const theme = extendTheme({ config });
export const CeramicConnectionContext = React.createContext(null);

function MyApp({ Component, pageProps }) {
  const [config, setConfig] = React.useState();
  useAccountCeramicConnection(config, setConfig);
  const ipfs = useIpfs();
  return (
    <ChakraProvider>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <CeramicConnectionContext.Provider value={[config, ipfs]}>
        <NavBar />
        <Component {...pageProps} theme={theme} />
      </CeramicConnectionContext.Provider>
    </ChakraProvider>
  );
}

export default MyApp;
