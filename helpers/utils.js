import { auth } from "../hooks/connections";

export async function addEncryptedObject(cleartext, dids, config, ipfs) {
  const { did } = config;
  console.log("did--upload-----", did);
  const jwe = await did.createDagJWE(cleartext, dids);
  const data = ipfs.dag.put(jwe, {
    storeCodec: "dag-jose",
    hashAlg: "sha2-256",
    pin: true,
  });
  console.log("did--acciount data data-----", jwe);
  return data;
}

export function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

export const segregateFileInformation = (fileData, fileNames) => {
  return fileData?.reduce((acc, curr, index) => {
    acc[curr] = {
      ...fileNames[index],
      cid: curr,
    };
    return acc;
  }, {});
};

export const getFileType = (file) => {
  return file.split(";")[0].split(":")[1].split("/")[0];
};

export const unpinCids = async (cid) => {
  const res = await fetch(
    `https://ipfs.infura.io:5001/api/v0/pin/rm?arg=${cid}`,
    {
      headers: {
        Authorization: auth,
      },
      method: "POST",
    }
  );
  console.log(res.json());
};
