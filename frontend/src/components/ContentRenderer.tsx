import React, { useEffect } from 'react';
import mermaid from 'mermaid';
import { Video, Music, FileText as FileTextIcon, Download, HardDrive, AlertCircle } from 'lucide-react';

interface ContentRendererProps {
  html: string;
  path?: string; // For relative resource resolution
  className?: string;
  metadata?: {
    mimeType: string;
    size: number;
    lastModified: string;
    name: string;
    poster?: string;
    relatedAssets?: {
      type: 'audio' | 'video' | 'exercise' | 'evaluation';
      path: string;
      name: string;
    }[];
  };
}

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'Inter, system-ui, sans-serif',
});

export const ContentRenderer: React.FC<ContentRendererProps> = ({ html, path, className, metadata }) => {
  useEffect(() => {
    const renderAdvancedElements = async () => {
      if (!html) return;

      // 1. Process Mermaid Diagrams
      const mermaidCandidates = Array.from(document.querySelectorAll('pre > code'));
      
      for (const el of mermaidCandidates) {
        const isExplicit = el.classList.contains('language-mermaid') || el.parentElement?.classList.contains('mermaid');
        const textContent = el.textContent?.trim() || '';
        
        const isHeuristic = !el.className.includes('language-') && (
          textContent.startsWith('graph ') || 
          textContent.startsWith('sequenceDiagram') || 
          textContent.startsWith('stateDiagram') || 
          textContent.startsWith('classDiagram') ||
          textContent.startsWith('erDiagram') ||
          textContent.startsWith('flowchart')
        );

        if (isExplicit || isHeuristic) {
          const id = `mermaid-svg-${Math.random().toString(36).substr(2, 9)}`;
          const parent = el.parentElement;

          if (parent && (parent.tagName === 'PRE' || parent.tagName === 'DIV')) {
            try {
              const decodeHtml = (html: string) => {
                const txt = document.createElement("textarea");
                txt.innerHTML = html;
                return txt.value;
              };
              
              const cleanCode = decodeHtml(textContent)
                .replace(/\\n/g, '\n')
                .replace(/^"|"$/g, '');

              const { svg } = await mermaid.render(id, cleanCode);
              const div = document.createElement('div');
              div.className = 'mermaid';
              div.innerHTML = svg;
              parent.replaceWith(div);
            } catch (err) {
              console.error('Mermaid render error:', err);
              const errorDiv = document.createElement('div');
              errorDiv.className = 'p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-red-200 text-xs font-mono overflow-auto';
              errorDiv.textContent = `Mermaid Syntax Error: ${(err as Error).message}\n\nCode:\n${textContent}`;
              parent.replaceWith(errorDiv);
            }
          }
        }
      }

      // 2. Process Code Block Headers
      const codeBlocks = document.querySelectorAll('pre > code[class*="language-"]');
      codeBlocks.forEach((code) => {
        const pre = code.parentElement;
        if (!pre || pre.querySelector('.code-header')) return;

        const langClass = Array.from(code.classList).find(c => c.startsWith('language-'));
        const lang = langClass ? langClass.replace('language-', '') : 'code';

        const displayNames: Record<string, string> = {
          sh: 'TERMINAL',
          bash: 'TERMINAL',
          zsh: 'TERMINAL',
          javascript: 'JS',
          typescript: 'TS',
          dockerfile: 'DOCKER',
          yaml: 'YAML',
          yml: 'YAML',
          python: 'PYTHON',
          py: 'PYTHON',
          sql: 'SQL',
          html: 'HTML',
          css: 'CSS',
          go: 'GO',
          json: 'JSON'
        };
        
        const header = document.createElement('div');
        header.className = `code-header code-lang-${lang}`;
        
        const langLabel = document.createElement('span');
        langLabel.className = 'code-lang-label';
        langLabel.textContent = displayNames[lang.toLowerCase()] || lang.toUpperCase();
        
        const copyBtn = document.createElement('button');
        copyBtn.className = 'code-copy-btn';
        copyBtn.innerHTML = '<span class="octicon octicon-copy"></span>';
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(code.textContent || '');
          copyBtn.classList.add('copied');
          setTimeout(() => copyBtn.classList.remove('copied'), 2000);
        };

        header.appendChild(langLabel);
        header.appendChild(copyBtn);
        pre.prepend(header);
      });
    };

    const timeout = setTimeout(renderAdvancedElements, 150);
    return () => clearTimeout(timeout);
  }, [html]);

  const processHtml = (html: string) => {
    if (!html) return '';
    
    // If no path is provided, we can't resolve relative paths reliably/or assume different base
    if (!path) return html;

    const currentDir = path.substring(0, path.lastIndexOf('/')) || '';
    const assetsBaseUrl = 'http://localhost:3000/assets';
    
    let processed = html.replace(/<img([^>]*)src="([^"]+)"([^>]*)\/?>/g, (match, p1, src, p3) => {
      if (src.startsWith('http') || src.startsWith('data:')) return match;
      
      let cleanSrc = src;
      let targetDir = currentDir;
      
      if (src.startsWith('./')) {
        cleanSrc = src.substring(2);
      } else if (src.startsWith('../')) {
        const parts = currentDir.split('/');
        while (cleanSrc.startsWith('../')) {
          parts.pop();
          cleanSrc = cleanSrc.substring(3);
        }
        targetDir = parts.join('/');
      }
      
      const fullPath = targetDir ? `${targetDir}/${cleanSrc}` : cleanSrc;
      const fullAssetUrl = `${assetsBaseUrl}/${fullPath}`.replace(/\/+/g, '/').replace('http:/', 'http://');
      
      return `<img${p1}src="${fullAssetUrl}"${p3}>`;
    });

    return processed;
  };

  const renderMedia = () => {
    if (!metadata || !path) return null;
    const assetsBaseUrl = 'http://localhost:3000/assets';
    const fileUrl = `${assetsBaseUrl}/${path}`.replace(/\/+/g, '/').replace('http:/', 'http://');
    const mime = metadata.mimeType;

    if (mime.startsWith('video/')) {
      return (
        <div className="media-container mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-primary/10 border border-primary/20">
            <Video className="text-primary" size={24} />
            <h3 className="text-xl font-bold m-0! text-white">Video: {metadata.name}</h3>
          </div>
          <div className="aspect-video rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
            <video 
              controls 
              className="w-full h-full object-contain"
              poster={metadata.poster ? `${assetsBaseUrl}/${metadata.poster}` : undefined}
            >
              <source src={fileUrl} type={mime} />
              Tu navegador no soporta el elemento de video.
            </video>
          </div>
        </div>
      );
    }

    if (mime.startsWith('audio/')) {
      return (
        <div className="media-container mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-secondary/10 border border-secondary/20">
            <Music className="text-secondary" size={24} />
            <h3 className="text-xl font-bold m-0! text-white">Audio: {metadata.name}</h3>
          </div>
          <div className="p-8 rounded-3xl border border-slate-800 bg-slate-900/50 backdrop-blur-xl shadow-2xl flex flex-col items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-secondary/20 flex items-center justify-center text-secondary">
              <Music size={40} />
            </div>
            <audio controls className="w-full max-w-md h-12">
              <source src={fileUrl} type={mime} />
              Tu navegador no soporta el elemento de audio.
            </audio>
          </div>
        </div>
      );
    }

    if (mime === 'application/pdf') {
      return (
        <div className="media-container mt-8 animate-in fade-in slide-in-from-bottom-4 duration-700 h-[80vh] flex flex-col">
          <div className="flex items-center justify-between gap-3 mb-6 p-4 rounded-2xl bg-accent/10 border border-accent/20">
            <div className="flex items-center gap-3">
              <FileTextIcon className="text-accent" size={24} />
              <h3 className="text-xl font-bold m-0! text-white">Documento: {metadata.name}</h3>
            </div>
            <a 
              href={fileUrl} 
              download 
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all text-xs font-bold"
            >
              <Download size={14} />
              Descargar
            </a>
          </div>
          <div className="flex-1 rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-900">
            <iframe 
              src={`${fileUrl}#view=FitH`} 
              className="w-full h-full border-none"
              title={metadata.name}
            />
          </div>
        </div>
      );
    }

    return (
      <div className="p-12 rounded-3xl bg-slate-900 border border-slate-800 text-center flex flex-col items-center gap-6">
        <div className="w-20 h-20 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-500">
          <HardDrive size={40} />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Archivo No Visualizable</h3>
          <p className="text-slate-400 mb-6">Este tipo de archivo ({metadata.mimeType}) no puede visualizarse directamente, pero puedes descargarlo.</p>
          <a 
            href={fileUrl} 
            download
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-white font-bold hover:shadow-[0_0_20px_rgba(56,189,248,0.4)] transition-all"
          >
            <Download size={18} />
            Descargar archivo
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className={`prose prose-invert prose-slate max-w-none 
      prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight
      prose-a:text-primary prose-a:no-underline hover:prose-a:underline
      prose-code:text-accent prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800
      prose-img:rounded-3xl prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-1
      print:prose-slate print:prose-headings:text-black print:text-black
      ${className || ''}
    `}>
      {html ? (
        <>
          {/* Related Audio Assets - Top Player */}
          {metadata && (metadata as any).relatedAssets?.filter((a: any) => a.type === 'audio').map((asset: any) => (
             <div key={asset.path} className="mb-8 p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-md shadow-lg flex items-center gap-6 animate-in slide-in-from-top-4 duration-700">
               <div className="w-12 h-12 rounded-full bg-secondary/20 flex items-center justify-center text-secondary shrink-0">
                 <Music size={24} />
               </div>
               <div className="flex-1">
                 <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Audio de la lección</h4>
                 <audio controls className="w-full h-10 accent-secondary">
                   <source src={`http://localhost:3000/assets/${asset.path}`} />
                   Tu navegador no soporta el elemento de audio.
                 </audio>
               </div>
             </div>
          ))}

          {/* Related Video Assets - Embedded Player */}
          {metadata && (metadata as any).relatedAssets?.filter((a: any) => a.type === 'video').map((asset: any) => (
             <div key={asset.path} className="mb-10 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-black">
               <div className="bg-slate-900/50 p-4 border-b border-slate-800 flex items-center gap-2 text-primary">
                 <Video size={18} />
                 <span className="text-sm font-bold text-white">Video Complementario: {asset.name}</span>
               </div>
               <video controls className="w-full aspect-video">
                 <source src={`http://localhost:3000/assets/${asset.path}`} />
                 Tu navegador no soporta el elemento de video.
               </video>
             </div>
          ))}

          <div 
            className="content-area"
            dangerouslySetInnerHTML={{ __html: processHtml(html) }} 
          />

          {/* Exercises and Evaluations - Bottom Value Props */}
          {metadata && (metadata as any).relatedAssets?.some((a: any) => ['exercise', 'evaluation'].includes(a.type)) && (
            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
              {(metadata as any).relatedAssets.filter((a: any) => a.type === 'exercise').map((asset: any) => (
                <a 
                  key={asset.path}
                  href={`/course/${asset.path}`} // Assuming internal routing for MD files
                  className="flex items-center gap-4 p-6 rounded-2xl bg-slate-900 border border-teal-800/30 hover:border-teal-500/50 hover:bg-teal-950/20 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400 group-hover:scale-110 transition-transform">
                    <FileTextIcon size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white group-hover:text-teal-300 transition-colors">Ejercicio Práctico</h4>
                    <p className="text-sm text-slate-400">Pon a prueba tu conocimiento</p>
                  </div>
                </a>
              ))}

              {(metadata as any).relatedAssets.filter((a: any) => a.type === 'evaluation').map((asset: any) => (
                <a 
                  key={asset.path}
                  href={`/course/${asset.path}`}
                  className="flex items-center gap-4 p-6 rounded-2xl bg-slate-900 border border-purple-800/30 hover:border-purple-500/50 hover:bg-purple-950/20 transition-all group"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                    <AlertCircle size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-white group-hover:text-purple-300 transition-colors">Evaluación del Tema</h4>
                    <p className="text-sm text-slate-400">Certifica lo aprendido</p>
                  </div>
                </a>
              ))}
            </div>
          )}
        </>
      ) : renderMedia()}
    </div>
  );
};
