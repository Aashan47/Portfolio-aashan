async function init(){
  const res = await fetch("data.json", { cache: "no-store" });
  const data = await res.json();
  document.title = data.meta.title;

  renderHero(data);
  renderProjects(data);
  renderApproach(data);
  renderExperience(data);
  renderPublications(data);
  renderSkills(data);
  renderContact(data);
  buildJSONLD(data);
  setupActiveNav();
}

const safe = v => String(v ?? "");

function el(html){
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function copyToClipboard(text){
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}
function fallbackCopy(text){
  const ta = document.createElement("textarea");
  ta.value = text;
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand("copy"); } catch (e) {}
  document.body.removeChild(ta);
}
function flashLabel(node, flashText, originalText, ms = 1500){
  node.textContent = flashText;
  setTimeout(() => { node.textContent = originalText; }, ms);
}

function renderHero(data){
  const { person } = data;
  document.querySelector(".brand").textContent = person.name;
  document.getElementById("heroRole").textContent = person.role;
  document.getElementById("heroName").textContent = person.name;
  document.getElementById("heroTagline").textContent = person.tagline;

  const emailBtn = document.getElementById("emailBtn");
  emailBtn.addEventListener("click", e => {
    e.preventDefault();
    copyToClipboard(person.email);
    flashLabel(emailBtn, "Copied", "Copy email");
  });

  document.getElementById("socialGithub").href = person.github;
  document.getElementById("socialLinkedin").href = person.linkedin;
}

function renderProjects(data){
  const container = document.getElementById("projectList");
  data.projects.forEach(p => {
    const linksHtml = (p.links || []).map(l =>
      `<a href="${safe(l.url)}" target="_blank" rel="noopener">${safe(l.label)} ↗</a>`
    ).join("");

    const resultsHtml = Array.isArray(p.results)
      ? `<ul>${p.results.map(r => `<li>${safe(r)}</li>`).join("")}</ul>`
      : `<p>${safe(p.results)}</p>`;

    const tagsHtml = (p.tags || []).map(t => `<span class="chip">${safe(t)}</span>`).join("");

    const approachHtml = p.approach ? `
      <div class="project-block">
        <span class="label">Approach</span>
        ${p.approach.data ? `<p><strong>Data:</strong> ${safe(p.approach.data)}</p>` : ""}
        ${p.approach.models ? `<p><strong>Models:</strong> ${safe(p.approach.models)}</p>` : ""}
        ${p.approach.why ? `<p class="why"><strong>Why:</strong> ${safe(p.approach.why)}</p>` : ""}
      </div>
    ` : "";

    const article = el(`
      <article class="project">
        <div class="project-body">
          <h3 class="project-title">${safe(p.title)}</h3>
          <p class="project-tagline">${safe(p.tagline)}</p>

          ${p.problem ? `
          <div class="project-block">
            <span class="label">Problem</span>
            <p>${safe(p.problem)}</p>
          </div>` : ""}

          ${approachHtml}

          ${p.results ? `
          <div class="project-block">
            <span class="label">Results</span>
            ${resultsHtml}
          </div>` : ""}

          ${p.deployment ? `
          <div class="project-block">
            <span class="label">Deployment</span>
            <p>${safe(p.deployment)}</p>
          </div>` : ""}

          ${tagsHtml ? `<div class="project-tags">${tagsHtml}</div>` : ""}
          ${linksHtml ? `<div class="project-links">${linksHtml}</div>` : ""}
        </div>
        ${p.image ? `
        <div class="project-media">
          <img src="${safe(p.image)}" alt="${safe(p.alt)}" loading="lazy"/>
        </div>` : ""}
      </article>
    `);
    container.appendChild(article);
  });
}

function renderApproach(data){
  const container = document.getElementById("approachList");
  if (!container || !data.how_i_think) return;
  data.how_i_think.forEach(item => {
    container.appendChild(el(`
      <div class="approach-item">
        <h3>${safe(item.heading)}</h3>
        <p>${safe(item.body)}</p>
      </div>
    `));
  });
}

