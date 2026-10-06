import { Sparkles } from 'lucide-react';
import { coverForStyle } from '../lib/projects.js';

export function ProjectCover({ project, className = '', showShade = false }) {
  if (project?.image) {
    return (
      <div className={`project-cover ${className}`}>
        <img src={project.image} alt="" />
        {showShade && <div className="project-cover-shade" />}
      </div>
    );
  }
  const cover = project?.cover || coverForStyle(project?.style);
  return (
    <div className={`project-cover project-cover-${cover} ${className}`}>
      <div className="cover-sun" />
      <div className="cover-shape cover-shape-a" />
      <div className="cover-shape cover-shape-b" />
      <div className="cover-foreground" />
      {cover === 'garden' ? (
        <div className="cover-flower">✿</div>
      ) : cover === 'fractions' ? (
        <div className="fraction-art">
          <span>½</span>
          <span>¼</span>
          <span>¾</span>
        </div>
      ) : (
        <Sparkles size={36} />
      )}
      {showShade && <div className="project-cover-shade" />}
    </div>
  );
}
