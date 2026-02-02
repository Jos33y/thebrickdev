/**
 * Projects - Recent Work showcase
 * Magazine/Case Study hybrid layout
 * Easy to update - just add projects to portfolio.js
 */

import { CheckIcon, ArrowRightIcon, ExternalLinkIcon } from '../common';
import { projects } from '../../data/portfolio';

const Projects = () => {
  // Separate live and in-development projects
  const liveProjects = projects.filter(p => p.status === 'live');
  const devProjects = projects.filter(p => p.status === 'development');

  return (
    <section className="section" id="work">
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <span className="section-label">Recent Work</span>
          <h2 className="section-title">Projects that deliver results</h2>
          <p className="section-description">
            Real businesses, real outcomes. Here's some of our recent work.
          </p>
        </div>

        {/* Projects Magazine Grid */}
        <div className="projects-magazine">
          {liveProjects.map((project, index) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              layout={getLayoutType(index, liveProjects.length)}
            />
          ))}
          
          {/* In Development Projects */}
          {devProjects.map((project) => (
            <ProjectCard 
              key={project.id} 
              project={project} 
              layout="full"
              inDevelopment
            />
          ))}
        </div>
      </div>
    </section>
  );
};

/**
 * Determine layout type based on index
 * Creates visual variety without being predictable
 */
const getLayoutType = (index, total) => {
  // First project: full width (hero)
  if (index === 0) return 'full';
  
  // Last project if odd count: full width
  if (index === total - 1 && total % 2 === 0) return 'full';
  
  // Middle projects: half width (2-column)
  return 'half';
};

/**
 * Project Card Component
 */
const ProjectCard = ({ project, layout, inDevelopment = false }) => {
  const isHalf = layout === 'half';
  
  return (
    <article 
      className={`project-card project-card--${layout} ${inDevelopment ? 'project-card--dev' : ''}`}
    >
      {/* Project Image */}
      <div className="project-card__image">
        <img
          src={project.screenshot}
          alt={`${project.name} screenshot`}
          loading="lazy"
        />
        
        {/* Category Badge */}
        <span className="project-card__category">{project.category}</span>
        
        {/* In Development Overlay */}
        {inDevelopment && (
          <div className="project-card__dev-overlay">
            <span className="project-card__dev-badge">
              <span className="dev-pulse"></span>
              In Development
            </span>
          </div>
        )}
      </div>

      {/* Project Content */}
      <div className="project-card__content">
        <div className="project-card__header">
          <h3 className="project-card__title">{project.name}</h3>
          <p className="project-card__tagline">{project.tagline}</p>
        </div>
        
        {/* Description - only on full width */}
        {!isHalf && (
          <p className="project-card__description">{project.description}</p>
        )}

        {/* Outcomes */}
        <div className="project-card__outcomes">
          {project.outcomes.slice(0, isHalf ? 2 : 3).map((outcome, index) => (
            <div key={index} className="project-card__outcome">
              <CheckIcon className="project-card__outcome-icon" size={16} />
              <span>{outcome}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="project-card__footer">
          {/* Tech Stack - only on full width */}
          {!isHalf && project.techStack && (
            <div className="project-card__tech">
              {project.techStack.slice(0, 4).map((tech, index) => (
                <span key={index} className="project-card__tech-tag">{tech}</span>
              ))}
            </div>
          )}
          
          {/* Link */}
          {project.url ? (
            <a
              href={project.url}
              className="project-card__link"
              target="_blank"
              rel="noopener noreferrer"
            >
              View Live Site
              <ExternalLinkIcon size={14} />
            </a>
          ) : inDevelopment ? (
            <span className="project-card__link project-card__link--coming">
              Coming Soon
              <ArrowRightIcon size={14} />
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
};

export default Projects;