function renderExperience(data){
  const tl = document.getElementById("timeline");
  data.experience.forEach(xp => {
    const bullets = xp.bullets.map(b => `<li>${safe(b)}</li>`).join("");
    tl.appendChild(el(`
      <div class="tl-item">
        <div class="tl-meta">${safe(xp.from)} to ${safe(xp.to)}<br/>${safe(xp.location)}</div>
        <div>
          <h3 class="tl-role">${safe(xp.role)}</h3>
          <p class="tl-place">${safe(xp.place)}</p>
          <ul class="tl-bullets">${bullets}</ul>
        </div>
      </div>
    `));
  });
}

function renderPublications(data){
  const list = document.getElementById("pubList");
  data.publications.forEach(pub => {
    const links = (pub.links || []).map(l =>
      `<a href="${safe(l.url)}" target="_blank" rel="noopener">${safe(l.label)} ↗</a>`
    ).join("");
    list.appendChild(el(`
      <li>
        <p class="pub-title">${safe(pub.title)}</p>
        <p class="pub-meta">${safe(pub.year)} · ${safe(pub.status)}</p>
        <p class="pub-summary">${safe(pub.summary)}</p>
        <div class="pub-links">${links}</div>
      </li>
    `));
  });
}

function renderSkills(data){
  const grid = document.getElementById("skillGrid");
  Object.entries(data.skills).forEach(([group, items]) => {
    const chips = items.map(s => `<span class="chip">${safe(s)}</span>`).join("");
    grid.appendChild(el(`
      <div class="skill-group">
        <h4>${safe(group)}</h4>
        <div class="chips">${chips}</div>
      </div>
    `));
  });

  const eduLine = document.getElementById("eduLine");
  if (data.education && eduLine) {
    const e = data.education;
    eduLine.innerHTML = `<strong>Education</strong> ${safe(e.degree)}, ${safe(e.school)}${e.location ? ` (${safe(e.location)})` : ""}`;
  }

  const certLine = document.getElementById("certLine");
  if (data.certifications_summary && certLine) {
    const link = data.certifications_link
      ? ` · <a href="${safe(data.certifications_link)}" target="_blank" rel="noopener">verification folder ↗</a>`
      : "";
    certLine.innerHTML = `<strong>Certifications</strong> ${safe(data.certifications_summary)}${link}`;
  }
}

function renderContact(data){
  const { person } = data;
  const emailLink = document.getElementById("emailLink");
  const emailText = document.getElementById("emailText");
  emailText.textContent = person.email;
  emailLink.addEventListener("click", e => {
    e.preventDefault();
    copyToClipboard(person.email);
    flashLabel(emailText, "copied to clipboard", person.email);
  });

  document.getElementById("footerLinkedin").href = person.linkedin;
  document.getElementById("footerGithub").href = person.github;
}

function setupActiveNav(){
  const links = [...document.querySelectorAll(".nav ul a[data-section]")];
  const map = new Map(links.map(a => [a.dataset.section, a]));
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove("active"));
        const link = map.get(e.target.id);
        if (link) link.classList.add("active");
      }
    });
  }, { rootMargin: "0px 0px -70% 0px", threshold: 0.1 });

  ["projects","approach","experience","publications","skills","contact"].forEach(id => {
    const node = document.getElementById(id);
    if (node) obs.observe(node);
  });
}

function buildJSONLD(data){
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": data.person.name,
    "email": `mailto:${data.person.email}`,
    "url": data.meta.canonical,
    "sameAs": [data.person.linkedin, data.person.github]
  };
  const works = data.publications.map(p => ({
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": p.title,
    "url": p.links?.[0]?.url,
    "datePublished": String(p.year),
    "description": p.summary
  }));
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify([person, ...works]);
  document.head.appendChild(script);
}

document.addEventListener("DOMContentLoaded", init);
