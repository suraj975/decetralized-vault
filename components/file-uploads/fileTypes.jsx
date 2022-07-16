import { Image } from "@chakra-ui/react";

export const VidieoFileType = ({ fileType, file }) => {
  if (fileType !== "video") return;
  return (
    <video controls="controls">
      <source src={file} type="video/mp4" w="400px" height="200px" />
    </video>
  );
};
export const ImageFileType = ({ fileType, file }) => {
  if (fileType !== "image") return;
  return <Image objectFit="cover" w="400px" height="200px" src={file} />;
};
export const DocFileType = ({ fileType, file }) => {
  if (fileType !== "application") return;
  return <embed src={file} w="400px" height="200px" type="application/pdf" />;
};
