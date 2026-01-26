import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Brain, CheckSquare } from 'lucide-react';

interface CourseAssetsProps {
  assets: {
    type: 'audio' | 'video' | 'exercise' | 'evaluation' | 'script';
    path: string;
    name: string;
    url?: string;
  }[] | undefined;
}

export const CourseAssets: React.FC<CourseAssetsProps> = ({ assets }) => {
  if (!assets || assets.length === 0) return null;

  return (
    <div className="mt-8 flex flex-wrap gap-4 justify-center print:hidden">
      {assets.map((asset) => (
        <Link
          key={asset.path}
          to={
            asset.type === "evaluation"
              ? `/evaluation/${asset.path}`
              : `/course/${asset.path}`
          }
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] transition-all text-xs font-bold uppercase tracking-wider"
        >
          {asset.type === "audio" && <Music size={14} />}
          {asset.type === "evaluation" && <Brain size={14} />}
          {asset.type === "exercise" && <CheckSquare size={14} />}
          {asset.name}
        </Link>
      ))}
    </div>
  );
};
