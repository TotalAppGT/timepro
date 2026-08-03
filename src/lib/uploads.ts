import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export interface StoredFile {
  url: string; // data URL o URL pública
}

let s3Client: S3Client | null = null;

function getS3(): S3Client | null {
  const bucket = process.env.S3_BUCKET;
  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;
  if (!bucket || !endpoint || !accessKeyId || !secretAccessKey) return null;
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.S3_REGION || "auto",
      endpoint,
      credentials: { accessKeyId, secretAccessKey },
      forcePathStyle: true,
    });
  }
  return s3Client;
}

export function storageDriver(): "base64" | "s3" {
  if ((process.env.STORAGE_DRIVER || "base64") === "s3" && getS3()) return "s3";
  return "base64";
}

function mimeToExt(mime: string): string {
  const map: Record<string, string> = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
    "image/webp": "webp",
  };
  return map[mime] || "bin";
}

export async function uploadFile(opts: {
  data: Uint8Array | Buffer | ArrayBuffer;
  mime: string;
  folder: string;
}): Promise<StoredFile> {
  const driver = storageDriver();

  if (driver === "s3") {
    const client = getS3();
    const bucket = process.env.S3_BUCKET!;
    const key = `${opts.folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${mimeToExt(opts.mime)}`;
    const body =
      opts.data instanceof Uint8Array ? Buffer.from(opts.data) : opts.data instanceof ArrayBuffer ? Buffer.from(opts.data) : opts.data;
    await client!.send(new PutObjectCommand({ Bucket: bucket, Key: key, Body: body, ContentType: opts.mime }));
    const publicUrl = process.env.S3_PUBLIC_URL?.replace(/\/$/, "");
    return { url: publicUrl ? `${publicUrl}/${key}` : key };
  }

  // base64 (almacenado en la base de datos como data URL)
  const base64 = Buffer.from(opts.data as Uint8Array).toString("base64");
  return { url: `data:${opts.mime};base64,${base64}` };
}

export function dataUrlToBuffer(dataUrl: string): { buffer: Buffer; mime: string } | null {
  const match = /^data:([^;]+);base64,(.+)$/.exec(dataUrl);
  if (!match) return null;
  return { buffer: Buffer.from(match[2], "base64"), mime: match[1] };
}

export async function uploadDataUrl(dataUrl: string, folder: string): Promise<StoredFile> {
  const parsed = dataUrlToBuffer(dataUrl);
  if (!parsed) return { url: dataUrl };
  return uploadFile({ data: parsed.buffer, mime: parsed.mime, folder });
}
