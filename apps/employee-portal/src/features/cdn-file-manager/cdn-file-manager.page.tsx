import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ChevronRight,
  Download,
  ExternalLink,
  Folder,
  Home,
  Loader2,
  File as FileIcon,
} from "lucide-react";
import {
  Button,
  TableCell,
  TableHead,
  TableRow,
} from "@craft-apex/ui";
import {
  DataTableShell,
  TABLE_HEADER_ROW_CLASS,
  TABLE_HEAD_CLASS,
  TABLE_ROW_CLASS,
} from "@/components/data-table-shell";
import { useCdnDirectory } from "./cdn-file-manager.api";

/**
 * CDN File Manager. Legacy
 * `/pages/Configuration/CDNFileManager/CDNFiles.js` is a 525-LOC tree
 * browser with folder/file upload modals + image preview modal. This port
 * is read-only: breadcrumb navigation + flat current-directory listing +
 * external-view + download. Uploads are deferred (they need multipart
 * folder/file upload widgets that legacy implements as separate components).
 */
export default function CdnFileManagerPage() {
  const [currentDir, setCurrentDir] = useState<string>("");
  const { data, isFetching } = useCdnDirectory(currentDir || null);

  const directories = data?.directories ?? [];
  const files = data?.files ?? [];

  // Breadcrumb trail derived from the current directory.
  const trail = useMemo(() => {
    if (!currentDir) return [];
    const parts = currentDir.split("/").filter(Boolean);
    return parts.map((part, i) => ({
      name: part,
      path: parts.slice(0, i + 1).join("/") + "/",
    }));
  }, [currentDir]);

  // Reduce a full directory path to its leaf segment for display.
  const leafName = (path: string) => {
    const parts = path.split("/").filter(Boolean);
    return parts[parts.length - 1] ?? path;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            CDN File Manager
          </h1>
          <p className="text-sm text-slate-500">
            Browse hosted assets. Upload &amp; edit deferred — open files
            directly via the View action.
          </p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link to="/dashboard">
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </Button>
      </div>

      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
        <button
          type="button"
          onClick={() => setCurrentDir("")}
          className="inline-flex items-center gap-1 text-slate-700 hover:text-[#4C7DF0]"
        >
          <Home className="h-4 w-4" /> Root
        </button>
        {trail.map((crumb, i) => (
          <span key={crumb.path} className="inline-flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-slate-400" />
            <button
              type="button"
              onClick={() => setCurrentDir(crumb.path)}
              className={
                i === trail.length - 1
                  ? "font-medium text-slate-900"
                  : "text-slate-700 hover:text-[#4C7DF0]"
              }
            >
              {crumb.name}
            </button>
          </span>
        ))}
      </div>

      {/* Directory tiles */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Folders
        </h2>
        {isFetching && directories.length === 0 ? (
          <div className="flex h-20 items-center justify-center text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" />
          </div>
        ) : directories.length === 0 ? (
          <p className="text-sm italic text-slate-500">No folders here.</p>
        ) : (
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
            {directories.map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={() => setCurrentDir(dir)}
                className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50/40 p-3 text-left text-sm transition hover:border-[#4C7DF0] hover:bg-[#4C7DF0]/5"
              >
                <Folder className="h-4 w-4 text-amber-500" />
                <span className="truncate font-medium text-slate-800">
                  {leafName(dir)}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Files table */}
      <DataTableShell
        columnCount={3}
        loading={isFetching && files.length === 0}
        isEmpty={!isFetching && files.length === 0}
        emptyIcon={<FileIcon className="h-8 w-8 text-slate-300" />}
        emptyTitle="No files in this folder"
        header={
          <TableRow className={TABLE_HEADER_ROW_CLASS}>
            <TableHead className={TABLE_HEAD_CLASS}>File</TableHead>
            <TableHead className={TABLE_HEAD_CLASS}>URL</TableHead>
            <TableHead className={`${TABLE_HEAD_CLASS} text-right`}>
              Action
            </TableHead>
          </TableRow>
        }
      >
        {files.map((file) => {
          const name = leafName(file);
          const ext = (name.split(".").pop() ?? "").toLowerCase();
          return (
            <TableRow key={file} className={TABLE_ROW_CLASS}>
              <TableCell>
                <div className="flex items-center gap-2">
                  <FileIcon className="h-4 w-4 text-slate-400" />
                  <div>
                    <div className="font-medium text-slate-900">{name}</div>
                    <div className="font-mono text-[10px] uppercase text-slate-400">
                      {ext || "file"}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className="max-w-[480px] truncate font-mono text-xs text-slate-500">
                {file}
              </TableCell>
              <TableCell className="text-right">
                <div className="inline-flex gap-2">
                  <Button asChild size="sm" variant="ghost">
                    <a
                      href={file}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open in new tab"
                    >
                      <ExternalLink className="h-3.5 w-3.5" /> View
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <a href={file} download title="Download">
                      <Download className="h-3.5 w-3.5" /> Download
                    </a>
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </DataTableShell>
    </div>
  );
}
