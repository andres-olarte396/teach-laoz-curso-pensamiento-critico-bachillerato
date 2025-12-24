import React, { useEffect } from 'react';
import mermaid from 'mermaid';
import { Video, Music, FileText as FileTextIcon, Download, HardDrive } from 'lucide-react';
import { apiService } from '../services/apiService';
import type { ContentResponse } from '../services/apiService';

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
      type: 'audio' | 'video' | 'exercise' | 'evaluation' | 'script';
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
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'Inter, system-ui, sans-serif',
});

export const ContentRendererBase: React.FC<ContentRendererProps> = ({ html, path, className, metadata, onCloseAudio, onCloseScript }) => {
  const [scriptHtml, setScriptHtml] = React.useState<string | null>(null);

  // Helper function defined early to avoid reference errors
  const formatQuizQuestions = (html: string) => {
    // Regex to find numbered questions followed by inline options (a) ... b) ...)
    // Pattern: 1. Question? a) ... b) ... 
    // We look for patterns where options start with a lowercase letter and a parenthesis.
    
    // First, let's look for paragraphs that seem to contain multiple options
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const paragraphs = doc.querySelectorAll('p, li');
    let hasChanges = false;
    
    paragraphs.forEach(p => {
      // If it's an li, we might need to handle it carefully to not break nested lists, 
      // but replacing innerHTML should be fine if it matches the pattern.
      const text = p.innerHTML;
      
      // Check if paragraph contains "a) " and "b) " (minimal multiple choice)
      if (text.includes('a) ') && text.includes('b) ')) {
         // Attempt to split by options. 
         // Assuming format: "1. Question text? a) Option A b) Option B (Correcta) c) Option C"
         
         // Capturing the question part first (everything before "a) ")
         const parts = text.split(/(\s[a-z]\)\s)/); // Split keeping delimiters
         
         if (parts.length > 1) {
             const questionText = parts[0];
             const options = [];
             
             for (let i = 1; i < parts.length; i += 2) {
                 const label = parts[i].trim(); // "a) "
                 const content = parts[i+1] || ''; // "Option content..."
                 options.push({ label, content });
             }
             
             // Build new HTML
             const newContainer = document.createElement('div');
             newContainer.className = 'quiz-question mb-6 p-6 rounded-2xl bg-slate-800/50 border border-slate-700';
             
             const qTitle = document.createElement('p');
             qTitle.className = 'font-bold text-lg mb-4 text-white';
             qTitle.innerHTML = questionText;
             newContainer.appendChild(qTitle);
             
             const optionsList = document.createElement('ul');
             optionsList.className = 'space-y-3';
             
             options.forEach(opt => {
                 const li = document.createElement('li');
                 li.className = 'flex items-start gap-3 p-3 rounded-xl hover:bg-slate-700/50 transition-colors cursor-pointer group';
                 
                 // Check for "(Correcta)" indicator
                 const isCorrect = opt.content.includes('(Correcta)');
                 const cleanContent = opt.content.replace('(Correcta)', '').trim();
                 
                 // Checkbox mockup
                 const checkbox = document.createElement('div');
                 checkbox.className = `w-6 h-6 rounded border flex items-center justify-center mt-0.5 shrink-0 ${isCorrect ? 'border-emerald-500 bg-emerald-500/20 text-emerald-500' : 'border-slate-500 group-hover:border-blue-400'}`;
                 if (isCorrect) {
                     checkbox.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                 }
                 
                 const textDiv = document.createElement('div');
                 textDiv.className = 'flex-1 text-slate-300 group-hover:text-slate-200';
                 textDiv.innerHTML = `<span class="font-bold text-blue-400 mr-2 uppercase">${opt.label.replace(')', '')}.</span> ${cleanContent}`;
                 
                 li.appendChild(checkbox);
                 li.appendChild(textDiv);
                 optionsList.appendChild(li);
             });
             newContainer.appendChild(optionsList);
             p.replaceWith(newContainer);
             hasChanges = true;
         }
      }
    });
    return hasChanges ? doc.body.innerHTML : html;
  };

  useEffect(() => {
    if (metadata?.showScript && metadata.relatedAssets) {
      const scriptAsset = metadata.relatedAssets.find(a => a.type === 'script');
      if (scriptAsset) {
        apiService.getContent(scriptAsset.path).then((data: ContentResponse) => {
            setScriptHtml(data.html || '');
        });
      }
    }
  }, [metadata?.showScript, metadata?.relatedAssets]);

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
      const codeBlocks = document.querySelectorAll('pre > code');
      codeBlocks.forEach((code) => {
        const pre = code.parentElement;
        // Avoid double-processing or processing mermaid diagrams that might have been processed but wrapper left? 
        // Or if it's already processed (has a header)
        if (!pre || pre.querySelector('div.flex') || pre.classList.contains('mermaid')) return;

        const langClass = Array.from(code.classList).find(c => c.startsWith('language-'));
        const lang = langClass ? langClass.replace('language-', '') : 'text';

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
          json: 'JSON',
          text: 'TEXTO',
          plaintext: 'TEXTO',
          txt: 'TEXTO'
        };
        
        const header = document.createElement('div');
        // Use Tailwind utility classes directly to avoid specificity issues and remove "green dot" contamination
        header.className = 'flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-700/50 rounded-t-lg font-mono text-xs select-none';
        
        const langLabel = document.createElement('span');
        langLabel.className = 'font-bold text-slate-400 uppercase tracking-widest';
        langLabel.textContent = displayNames[lang.toLowerCase()] || lang.toUpperCase();
        
        const copyBtn = document.createElement('button');
        const btnBase = 'flex items-center justify-center p-1 rounded transition-all duration-200 text-slate-400 hover:text-white hover:bg-white/10 opacity-70 hover:opacity-100';
        copyBtn.className = btnBase;
        copyBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
        `;
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(code.textContent || '');
          copyBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check"><path d="M20 6 9 17 4 12"/></svg>
          `;
          // Add success styles
          copyBtn.classList.add('text-emerald-500', 'opacity-100');
          copyBtn.classList.remove('text-slate-400', 'opacity-70');
          
          setTimeout(() => {
             // Revert styles
             copyBtn.classList.remove('text-emerald-500', 'opacity-100');
             copyBtn.classList.add('text-slate-400', 'opacity-70');
             copyBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
             `;
          }, 2000);
        };

        header.appendChild(langLabel);
        header.appendChild(copyBtn);
        pre.prepend(header);
      });
    };

    const timeout = setTimeout(renderAdvancedElements, 150);
    return () => clearTimeout(timeout);
  }, [html]);

  const getProcessedHtml = React.useCallback((rawHtml: string) => {
    if (!rawHtml) return '';
    // If no path is provided, we can't resolve relative paths reliably/or assume different base
    // Use path from props closure
    if (!path && !rawHtml.includes('<img')) return rawHtml; // Optimization 

    const currentDir = path ? (path.substring(0, path.lastIndexOf('/')) || '') : '';
    const assetsBaseUrl = 'http://localhost:3000/assets';
    
    let processed = rawHtml.replace(/<img([^>]*)src="([^"]+)"([^>]*)\/?>/g, (match, p1, src, p3) => {
      if (src.startsWith('http') || src.startsWith('data:')) return match;
      if (!path) return match; // Can't resolve relative without path
      
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
    
    // Process Quiz Questions
    processed = formatQuizQuestions(processed);

    return processed;
  }, [path]);

  // Memoize the processed HTML to prevent DOM thrashing
  const processedHtml = React.useMemo(() => getProcessedHtml(html), [html, getProcessedHtml]);

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
    <div className={`prose dark:prose-invert prose-slate max-w-none 
      dark:prose-headings:text-white prose-headings:text-slate-900 prose-headings:font-bold prose-headings:tracking-tight
      prose-a:text-primary prose-a:no-underline hover:prose-a:underline
      dark:prose-code:text-accent prose-code:text-emerald-600 dark:prose-pre:bg-slate-900 prose-pre:bg-slate-100 dark:prose-pre:border dark:prose-pre:border-slate-800 prose-pre:border-slate-200
      prose-img:rounded-3xl prose-blockquote:border-l-primary prose-blockquote:bg-primary/5 prose-blockquote:py-1
      print:prose-slate print:prose-headings:text-black print:text-black
      ${className || ''}
    `}>
      {html ? (
        <>
          {/* Related Audio Assets - Fixed Bottom Right Player */}
          {metadata && (metadata as any).showAudio && (metadata as any).relatedAssets?.filter((a: any) => a.type === 'audio').map((asset: any) => (
             <div key={asset.path} className="fixed bottom-8 right-8 z-[100] w-96 p-4 rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl flex flex-col gap-4 animate-in slide-in-from-bottom-4 duration-500">
               <div className="flex items-start justify-between">
                 <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                     <Music size={20} />
                   </div>
                   <div>
                      <h4 className="text-sm font-bold text-white">Reproduciendo</h4>
                      <p className="text-xs text-slate-400 line-clamp-1">{asset.name}</p>
                   </div>
                 </div>
                 <button 
                    onClick={onCloseAudio}
                    className="p-1.5 rounded-full hover:bg-slate-800 text-slate-500 hover:text-white transition-colors"
                    title="Cerrar reproductor"
                 >
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                 </button>
               </div>
               
               <audio controls autoPlay className="w-full h-8 accent-emerald-500" src={`http://localhost:3000/assets/${asset.path}`}>
                 Tu navegador no soporta el elemento de audio.
               </audio>
             </div>
          ))}

          {/* Related Video Assets - Embedded Player */}
          {metadata && (metadata as any).relatedAssets?.filter((a: any) => a.type === 'video').map((asset: any) => (
             <div key={asset.path} className="mb-10 rounded-2xl overflow-hidden border border-[var(--border-color)] shadow-xl bg-black">
               <div className="bg-[var(--bg-surface)] p-3 border-b border-[var(--border-color)] flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                 <Video size={16} />
                 <span className="text-xs font-bold text-[var(--text-main)]">Video Complementario: {asset.name}</span>
               </div>
               <div className="aspect-video bg-black">
                 <video controls className="w-full h-full">
                   <source src={`http://localhost:3000/assets/${asset.path}`} />
                   Tu navegador no soporta el elemento de video.
                 </video>
               </div>
             </div>
          ))}

          <div 
            className="content-area"
            dangerouslySetInnerHTML={{ __html: processedHtml }} 
          />

          {/* Script Content Area */}
          {metadata?.showScript && scriptHtml && (
            <div className="mt-12 p-8 rounded-3xl bg-blue-500/5 border border-blue-500/20 animate-in fade-in slide-in-from-bottom-4 duration-700 relative group">
               <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-2 text-blue-500">
                    <FileTextIcon size={20} />
                    <span className="text-sm font-bold uppercase tracking-wider">Guion de la lección</span>
                 </div>
                 <button 
                    onClick={onCloseScript}
                    className="p-2 rounded-xl bg-blue-500/10 hover:bg-red-500/10 text-blue-500 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    title="Cerrar guion"
                 >
                   <span className="text-xs font-bold">Cerrar</span>
                 </button>
               </div>
                <div 
                 className="prose prose-invert prose-blue max-w-none script-content"
                 dangerouslySetInnerHTML={{ __html: getProcessedHtml(scriptHtml) }} 
               />
            </div>
          )}

          {/* Exercises, Evaluations, and Scripts - Grid REMOVED */}
        </>
      ) : renderMedia()}
    </div>
  );
};

export const ContentRenderer = React.memo(ContentRendererBase, (prev, next) => {
  if (prev.html !== next.html || prev.path !== next.path) return false;
  
  const pMeta = (prev.metadata || {}) as any;
  const nMeta = (next.metadata || {}) as any;
  
  if (pMeta.showAudio !== nMeta.showAudio) return false;
  if (pMeta.showScript !== nMeta.showScript) return false;
  if (pMeta.poster !== nMeta.poster) return false;
  
  if (JSON.stringify(pMeta.relatedAssets) !== JSON.stringify(nMeta.relatedAssets)) return false;

  return true; 
});
