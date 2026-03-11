import { put } from "@vercel/blob";

export async function uploadToBlob(
  file: Buffer | ArrayBuffer,
  filename: string,
  contentType = "image/jpeg"
): Promise<string> {
  const blob = await put(`tryon/${filename}`, file, {
    access: "public",
    contentType,
  });
  return blob.url;
}

export async function uploadFromUrl(
  url: string,
  filename: string
): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Falha ao baixar imagem: ${res.status}`);
  const buffer = await res.arrayBuffer();
  return uploadToBlob(buffer, filename);
}
