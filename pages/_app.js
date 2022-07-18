import "../styles/globals.css";
import { ChakraProvider, extendTheme, ColorModeScript } from "@chakra-ui/react";
import NavBar from "../components/navbar";
import React from "react";
import { useAccountCeramicConnection, useIpfs } from "../hooks/connections";
import { readProfile } from "./account";

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
  const [decryptedData, setDecryptedData] = React.useState({});
  useAccountCeramicConnection(config, setConfig);
  const ipfs = useIpfs();
  React.useEffect(() => {
    if (!config?.did?.id || !ipfs) return;
    const getDecryptedData = async () => {
      const decryptData = await readProfile(config, ipfs);
      setDecryptedData(decryptData);
    };
    getDecryptedData();
  }, [config, ipfs]);
  return (
    <ChakraProvider>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <CeramicConnectionContext.Provider
        value={[config, ipfs, decryptedData, setDecryptedData]}
      >
        <NavBar />
        <Component {...pageProps} theme={theme} />
      </CeramicConnectionContext.Provider>
    </ChakraProvider>
  );
}

export default MyApp;
