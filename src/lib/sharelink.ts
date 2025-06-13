import { nanoid } from "nanoid";
const FILE_NAME_KEY = "parthib-anysite-share-filename";

function getShareFilename(): string {
  let filename = localStorage.getItem(FILE_NAME_KEY);

  if (!filename) {
    filename = `${nanoid()}`;
    localStorage.setItem(FILE_NAME_KEY, filename);
  }

  return filename;
}

export async function generateShareLink(html: string) {
  const filename = getShareFilename();

  const response = await fetch("/api/share-link", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filename: `${filename}.html`,
      code: html,
    }),
  });

  if (!response.ok) {
    throw new Error(
      `Failed to upload: ${response.status} ${response.statusText}`,
    );
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Failed to upload HTML");
  }

  const uploadedUrl = result.data?.url;
  if (!uploadedUrl) {
    throw new Error("No URL returned from upload service");
  }
  return `https://anysite-gallery.parthib.ai/${filename}`;
}
