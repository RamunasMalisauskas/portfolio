import { useEffect, useState } from "react";
import projectData from "../data/projects.json";

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
  images: string[];
};

type DraftImage = {
  id: string;
  name: string;
  file?: File;
  preview: string;
};

type Draft = {
  title: string;
  kind: string;
  description: string;
  stack: string;
  liveUrl: string;
  sourceUrl: string;
  placeholder: boolean;
  visual: string;
  mobile: boolean;
  images: DraftImage[];
};

const visuals = [
  { value: "shop", label: "Shop" },
  { value: "signal", label: "Signal" },
  { value: "mobile", label: "Mobile" },
];

function imageSrc(file: string) {
  return `${import.meta.env.BASE_URL}${file}`;
}

function emptyDraft(): Draft {
  return {
    title: "",
    kind: "",
    description: "",
    stack: "",
    liveUrl: "",
    sourceUrl: "",
    placeholder: false,
    visual: "shop",
    mobile: false,
    images: [],
  };
}

function draftFromProject(project: Project): Draft {
  return {
    title: project.title,
    kind: project.kind,
    description: project.description,
    stack: project.stack.join(", "),
    liveUrl: project.liveUrl,
    sourceUrl: project.sourceUrl,
    placeholder: project.placeholder,
    visual: project.visual,
    mobile: Boolean(project.mobile),
    images: project.images.map((name) => ({
      id: crypto.randomUUID(),
      name,
      preview: imageSrc(name),
    })),
  };
}

function toProject(draft: Draft, images: string[]): Project {
  const project: Project = {
    title: draft.title.trim(),
    kind: draft.kind.trim(),
    description: draft.description.trim(),
    stack: draft.stack
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    liveUrl: draft.liveUrl.trim(),
    sourceUrl: draft.sourceUrl.trim(),
    placeholder: draft.placeholder,
    visual: draft.visual,
    mobile: draft.mobile,
    images,
  };
  return project;
}

async function readError(response: Response) {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error || "Could not save";
  } catch {
    return "Could not save";
  }
}

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Could not read the image"));
        return;
      }
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(new Error("Could not read the image"));
    reader.readAsDataURL(file);
  });
}

async function uploadImage(file: File) {
  const response = await fetch("/api/uploads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: file.name, data: await fileToBase64(file) }),
  });
  if (!response.ok) throw new Error(await readError(response));
  const body = (await response.json()) as { name: string };
  return body.name;
}

