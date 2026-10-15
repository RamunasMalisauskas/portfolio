import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import projectData from "../data/projects.json";
import ArrowUpRight from "./ArrowUpRight";

type Project = {
  title: string;
  kind: string;
  description: string;
  stack: string[];
  liveUrl: string;
  sourceUrl: string;
  placeholder: boolean;
  visual: string;
  mobile?: boolean;
};

const projects: Project[] = projectData;

const mindleticAppImages = [
  "mindletic_home.PNG",
  "mindletic_pleasant.PNG",
  "mindletic_balance.PNG",
  "mindletic_breathing.PNG",
  "mindletic_emotion.PNG",
  "mindletic_dark.PNG",
  "mindletic_energy.PNG",
  "mindletic_health.PNG",
  "mindletic_paths.PNG",
  "mindletic_profesionals.PNG",
  "mindletic_selection.PNG",
  "mindletic_sound.PNG",
  "mindletic_streak.PNG",
  "mindletic_timeline.PNG",
];

const mindleticDashboardImages = [
  "mindletic_dashboard_home.png",
  "mindletic_dashboard_3.png",
  "mindletic_dashboard_home_2.png",
  "mindletic_dashboard_involvement.png",
];

const schoolImages = [
  "ssm_home.png",
  "ssm_first.png",
  "ssm_methods.png",
  "ssm_product.png",
  "ssm_product2.png",
  "ssm_team.png",
];

function imageSrc(file: string) {
  return `${import.meta.env.BASE_URL}${file}`;
}

