
const STATE = {
  data: null,
  sections: ["home","projects","publications","about","experience","skills","achievements","certifications","contact"]
};

async function init(){
  const res = await fetch("data.json", {cache: "no-store"});
  const data = await res.json();
  STATE.data = data;
  document.title = data.meta.title;
  renderHero(data);
  renderProjects(data);
  renderPublications(data);
  renderExperience(data);
  renderSkills(data);
  renderAbout(data);
  renderFooter(data);
  buildJSONLD(data);
  setupActiveNav();
}

function el(html){
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

function safe(text){ return String(text ?? "") }

function renderHero(data){
  const {person} = data;
  document.querySelector("#brand").textContent = person.name;
  document.querySelector("#home .name").textContent = person.name;
  document.querySelector("#home .tag").textContent = person.tagline;
  
  // Setup copy email button
  const emailBtn = document.querySelector("#emailBtn");
  if(emailBtn && person.email) {
    emailBtn.href = "#";
    emailBtn.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Copy email to clipboard
      navigator.clipboard.writeText(person.email).then(() => {
        // Show success feedback
        const originalText = emailBtn.innerHTML;
        emailBtn.innerHTML = '<img class="icon" src="assets/icons/email.svg" alt="" aria-hidden="true"/> Copied!';
        emailBtn.style.background = 'var(--accent)';
        emailBtn.style.color = 'white';
        
        // Reset after 2 seconds
        setTimeout(() => {
          emailBtn.innerHTML = originalText;
          emailBtn.style.background = '';
          emailBtn.style.color = '';
        }, 2000);
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = person.email;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        // Show success feedback
        const originalText = emailBtn.innerHTML;
        emailBtn.innerHTML = '<img class="icon" src="assets/icons/email.svg" alt="" aria-hidden="true"/> Copied!';
        emailBtn.style.background = 'var(--accent)';
        emailBtn.style.color = 'white';
        
        setTimeout(() => {
          emailBtn.innerHTML = originalText;
          emailBtn.style.background = '';
          emailBtn.style.color = '';
        }, 2000);
      });
    });
  }
  
  // Setup resume dropdown
  const resumeBtn = document.querySelector("#resumeBtn");
  const resumeDropdown = document.querySelector("#resumeDropdown");
  
  if(resumeBtn && resumeDropdown && person.resumes) {
    resumeBtn.href = "#";
    
    // Show dropdown on click
    resumeBtn.addEventListener('click', function(e) {
      e.preventDefault();
      resumeDropdown.classList.toggle('hidden');
    });
    
    // Handle resume option clicks
    const resumeOptions = document.querySelectorAll('.resume-option');
    resumeOptions.forEach(option => {
      option.addEventListener('click', function() {
        const type = this.dataset.type;
        const resume = person.resumes[type];
        
        if(resume && resume.file) {
          // Create temporary link and trigger download
          const link = document.createElement('a');
          link.href = resume.file;
          link.download = resume.file.split('/').pop();
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          // Hide dropdown
          resumeDropdown.classList.add('hidden');
        }
      });
    });
    
    // Hide dropdown when clicking outside
    document.addEventListener('click', function(e) {
      if (!resumeBtn.contains(e.target) && !resumeDropdown.contains(e.target)) {
        resumeDropdown.classList.add('hidden');
      }
    });
  }

  const li = document.querySelector("#socialLinkedin");
  const gh = document.querySelector("#socialGithub");
  li.href = person.linkedin;
  gh.href = person.github;
}

function renderProjects(data){
  const container = document.querySelector("#projects .grid");
  data.projects.forEach(p => {
    // Handle both old format (single link) and new format (multiple links)
    let linksHtml = '';
    if (p.links && Array.isArray(p.links)) {
      // New format with multiple links
      linksHtml = p.links.map((link, index) => 
        `<a href="${safe(link.url)}" class="btn ${index > 0 ? 'btn-secondary ml-8' : ''}" target="_blank" rel="noopener">
          <img class="icon" src="assets/icons/external.svg" alt="" aria-hidden="true"/> ${safe(link.label)}
        </a>`
      ).join(' ');
    } else if (p.link) {
      // Old format with single link
      linksHtml = `<a href="${safe(p.link)}" class="btn" target="_blank" rel="noopener">
        <img class="icon" src="assets/icons/external.svg" alt="" aria-hidden="true"/> ${safe(p.linkLabel || "Open")}
      </a>`;
    }

    const primaryLink = p.links ? p.links[0]?.url : p.link;
    
    const card = el(`
      <article class="card col-6 col-4" tabindex="0">
        <a class="thumb" href="${safe(primaryLink)}" target="_blank" rel="noopener">
          <img src="${safe(p.image)}" loading="lazy" alt="${safe(p.alt)}"/>
        </a>
        <h3>${safe(p.title)}</h3>
        <p>${safe(p.summary)}</p>
        <p class="meta">${safe(p.metric)}</p>
        <div class="chips">
          ${p.tags.map(t => `<span class="chip">${safe(t)}</span>`).join("")}
        </div>
        <p class="mt-12">${linksHtml}</p>
      </article>
    `);
    container.appendChild(card);
  });
}

