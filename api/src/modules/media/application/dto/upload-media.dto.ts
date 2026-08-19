// src/modules/media/application/dto/upload-media.dto.ts
export interface UploadMediaDTO {
  file: {
    base64: string; // pode vir com "data:...;base64," ou base64 puro
    filename: string; // ex: "foto.png"
    mimeType: string; // ex: "image/png"
  };
  folder?: string; // ex: "users/10"
  visibility?: "private" | "public";
}
