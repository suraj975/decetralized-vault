import { Box, Flex } from "@chakra-ui/react";
import { getFileType } from "../../helpers/utils";
import { FileLoaderWrapper } from "./file-loader-wrapper";
import { DocFileType, ImageFileType, VidieoFileType } from "./fileTypes";

export const UploadedFilesList = ({ filesList, isFileLoading }) => {
  if (!filesList.length) return;
  return (
    <Flex maxW={["100%", "1000px"]} overflow="scroll">
      {filesList.map((file, index) => {
        const fileType = getFileType(file);
        return (
          <Box key={index}>
            <Box
              position="relative"
              m="10px"
              mb="0px"
              width="300px"
              key={file?.createdAt}
              height="250px"
            >
              <VidieoFileType fileType={fileType} file={file} />
              <ImageFileType fileType={fileType} file={file} />
              <DocFileType fileType={fileType} file={file} />
              <FileLoaderWrapper loaded={isFileLoading} />
            </Box>
          </Box>
        );
      })}
    </Flex>
  );
};
