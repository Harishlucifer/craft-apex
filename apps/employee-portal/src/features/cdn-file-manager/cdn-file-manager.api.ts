import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

// Legacy /pages/Configuration/CDNFileManager/CDNFiles.js
//   GET /alpha/v1/metadata/directories[?currentDir={path}]
//   Response shape (response.data.{directories, files}):
//     directories: string[]   // child directory paths e.g. ["images/", "docs/"]
//     files:       string[]   // file URLs in current directory
const URL = "/alpha/v1/metadata/directories";

export interface CdnDirectoryListing {
  directories: string[];
  files: string[];
}

export function useCdnDirectory(currentDir: string | null) {
  const url = currentDir
    ? `${URL}?currentDir=${encodeURIComponent(currentDir)}`
    : URL;
  return useQuery({
    queryKey: ["cdn-directory", currentDir ?? "/"],
    queryFn: async (): Promise<CdnDirectoryListing> => {
      const body = await api.get<unknown, any>(url);
      const data = body?.data ?? body ?? {};
      return {
        directories: Array.isArray(data.directories) ? data.directories : [],
        files: Array.isArray(data.files) ? data.files : [],
      };
    },
  });
}
