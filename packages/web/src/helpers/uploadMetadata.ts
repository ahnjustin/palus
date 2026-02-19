import { immutable } from "@lens-chain/storage-client";
import { createThirdwebClient } from "thirdweb";
import { upload as uploadJson } from "thirdweb/storage";
import { CHAIN, THIRD_WEB_CLIENT_ID } from "@/data/constants";
import { storageClient } from "./storageClient";

interface MetadataPayload {
  [key: string]: unknown;
}

const uploadMetadata = async (
  data: MetadataPayload | null
): Promise<string> => {
  let uri: string | undefined;
  try {
    const upload = await storageClient.uploadAsJson(data, {
      acl: immutable(CHAIN.id)
    });
    uri = upload.uri;
  } catch (e) {
    console.error("Failed to upload metadata to grove", e);
  }

  if (!uri) {
    // Fallback to thirdweb if grove upload fails
    const thirdWebClient = createThirdwebClient({
      clientId: THIRD_WEB_CLIENT_ID
    });
    try {
      const file = new File([JSON.stringify(data)], "metadata.json", {
        type: "application/json"
      });
      const upload = await uploadJson({
        client: thirdWebClient,
        files: [file],
        uploadWithoutDirectory: true
      });
      uri = upload;
    } catch (e) {
      console.error("Failed to upload metadata to thirdweb", e);
      throw new Error("Failed to upload metadata");
    }
  }

  return uri;
};

export default uploadMetadata;