function Uploads() {
  const [projects, setProjects] = useState<Project[]>(projectData);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/projects")
      .then(async (response) => {
        if (!response.ok) throw new Error(await readError(response));
        return response.json() as Promise<Project[]>;
      })
      .then((next) => {
        if (active) setProjects(next);
      })
      .catch(() => {
        if (active) setOffline(true);
      });
    return () => {
      active = false;
    };
  }, []);

  function openNew() {
    setEditingIndex(-1);
    setDraft(emptyDraft());
    setMessage("");
    setError("");
  }

  function openEdit(index: number) {
    setEditingIndex(index);
    setDraft(draftFromProject(projects[index]));
    setMessage("");
    setError("");
  }

  function closeForm() {
    draft?.images.forEach((image) => {
      if (image.file) URL.revokeObjectURL(image.preview);
    });
    setDraft(null);
    setEditingIndex(null);
  }

  function updateDraft(patch: Partial<Draft>) {
    setDraft((current) => (current ? { ...current, ...patch } : current));
  }

  function addImages(files: FileList | null) {
    if (!files?.length) return;
    const next = Array.from(files).map((file) => ({
      id: crypto.randomUUID(),
      name: file.name,
      file,
      preview: URL.createObjectURL(file),
    }));
    setDraft((current) =>
      current ? { ...current, images: [...current.images, ...next] } : current,
    );
  }

  function moveImage(index: number, direction: -1 | 1) {
    setDraft((current) => {
      if (!current) return current;
      const target = index + direction;
      if (target < 0 || target >= current.images.length) return current;
      const images = current.images.slice();
      const [image] = images.splice(index, 1);
      images.splice(target, 0, image);
      return { ...current, images };
    });
  }

  function removeImage(index: number) {
    setDraft((current) => {
      if (!current) return current;
      const images = current.images.slice();
      const [image] = images.splice(index, 1);
      if (image?.file) URL.revokeObjectURL(image.preview);
      return { ...current, images };
    });
  }

  async function saveProject() {
    if (!draft || editingIndex === null) return;
    const title = draft.title.trim();
    if (!title) {
      setError("A title is required.");
      return;
    }
    const duplicate = projects.some(
      (project, index) => project.title === title && index !== editingIndex,
    );
    if (duplicate) {
      setError(`“${title}” is already in the list.`);
      return;
    }

    setSaving(true);
    setError("");
    setMessage("");
    try {
      const images: string[] = [];
      for (const image of draft.images) {
        images.push(image.file ? await uploadImage(image.file) : image.name);
      }
      const project = toProject(draft, images);
      const next =
        editingIndex === -1
          ? [...projects, project]
          : projects.map((item, index) => (index === editingIndex ? project : item));
      const response = await fetch("/api/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!response.ok) throw new Error(await readError(response));
      setProjects((await response.json()) as Project[]);
      closeForm();
      setMessage(`Saved “${title}”. The first image is the cover.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not save");
    } finally {
      setSaving(false);
    }
  }

  async function removeProject(index: number) {
    const project = projects[index];
    if (!window.confirm(`Remove “${project.title}” from your work?`)) return;

    setError("");
    setMessage("");
    try {
      const next = projects.filter((_, itemIndex) => itemIndex !== index);
      const response = await fetch("/api/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      if (!response.ok) throw new Error(await readError(response));
      setProjects((await response.json()) as Project[]);
      if (editingIndex === index) closeForm();
      else if (editingIndex !== null && editingIndex > index) {
        setEditingIndex(editingIndex - 1);
      }
      setMessage(`Removed “${project.title}”.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not remove");
    }
  }

  return (
    <section className="uploads section wrap" aria-labelledby="uploads-title">
      <div className="section-heading">
        <h2 id="uploads-title">
          Uploads<span className="highlight-word__dot">.</span>
        </h2>
        <p className="section-heading__aside">
          Add, edit, or remove a project.
          <br />
          The first image is the cover.
        </p>
      </div>

      {offline && (
        <p className="uploads-note" role="status">
          Saving is available while <code>npm run dev</code> is running. Restart
          the dev server if this page was already open.
        </p>
      )}
      {message && (
        <p className="uploads-note" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="uploads-error" role="alert">
          {error}
        </p>
      )}

      <div className="uploads__layout">
        <div className="uploads__list">
          {projects.map((project, index) => (
            <article className="uploads-card" key={project.title}>
              {project.images[0] ? (
                <img src={imageSrc(project.images[0])} alt="" />
              ) : (
                <span className="uploads-card__empty">No image</span>
              )}
              <div>
                <p>{project.kind || "Project"}</p>
                <h3>{project.title}</h3>
              </div>
              <div className="uploads-card__actions">
                <button type="button" onClick={() => openEdit(index)}>
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => void removeProject(index)}
                  disabled={offline}
                >
                  Remove
                </button>
              </div>
            </article>
          ))}
          <button
            className="button button--primary"
            type="button"
            onClick={openNew}
            disabled={offline}
          >
            New project
          </button>
        </div>

        {draft && (
          <form
            className="uploads-form"
            onSubmit={(event) => {
              event.preventDefault();
              void saveProject();
            }}
          >
            <h3>{editingIndex === -1 ? "New project" : "Edit project"}</h3>
            <label>
              Title
              <input
                value={draft.title}
                onChange={(event) => updateDraft({ title: event.target.value })}
                required
              />
            </label>
            <label>
              Kind
              <input
                value={draft.kind}
                onChange={(event) => updateDraft({ kind: event.target.value })}
                placeholder="Website, Mobile app"
              />
            </label>
            <label>
              Description
              <textarea
                value={draft.description}
                onChange={(event) =>
                  updateDraft({ description: event.target.value })
                }
                rows={4}
              />
            </label>
            <label>
              Stack
              <input
                value={draft.stack}
                onChange={(event) => updateDraft({ stack: event.target.value })}
                placeholder="React, TypeScript, Tailwind CSS"
              />
            </label>
            <label>
              Live URL
              <input
                value={draft.liveUrl}
                onChange={(event) => updateDraft({ liveUrl: event.target.value })}
                inputMode="url"
              />
            </label>
            <label>
              Source URL
              <input
                value={draft.sourceUrl}
                onChange={(event) =>
                  updateDraft({ sourceUrl: event.target.value })
                }
                inputMode="url"
              />
            </label>
            <label className="uploads-check">
              <input
                type="checkbox"
                checked={draft.mobile}
                onChange={(event) =>
                  updateDraft({ mobile: event.target.checked })
                }
              />
              Mobile gallery — show the cover plus the next two images
            </label>
            <label className="uploads-check">
              <input
                type="checkbox"
                checked={draft.placeholder}
                onChange={(event) =>
                  updateDraft({ placeholder: event.target.checked })
                }
              />
              Use placeholder artwork when there are no images
            </label>
            <label>
              Placeholder style
              <select
                value={draft.visual}
                onChange={(event) => updateDraft({ visual: event.target.value })}
              >
                {visuals.map((visual) => (
                  <option key={visual.value} value={visual.value}>
                    {visual.label}
                  </option>
                ))}
              </select>
            </label>

            <fieldset className="uploads-images">
              <legend>Images</legend>
              <p>The first image is the main image in the work gallery.</p>
              {draft.images.length === 0 ? (
                <p className="uploads-note">No images yet.</p>
              ) : (
                <ol>
                  {draft.images.map((image, index) => (
                    <li key={image.id}>
                      <img src={image.preview} alt="" />
                      <div>
                        <strong>{index === 0 ? "Main image" : `Image ${index + 1}`}</strong>
                        <span>{image.name}</span>
                      </div>
                      <div className="uploads-card__actions">
                        <button
                          type="button"
                          onClick={() => moveImage(index, -1)}
                          disabled={index === 0}
                        >
                          Up
                        </button>
                        <button
                          type="button"
                          onClick={() => moveImage(index, 1)}
                          disabled={index === draft.images.length - 1}
                        >
                          Down
                        </button>
                        <button type="button" onClick={() => removeImage(index)}>
                          Remove
                        </button>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
              <label className="button button--primary uploads-file">
                Add images
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  multiple
                  onChange={(event) => {
                    addImages(event.target.files);
                    event.target.value = "";
                  }}
                />
              </label>
            </fieldset>

            <div className="uploads__actions">
              <button className="button button--primary" type="submit" disabled={saving || offline}>
                {saving ? "Saving…" : "Save project"}
              </button>
              <button type="button" onClick={closeForm} disabled={saving}>
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

export default Uploads;
