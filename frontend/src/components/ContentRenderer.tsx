import React, { useEffect } from "react";
import mermaid from "mermaid";
import {
  Video,
  Music,
  FileText as FileTextIcon,
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  X,
} from "lucide-react";
import { renderToString } from "react-dom/server";
import { apiService } from "../services/apiService";
import type { ContentResponse } from "../services/apiService";

interface ContentRendererProps {
  html: string;
  path?: string;
  className?: string;
  metadata?: {
    mimeType: string;
    size: number;
    lastModified: string;
    name: string;
    poster?: string;
    relatedAssets?: {
      type: "audio" | "video" | "exercise" | "evaluation" | "script";
      path: string;
      name: string;
    }[];
    showAudio?: boolean;
    showScript?: boolean;
  };
  onCloseAudio?: () => void;
  onCloseScript?: () => void;
}

mermaid.initialize({
  startOnLoad: false,
  theme: "dark",
  securityLevel: "loose",
  fontFamily: "Inter, system-ui, sans-serif",
});

// 1. Static Content Component (Memoized to prevent wiping of manual DOM mutations)
const StaticContent: React.FC<{
  html: string;
  getProcessedHtml: (html: string) => string;
  setModalDiagram: (d: { svg: string } | null) => void;
}> = React.memo(({ html, getProcessedHtml, setModalDiagram }) => {
  const contentRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const renderAdvancedElements = async () => {
      if (!html || !contentRef.current) return;

      const container = contentRef.current;

      // Mermaid Processing
      const mermaidCandidates = Array.from(
        container.querySelectorAll("pre > code")
      );

      for (const el of mermaidCandidates) {
        const isExplicit =
          el.classList.contains("language-mermaid") ||
          el.parentElement?.classList.contains("mermaid");
        const textContent = el.textContent?.trim() || "";
        if (!textContent) continue;

        const isHeuristic =
          !el.className.includes("language-") &&
          (textContent.startsWith("graph ") ||
            textContent.startsWith("sequenceDiagram") ||
            textContent.startsWith("stateDiagram") ||
            textContent.startsWith("classDiagram") ||
            textContent.startsWith("erDiagram") ||
            textContent.startsWith("flowchart"));

        if (isExplicit || isHeuristic) {
          const parent = el.parentElement;
          if (
            parent &&
            (parent.tagName === "PRE" || parent.tagName === "DIV")
          ) {
            try {
              const decodeHtml = (h: string) => {
                const txt = document.createElement("textarea");
                txt.innerHTML = h;
                return txt.value;
              };

              const cleanCode = decodeHtml(textContent)
                .replace(/\\n/g, "\n")
                .replace(/\\"/g, '"')
                // Fix: Escape brackets and parentheses in node labels if they cause issues, 
                // OR wrap content in quotes if it looks like a node definition
                // Heuristic: Replace Id[Content] with Id["Content"] if Content has special chars and no quotes
                .replace(/([A-Za-z0-9_]+)\[(?!")(.+?)(?!")\]/g, (match, id, content) => {
                   // If content already has quotes or is simple, leave it.
                   // But if it has () or [] inside, quote it.
                   if (content.match(/[()[\]]/)) {
                     return `${id}["${content.replace(/"/g, "'")}"]`;
                   }
                   return match;
                })
                 // Also handle () for rounded edges: Id(Content) -> Id("Content")
                .replace(/([A-Za-z0-9_]+)\((?!")(.+?)(?!")\)/g, (match, id, content) => {
                   if (content.match(/[()[\]]/)) {
                      return `${id}("${content.replace(/"/g, "'")}")`;
                   }
                   return match;
                })
                // Fix: Remove backslashes that shouldn't be there, esp before <, >, or -
                .replace(/\\</g, "<")
                .replace(/\\>/g, ">")
                .replace(/\\-/g, "-") // Fix for potential -\-> or ->\<-
                // Fix: Ensure gitGraph tags are quoted
                .replace(/tag:\s*(?!")([a-zA-Z0-9_.-]+)/g, 'tag: "$1"')
                .trim()
                .replace(/^"|"$/g, "")
                .replace(/^'|'$/g, "")
                .trim();
              const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
              const { svg } = await mermaid.render(id, cleanCode);

              const wrapper = document.createElement("div");
              wrapper.className = "mermaid-wrapper group";

              const toolbar = document.createElement("div");
              toolbar.className = "mermaid-toolbar";

              const zoomDisplay = document.createElement("span");
              zoomDisplay.className =
                "px-2 text-[10px] font-mono font-bold text-primary min-w-[45px] text-center select-none";
              zoomDisplay.textContent = "100%";

              const createBtn = (
                Icon: any,
                title: string,
                onClick: (e: MouseEvent) => void
              ) => {
                const btn = document.createElement("button");
                btn.className =
                  "p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-all";
                btn.title = title;
                btn.innerHTML = renderToString(<Icon size={14} />);
                btn.onclick = (e) => {
                  e.stopPropagation();
                  onClick(e);
                };
                return btn;
              };

              let zoom = 1;
              const updateZoom = (delta: number) => {
                zoom = Math.max(
                  0.5,
                  Math.min(5, delta === 0 ? 1 : zoom + delta)
                );
                zoomDisplay.textContent = `${Math.round(zoom * 100)}%`;
                const svgEl = wrapper.querySelector(
                  ".mermaid-viewport svg"
                ) as SVGSVGElement | null;
                if (svgEl) {
                  svgEl.style.setProperty(
                    "width",
                    `${zoom * 100}%`,
                    "important"
                  );
                  svgEl.style.setProperty("max-width", "none", "important");
                  svgEl.style.setProperty("height", "auto", "important");
                }
              };

              toolbar.appendChild(
                createBtn(RefreshCw, "Resetear Zoom", () => updateZoom(0))
              );
              toolbar.appendChild(
                createBtn(ZoomOut, "Reducir Zoom", () => updateZoom(-0.2))
              );
              toolbar.appendChild(zoomDisplay);
              toolbar.appendChild(
                createBtn(ZoomIn, "Aumentar Zoom", () => updateZoom(0.2))
              );
              toolbar.appendChild(
                createBtn(Maximize2, "Expandir Diagrama", () => {
                  setModalDiagram({ svg });
                })
              );

              const viewport = document.createElement("div");
              viewport.className =
                "mermaid-viewport custom-scrollbar overflow-auto";
              viewport.style.maxHeight = "70vh";
              viewport.innerHTML = `<div class="mermaid-inner-container min-w-full min-h-full flex items-center justify-center p-8">${svg}</div>`;

              wrapper.appendChild(toolbar);
              wrapper.appendChild(viewport);
              parent.replaceWith(wrapper);
            } catch (err) {
              console.error("Mermaid error:", err);
              const errDiv = document.createElement("div");
              errDiv.className =
                "p-4 bg-red-900/10 border border-red-500/30 rounded-lg text-red-500 text-xs font-mono";
              errDiv.textContent = `Mermaid Error: ${(err as Error).message}`;
              parent.replaceWith(errDiv);
            }
          }
        }
      }

      // Code Headers
      container.querySelectorAll("pre > code").forEach((code) => {
        const pre = code.parentElement;
        if (
          !pre ||
          pre.querySelector(".code-copy-btn") ||
          pre.classList.contains("mermaid") ||
          pre.closest(".mermaid-viewport")
        )
          return;
        const langClass = Array.from(code.classList).find((c) =>
          c.startsWith("language-")
        );
        const lang = langClass ? langClass.replace("language-", "") : "text";
        const displayNames: Record<string, string> = {
          sh: "TERM",
          bash: "TERM",
          js: "JS",
          ts: "TS",
          python: "PY",
          sql: "SQL",
          dockerfile: "DOCKER",
          yaml: "YAML",
        };

        const header = document.createElement("div");
        header.className =
          "flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-700/50 rounded-t-lg font-mono text-[10px] select-none uppercase tracking-widest text-slate-400";
        header.innerHTML = `<span>${
          displayNames[lang.toLowerCase()] || lang.toUpperCase()
        }</span>`;

        const copyBtn = document.createElement("button");
        copyBtn.className =
          "code-copy-btn p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-all";
        copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(code.textContent || "");
          copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 6 9 17 4 12"/></svg>`;
          setTimeout(() => {
            copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`;
          }, 2000);
        };
        header.appendChild(copyBtn);
        pre.prepend(header);
      });
    };
    setTimeout(renderAdvancedElements, 150);
  }, [html, getProcessedHtml, setModalDiagram]);

  return (
    <div
      ref={contentRef}
      className="content-area"
      dangerouslySetInnerHTML={{ __html: getProcessedHtml(html) }}
    />
  );
});

// 2. Main Component
export const ContentRendererBase: React.FC<ContentRendererProps> = ({
  html,
  path,
  className,
  metadata,
  onCloseAudio,
  onCloseScript,
}) => {
  const [scriptHtml, setScriptHtml] = React.useState<string | null>(null);
  const [modalDiagram, setModalDiagram] = React.useState<{
    svg: string;
  } | null>(null);
  const [modalZoom, setModalZoom] = React.useState(1);

  useEffect(() => {
    if (metadata?.showScript && metadata.relatedAssets) {
      const scriptAsset = metadata.relatedAssets.find(
        (a) => a.type === "script"
      );
      if (scriptAsset) {
        apiService
          .getContent(scriptAsset.path)
          .then((data: ContentResponse) => setScriptHtml(data.html || ""));
      }
    }
  }, [metadata?.showScript, metadata?.relatedAssets]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalDiagram(null);
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  const formatQuizQuestions = React.useCallback((h: string) => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(h, "text/html");
    doc.querySelectorAll("p, li").forEach((p) => {
      const text = p.innerHTML;
      if (text.includes("a) ") && text.includes("b) ")) {
        const parts = text.split(/(\s[a-z]\)\s)/);
        if (parts.length > 1) {
          const newContainer = document.createElement("div");
          newContainer.className =
            "quiz-question mb-6 p-6 rounded-2xl bg-slate-800/50 border border-slate-700";
          const qTitle = document.createElement("p");
          qTitle.className = "font-bold text-lg mb-4 text-white";
          qTitle.innerHTML = parts[0];
          newContainer.appendChild(qTitle);
          const list = document.createElement("ul");
          list.className = "space-y-3";
          for (let i = 1; i < parts.length; i += 2) {
            const li = document.createElement("li");
            li.className =
              "flex items-start gap-3 p-3 rounded-xl hover:bg-slate-700/50 transition-colors";
            const isCorrect = parts[i + 1]?.includes("(Correcta)");
            const clean = (parts[i + 1] || "").replace("(Correcta)", "").trim();
            li.innerHTML = `<div class="shrink-0 w-6 h-6 rounded border flex items-center justify-center mt-0.5 ${
              isCorrect
                ? "border-emerald-500 bg-emerald-500/20 text-emerald-500"
                : "border-slate-500"
            }">${
              isCorrect ? "✓" : ""
            }</div><div class="flex-1 text-slate-300"><span class="font-bold text-blue-400 mr-2 capitalize">${parts[
              i
            ].trim()}</span> ${clean}</div>`;
            list.appendChild(li);
          }
          newContainer.appendChild(list);
          p.replaceWith(newContainer);
        }
      }
    });
    return doc.body.innerHTML;
  }, []);

  const getProcessedHtml = React.useCallback(
    (rawHtml: string) => {
      if (!rawHtml) return "";
      const currentDir = path
        ? path.substring(0, path.lastIndexOf("/")) || ""
        : "";
      const assetsBaseUrl = "/api/content-assets";
      let processed = rawHtml.replace(
        /<img([^>]*)src="([^"]+)"([^>]*)\/?>/g,
        (match, p1, src, p3) => {
          if (src.startsWith("http") || src.startsWith("data:") || !path)
            return match;
          let cleanSrc = src.startsWith("./") ? src.substring(2) : src;
          let targetDir = currentDir;
          while (cleanSrc.startsWith("../")) {
            targetDir = targetDir.substring(0, targetDir.lastIndexOf("/"));
            cleanSrc = cleanSrc.substring(3);
          }
          const fullPath = targetDir ? `${targetDir}/${cleanSrc}` : cleanSrc;
          return `<img${p1}src="${assetsBaseUrl}/${fullPath.replace(
            /\/+/g,
            "/"
          )}"${p3}>`;
        }
      );
      return formatQuizQuestions(processed);
    },
    [path, formatQuizQuestions]
  );

  const renderMedia = () => {
    if (!metadata || !path) return null;
    const url = `/api/content-assets/${path}`
      .replace(/\/+/g, "/")
      .replace("http:/", "http://");
    const mime = metadata.mimeType;

    if (mime.startsWith("video/")) {
      return (
        <div className="media-container mt-8 animate-slide-up">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-primary/10 border border-primary/20 mb-6">
              <Video className="text-primary" size={24} />
              <h3 className="text-xl font-bold m-0! text-white">
                Video: {metadata.name}
              </h3>
            </div>
          <div className="aspect-video rounded-3xl overflow-hidden border border-slate-800 bg-slate-950">
            <video
              controls
              className="w-full h-full object-contain"
              poster={
                metadata.poster
                  ? `/api/content-assets/${metadata.poster}`
                  : undefined
              }
            >
              <source src={url} type={mime} />
            </video>
          </div>
        </div>
      );
    }
    if (mime.startsWith("audio/")) {
      return (
        <div className="media-container mt-8 animate-slide-up">
            <div className="flex items-center gap-3 p-4 rounded-2xl bg-secondary/10 border border-secondary/20 mb-6">
              <Music className="text-secondary" size={24} />
              <h3 className="text-xl font-bold m-0! text-white">
                Audio: {metadata.name}
              </h3>
            </div>
          <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl flex flex-col items-center gap-6 text-slate-400">
            <Music size={40} />
            <audio controls src={url} className="w-full max-w-md h-12" />
          </div>
        </div>
      );
    }
    return (
      <div className="p-8 text-center text-slate-400">
        Tipo de archivo no soportado para previsualización.{" "}
        <a href={url} download className="text-primary underline">
          Descargar
        </a>
      </div>
    );
  };

  return (
    <div
      className={`prose dark:prose-invert prose-slate max-w-none ${
        className || ""
      }`}
    >
      {html || metadata?.mimeType === "text/html" ? (
        <>
          {metadata &&
            metadata.showAudio &&
            metadata.relatedAssets
              ?.filter((a) => a.type === "audio")
              .map((asset) => (
                <div
                  key={asset.path}
                  className="fixed bottom-8 right-8 z-[100] w-96 p-4 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col gap-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Music size={20} className="text-emerald-500" />
                      <div>
                        <h4 className="text-sm font-bold text-white">Audio</h4>
                        <p className="text-xs text-slate-400">{asset.name}</p>
                      </div>
                    </div>
                    <button
                      onClick={onCloseAudio}
                      className="text-slate-500 hover:text-white"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <audio
                    controls
                    autoPlay
                    className="w-full"
                    src={`/api/content-assets/${asset.path}`}
                  />
                </div>
              ))}

          {metadata?.mimeType === "text/html" ? (
            <div className="simulation-wrapper w-full overflow-hidden">
              <iframe
                src={`/api/content-assets/${path}`}
                className="w-full h-[800px] border-none bg-white block"
                title="Simulation"
                scrolling="no"
              />
            </div>
          ) : (
            <>
              <StaticContent
                html={html}
                getProcessedHtml={getProcessedHtml}
                setModalDiagram={setModalDiagram}
              />
              {metadata?.showScript && scriptHtml && (
                <div className="mt-12 p-8 rounded-3xl bg-blue-500/5 border border-blue-500/20 relative group">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-2 text-blue-500">
                      <FileTextIcon size={20} />
                      <span className="text-sm font-bold uppercase">Guion</span>
                    </div>
                    <button
                      onClick={onCloseScript}
                      className="text-xs font-bold text-blue-500 hover:text-red-500"
                    >
                      Cerrar
                    </button>
                  </div>
                  <StaticContent
                    html={scriptHtml}
                    getProcessedHtml={getProcessedHtml}
                    setModalDiagram={setModalDiagram}
                  />
                </div>
              )}
            </>
          )}
        </>
      ) : (
        renderMedia()
      )}

      {modalDiagram && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl"
          onClick={() => setModalDiagram(null)}
        >
          <div
            className="relative w-full h-full max-w-6xl max-h-[90vh] bg-slate-900 rounded-3xl border border-white/10 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-slate-900 z-50">
              <div className="flex items-center gap-3">
                <Maximize2 size={20} className="text-emerald-500" />
                <h3 className="text-lg font-bold text-white m-0!">
                  Vista Expandida
                </h3>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-slate-800 rounded-xl p-1">
                  <button
                    onClick={() => setModalZoom((z) => Math.max(0.5, z - 0.2))}
                    className="p-2"
                  >
                    <ZoomOut size={18} />
                  </button>
                  <span className="px-3 text-xs font-mono font-bold text-primary min-w-[60px] text-center">
                    {Math.round(modalZoom * 100)}%
                  </span>
                  <button
                    onClick={() => setModalZoom((z) => Math.min(5, z + 0.2))}
                    className="p-2"
                  >
                    <ZoomIn size={18} />
                  </button>
                  <button
                    onClick={() => setModalZoom(1)}
                    className="p-2 border-l border-white/5"
                  >
                    <RefreshCw size={16} />
                  </button>
                </div>
                <button
                  onClick={() => setModalDiagram(null)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/10 text-red-500 border border-red-500/30 font-bold text-sm"
                >
                  <X size={18} />
                  Cerrar
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto bg-slate-950 flex items-center justify-center p-12">
              <div
                dangerouslySetInnerHTML={{ __html: modalDiagram.svg }}
                style={{
                  width: `${modalZoom * 100}%`,
                  maxWidth: "none",
                  height: "auto",
                }}
                className="transition-all duration-200"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ContentRenderer = React.memo(ContentRendererBase, (prev, next) => {
  return (
    prev.html === next.html &&
    prev.path === next.path &&
    (prev.metadata as any)?.showAudio === (next.metadata as any)?.showAudio &&
    (prev.metadata as any)?.showScript === (next.metadata as any)?.showScript
  );
});
