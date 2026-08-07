declare module "unzipper" {
  export interface Entry {
    path: string;
    type: "File" | "Directory" | string;
  }

  export interface Directory {
    files: Entry[];
  }

  export namespace Open {
    function file(filePath: string): Promise<Directory>;
  }
}
