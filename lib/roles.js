export const DEPARTMENTS = [
  "Engineering",
  "Design",
  "Marketing",
  "Sales",
  "HR",
  "Finance",
  "Operations",
  "Product",
  "Legal",
  "Executive",
  "SEO",
  "Content Writer",
  "Ads",
  "Web Development",
];

export const DEFAULT_DESIGNATIONS = [
  "Project Manager",
  "Team Leader",
  "Management",
  "Team Member",
  "HR",
];

export function getDesignations() {
  try {
    const custom = JSON.parse(localStorage.getItem("custom_designations") || "[]");
    return [...DEFAULT_DESIGNATIONS, ...custom.filter(d => !DEFAULT_DESIGNATIONS.includes(d))];
  } catch { return DEFAULT_DESIGNATIONS; }
}

export function addDesignation(name) {
  try {
    const custom = JSON.parse(localStorage.getItem("custom_designations") || "[]");
    if (!custom.includes(name) && !DEFAULT_DESIGNATIONS.includes(name)) {
      custom.push(name);
      localStorage.setItem("custom_designations", JSON.stringify(custom));
    }
  } catch {}
}

export function removeDesignation(name) {
  try {
    const custom = JSON.parse(localStorage.getItem("custom_designations") || "[]");
    localStorage.setItem("custom_designations", JSON.stringify(custom.filter(d => d !== name)));
  } catch {}
}

// Invalidated submissions helpers
export function getInvalidated() {
  try { return JSON.parse(localStorage.getItem("invalidated_submissions") || "[]"); } catch { return []; }
}
export function isInvalidated(reviewerEmail, personName, formId) {
  return getInvalidated().some(i => i.reviewerEmail===reviewerEmail && i.personName===personName && i.formId===formId);
}
export function invalidateSubmission(reviewerEmail, personName, formId) {
  const list = getInvalidated();
  if (!isInvalidated(reviewerEmail, personName, formId)) {
    list.push({ reviewerEmail, personName, formId, invalidatedAt: new Date().toISOString() });
    localStorage.setItem("invalidated_submissions", JSON.stringify(list));
  }
}
export function restoreSubmission(reviewerEmail, personName, formId) {
  localStorage.setItem("invalidated_submissions",
    JSON.stringify(getInvalidated().filter(i => !(i.reviewerEmail===reviewerEmail && i.personName===personName && i.formId===formId)))
  );
}
