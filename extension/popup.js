const status = document.querySelector("#status");
const result = document.querySelector("#result");

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({
    "&":"&amp;",
    "<":"&lt;",
    ">":"&gt;",
    '"':"&quot;",
    "'":"&#39;"
  }[c]));
}

function render(data) {
  result.innerHTML = `
    <div class="card">
      <dl>
        <dt>Page</dt>
        <dd>${escapeHtml(data.title || "Unknown")}</dd>

        <dt>DOI</dt>
        <dd>${escapeHtml(data.doi || "Not detected")}</dd>

        <dt>Authors</dt>
        <dd>${escapeHtml(data.authors || "Not detected")}</dd>

        <dt>Publication date</dt>
        <dd>${escapeHtml(data.date || "Not detected")}</dd>

        <dt>External resources</dt>
        <dd>${escapeHtml(data.externalCount)}</dd>

        <dt>Images without alt text</dt>
        <dd>${escapeHtml(data.imagesWithoutAlt)}</dd>

        <dt>Tracking indicators</dt>
        <dd>${escapeHtml(data.trackingIndicators)}</dd>
      </dl>
    </div>

    <div class="card">
      <strong>Privacy</strong>
      <p class="${data.trackingIndicators ? "warn" : "ok"}">
        ${data.trackingIndicators
          ? "Potential tracking indicators detected."
          : "No basic tracking indicators detected."}
      </p>
      <small>
        No page content is sent to an external service by this extension.
      </small>
    </div>

    <div class="card">
      <strong>Reference status</strong>
      <p>
        ${escapeHtml(
          data.doi
            ? "DOI detected — metadata still requires verification."
            : "Insufficient metadata for reliable citation generation."
        )}
      </p>
    </div>
  `;
}

browser.tabs.query({
  active: true,
  currentWindow: true
}).then(async tabs => {

  const tab = tabs[0];

  if (!tab?.id) {
    throw new Error("No active tab");
  }

  const results = await browser.scripting.executeScript({
    target: { tabId: tab.id },

    func: () => {

      const meta = name =>
        document.querySelector(`meta[name="${name}"]`)?.content ||
        document.querySelector(`meta[property="${name}"]`)?.content ||
        "";

      const doiMatch =
        document.body?.innerText?.match(
          /\b10\.\d{4,9}\/[-._;()/:A-Z0-9]+\b/i
        );

      const external = [
        ...document.querySelectorAll(
          "script[src],img[src],iframe[src],link[href]"
        )
      ];

      const tracking = [
        ...document.querySelectorAll(
          "script[src],img[src],iframe[src]"
        )
      ].filter(el => {

        const u = el.src || "";

        return /google-analytics|googletagmanager|doubleclick|facebook\.net|hotjar|matomo|clarity\.ms/i.test(u);

      }).length;

      return {
        title: document.title,
        doi: meta("citation_doi") || doiMatch?.[0] || "",
        authors: meta("citation_author") || meta("author"),
        date:
          meta("citation_publication_date") ||
          meta("article:published_time"),

        externalCount: external.length,

        imagesWithoutAlt:
          [...document.images]
            .filter(img => !img.hasAttribute("alt"))
            .length,

        trackingIndicators: tracking
      };
    }
  });

  render(results[0].result);

  status.textContent = "Inspection complete";

}).catch(error => {

  status.textContent = "This page cannot be inspected.";
  result.textContent = error.message;

});
