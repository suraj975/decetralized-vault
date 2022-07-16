import { Image } from "@chakra-ui/react";

export const VidieoFileType = ({ fileType, file }) => {
  if (fileType !== "video") return;
  return (
    <video controls="controls">
      <source src={file} type="video/mp4" height="250px" />
    </video>
  );
};
export const ImageFileType = ({ fileType, file }) => {
  if (fileType !== "image") return;
  return <Image objectFit="cover" height="100%" src={file} />;
};
export const DocFileType = ({ fileType, file }) => {
  if (fileType !== "application") return;
  return <embed src={file} height="100%" type="application/pdf" />;
};
