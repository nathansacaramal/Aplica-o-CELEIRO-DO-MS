export interface WebImageProcessor {
  process(buffer: Buffer, sourceMimeType: string): Promise<Buffer>;
}