function carouselId(title: string) {
  return `carousel-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
}

function imagesFor(title: string) {
  const name = title.toLowerCase();
  if (name.includes("dashboard")) return mindleticDashboardImages;
  if (name.includes("mindletic")) return mindleticAppImages;
  if (name.includes("sveiko") || name.includes("mokykla")) return schoolImages;
  return [];
}

function ProjectArtwork({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  return (
    <div
      className={`project-art project-art--${project.visual}`}
      aria-hidden="true"
    >
      <div className="project-art__chrome">
        <span className="project-art__mark">RM / WORK</span>
        <span>0{index + 1} — 03</span>
      </div>
      {project.visual === "shop" && (
        <div className="shop-preview">
          <div className="shop-preview__copy">
            <span>GOOD THINGS, WELL MADE</span>
            <strong>
              Make room
              <br />
              for better.
            </strong>
            <i>EXPLORE THE COLLECTION ↗</i>
          </div>
          <div className="shop-preview__object">
            <span>
              FORM
              <br />
              01
            </span>
          </div>
          <div className="shop-preview__caption">
            OBJECTS FOR EVERYDAY LIVING&nbsp; · &nbsp;2026
          </div>
        </div>
      )}
      {project.visual === "signal" && (
        <div className="signal-preview">
          <div className="signal-preview__heading">
            <span>WEEKLY OVERVIEW</span>
            <b>↗</b>
          </div>
          <strong>
            Everything
            <br />
            in focus.
          </strong>
          <div className="signal-preview__chart">
            {[32, 54, 42, 68, 51, 84, 62, 93, 71, 100, 78, 88].map(
              (height, i) => (
                <span key={i} style={{ height: `${height}%` }} />
              ),
            )}
          </div>
          <div className="signal-preview__foot">
            <span>THIS MONTH</span>
            <b>+ 24.8%</b>
          </div>
        </div>
      )}
      {project.visual === "mobile" && (
        <div className="mobile-preview">
          <div className="mobile-preview__phone">
            <div className="mobile-preview__status">
              <span>9:41</span>
              <span>●●●　▰</span>
            </div>
            <div className="mobile-preview__brand">
              little things<span>✳</span>
            </div>
            <small>YOUR DAY, AT YOUR PACE</small>
            <strong>
              Make space
              <br />
              for what matters.
            </strong>
            <div className="mobile-preview__button">
              Start with one thing&nbsp; ↗
            </div>
          </div>
          <div className="mobile-preview__aside">
            A SMALLER SCREEN.
            <br />
            THE SAME CARE.
          </div>
        </div>
      )}
      <span className="project-art__stamp">PREVIEW PLACEHOLDER</span>
    </div>
  );
}

function ProjectCarousel({
  id,
  images,
  title,
  startIndex,
  onClose,
}: {
  id: string;
  images: string[];
  title: string;
  startIndex: number;
  onClose: () => void;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(startIndex);
  const count = images.length;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;

    dialog.showModal();

    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        setIndex((current) => (current + 1) % count);
      } else if (event.key === "ArrowLeft") {
        setIndex((current) => (current - 1 + count) % count);
      }
    }

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [count]);

  return createPortal(
    <dialog
      ref={dialogRef}
      id={id}
      className="project-modal"
      aria-label={`${title} gallery`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="project-modal__panel"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="project-modal__header">
          <p>{title}</p>
          <button type="button" onClick={onClose}>
            X
          </button>
        </div>
        <div
          className="project-carousel"
          role="region"
          aria-roledescription="carousel"
          aria-label={`${title} images`}
        >
          <img
            src={imageSrc(images[index])}
            alt={`${title}, image ${index + 1} of ${count}`}
          />
          <div className="project-carousel__bar">
            <button
              type="button"
              onClick={() =>
                setIndex((current) => (current - 1 + count) % count)
              }
              disabled={count < 2}
            >
              Previous
            </button>
            <span>
              {index + 1} / {count}
            </span>
            <button
              type="button"
              onClick={() => setIndex((current) => (current + 1) % count)}
              disabled={count < 2}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}

function Work() {
  const [openGallery, setOpenGallery] = useState<{
    title: string;
    index: number;
  } | null>(null);
  const openProject =
    projects.find((project) => project.title === openGallery?.title) ?? null;
  const openImages = openProject ? imagesFor(openProject.title) : [];

  return (
    <section
      className="work-section section wrap"
      id="work"
      aria-labelledby="work-title"
    >
      <div className="section-heading">
        <h2 id="work-title">
          Selected projects<span className="highlight-word__dot">.</span>
        </h2>

        <p className="section-heading__aside">
          A few places to start.
          <br />
          More to come.
        </p>
      </div>

      <div className="project-grid">
        {projects.map((project, index) => {
          const images = imagesFor(project.title);
          const isOpen = openGallery?.title === project.title;
          const previewImages = project.mobile
            ? images.slice(0, 3)
            : images.slice(0, 1);

          return (
            <article
              className={project.mobile ? "project project--mobile" : "project"}
              key={project.title}
            >
              {previewImages.length > 0 ? (
                <div className="project__shots">
                  {previewImages.map((file, shotIndex) => (
                    <button
                      key={file}
                      type="button"
                      className="project-cover"
                      aria-haspopup="dialog"
                      aria-expanded={isOpen && openGallery?.index === shotIndex}
                      aria-controls={carouselId(project.title)}
                      onClick={() =>
                        setOpenGallery((current) =>
                          current?.title === project.title &&
                          current.index === shotIndex
                            ? null
                            : { title: project.title, index: shotIndex },
                        )
                      }
                    >
                      <img
                        src={imageSrc(file)}
                        alt={`${project.title} screen ${shotIndex + 1}`}
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <ProjectArtwork project={project} index={index} />
              )}
              <div className="project__meta">
                <div className="project__title-row">
                  <div>
                    <p className="project__kind">{project.kind}</p>
                    <h3>{project.title}</h3>
                  </div>
                  <span className="project__index">0{index + 1}</span>
                </div>
                <p className="project__description">{project.description}</p>
                <ul className="tag-list" aria-label="Technologies">
                  {project.stack.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>

                <div className="project__links">
                  <a
                    onClick={() =>
                      setOpenGallery((current) =>
                        current?.title === project.title && current.index === 0
                          ? null
                          : { title: project.title, index: 0 },
                      )
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    Preview <ArrowUpRight />
                  </a>
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noreferrer">
                      Live demo <ArrowUpRight />
                    </a>
                  )}
                  {project.sourceUrl && (
                    <a
                      href={project.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Source code <ArrowUpRight />
                    </a>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
      {openProject && openImages.length > 0 && (
        <ProjectCarousel
          key={`${openProject.title}-${openGallery?.index ?? 0}`}
          id={carouselId(openProject.title)}
          images={openImages}
          title={openProject.title}
          startIndex={openGallery?.index ?? 0}
          onClose={() => setOpenGallery(null)}
        />
      )}
    </section>
  );
}

export default Work;
