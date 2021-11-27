import { Stream } from "stream";


export interface ResultSet {
  setFetchSize(size: number): void;
  createArrayStream(): Stream;
  createObjectStream(): Stream;
  close(): void
}