function renderPublications(data){
  const list = document.querySelector("#pubList");
  data.publications.forEach(pub => {
    const linksHtml = pub.links ? pub.links.map(link => 
      `<a href="${safe(link.url)}" target="_blank" rel="noopener">${safe(link.label)}</a>`
    ).join(' · ') : '';
    
    const li = el(`
      <li>
        <strong>${safe(pub.title)}</strong> <span class="muted">(${safe(pub.year)})</span>
        <span class="chip" aria-label="${safe(pub.status)}">${safe(pub.status)}</span><br/>
        <span class="muted">${safe(pub.summary)}</span>
        ${linksHtml ? `<span> · ${linksHtml}</span>` : ''}
      </li>
    `);
    list.appendChild(li);
  });
}

function renderExperience(data){
  const tl = document.querySelector("#timeline");
  data.experience.forEach(xp => {
    const item = el(`
      <div class="tl-item">
        <h3>${safe(xp.role)} — ${safe(xp.place)}</h3>
        <div class="muted">${safe(xp.from)} to ${safe(xp.to)}, ${safe(xp.location)}</div>
        <ul class="mt-8">
          ${xp.bullets.map(b => `<li>${safe(b)}</li>`).join("")}
        </ul>
      </div>
    `);
    tl.appendChild(item);
  });
}

function renderSkills(data){
  const grid = document.querySelector("#skillGrid");
  Object.entries(data.skills).forEach(([group, items]) => {
    const node = el(`
      <div class="skill-group">
        <h4>${safe(group)}</h4>
        <div class="chips">
          ${items.map(s => `<span class="chip">${safe(s)}</span>`).join("")}
        </div>
      </div>
    `);
    grid.appendChild(node);
  });
}

function renderAbout(data){
  const aboutP = document.querySelector("#about p");
  aboutP.innerHTML = `My research focuses on advancing <strong>AI for sustainability and climate science</strong>, with particular emphasis on high-resolution climate monitoring, geospatial foundation models, and computer vision applications for environmental understanding. I explore how machine learning can address critical climate challenges through innovative approaches in <strong>climate informatics, geospatial modeling, and diffusion models</strong> for large-scale environmental forecasting. My work investigates novel methods for downscaling climate data, detecting environmental changes, and creating intelligent systems that contribute to our understanding of Earth's changing climate patterns.`;
}

function renderFooter(data){
  const {person} = data;
  const footerEmail = document.querySelector("#footerEmail");
  const footerEmailSpan = document.querySelector("#footerEmail span");
  const footerLinkedin = document.querySelector("#footerLinkedin");
  const footerGithub = document.querySelector("#footerGithub");
  const openTo = document.querySelector("#openTo");
  
  if(footerEmail && person.email) {
    footerEmail.href = "#";
    // Add copy functionality to footer email too
    footerEmail.addEventListener('click', function(e) {
      e.preventDefault();
      navigator.clipboard.writeText(person.email).then(() => {
        const originalText = footerEmailSpan.textContent;
        footerEmailSpan.textContent = 'Copied!';
        setTimeout(() => {
          footerEmailSpan.textContent = originalText;
        }, 2000);
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = person.email;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        const originalText = footerEmailSpan.textContent;
        footerEmailSpan.textContent = 'Copied!';
        setTimeout(() => {
          footerEmailSpan.textContent = originalText;
        }, 2000);
      });
    });
  }
  if(footerEmailSpan) {
    footerEmailSpan.textContent = person.email;
  }
  if(footerLinkedin) {
    footerLinkedin.href = person.linkedin;
  }
  if(footerGithub) {
    footerGithub.href = person.github;
  }
  if(openTo) {
    openTo.textContent = person.open_to || "";
  }
}

function setupActiveNav(){
  const links = [...document.querySelectorAll(".nav a[data-section]")];
  const map = new Map(links.map(a => [a.dataset.section, a]));
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if(e.isIntersecting){
        const id = e.target.id;
        map.forEach(a => a.classList.remove("active"));
        const link = map.get(id);
        if(link) link.classList.add("active");
      }
    });
  }, { rootMargin: "0px 0px -70% 0px", threshold: 0.2 });
  STATE.sections.forEach(id => {
    const el = document.getElementById(id);
    if(el) obs.observe(el);
  });
}

// SEO JSON-LD
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
    "url": p.link,
    "datePublished": String(p.year),
    "description": p.summary
  }));
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify([person, ...works]);
  document.head.appendChild(script);
}

document.addEventListener("DOMContentLoaded", init);
