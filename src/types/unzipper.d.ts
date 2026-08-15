declare module "unzipper" {
  export interface Entry {
    path: string;
    type: "File" | "Directory" | string;
    buffer(): Promise<Buffer>;
  }

  export interface Directory {
    files: Entry[];
  }

  export namespace Open {
    function file(filePath: string): Promise<Directory>;
  }
}
