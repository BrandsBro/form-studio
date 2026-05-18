const URL = process.env.NEXT_PUBLIC_SHEETS_URL || "https://script.google.com/macros/s/AKfycbyRwS_UAtUv_5fHvFz61nyHfHx9SS2oOxN0DWamJBS2C46seFPO7RXRlR4fC50Ifv6dZg/exec";

async function get(action, params="") {
  const r = await fetch(`${URL}?action=${action}${params}`, {redirect:"follow"});
  return r.json();
}

async function post(body) {
  const r = await fetch(URL, {method:"POST", headers:{"Content-Type":"text/plain"}, body:JSON.stringify(body), redirect:"follow"});
  return r.json();
}

// ── FORMS ─────────────────────────────────────────────────────────────────────
export async function getForms() {
  try {
    const [fd, cd] = await Promise.all([get("getForms"), get("getConnections")]);
    const forms = fd.forms || [];
    const conns = cd.connections || [];
    return forms.map(f => {
      const c = conns.find(x => x.formId === f.id);
      return {...f, fillerPool: c?.fillerPool||[], connections: c?.connections||[]};
    });
  } catch(e) { console.error("getForms error:", e); return []; }
}

export async function saveForms(forms) {
  try {
    await post({action:"saveForms", forms});
    // Save connections too
    for (const f of forms) {
      if (f.connections?.length || f.fillerPool?.length) {
        await post({action:"saveConnections", formId:f.id, formName:f.name, fillerPool:f.fillerPool||[], connections:f.connections||[]});
      }
    }
  } catch(e) { console.error("saveForms error:", e); }
}

export async function saveFormConnections(form) {
  try {
    await Promise.all([
      post({action:"saveForms", forms:[form]}),
      post({action:"saveConnections", formId:form.id, formName:form.name, fillerPool:form.fillerPool||[], connections:form.connections||[]})
    ]);
  } catch(e) { console.error("saveFormConnections error:", e); }
}

// ── PEOPLE ────────────────────────────────────────────────────────────────────
export async function getPeople() {
  try { const d = await get("getPeople"); return d.people||[]; }
  catch(e) { console.error("getPeople error:", e); return []; }
}

export async function savePerson(person) {
  try { await post({action:"savePerson", ...person}); }
  catch(e) { console.error("savePerson error:", e); }
}

export async function deletePerson(id) {
  try { await post({action:"deletePerson", id}); }
  catch(e) { console.error("deletePerson error:", e); }
}

export async function saveAllPeople(people) {
  try { await post({action:"savePeople", people}); }
  catch(e) { console.error("saveAllPeople error:", e); }
}

// ── SUBMISSIONS ───────────────────────────────────────────────────────────────
export async function getSubmissions(formId) {
  try {
    const d = await get("getSubmissions", formId ? `&formId=${formId}` : "");
    return (d.submissions||[]).map(s => ({
      reviewerEmail: s["Reviewer Email"],
      personName:    s["Person Reviewed"],
      formId:        s["Form ID"],
      formName:      s["Form Name"],
      values:        s["Scores (JSON)"] || {},
      updatedAt:     s["Submitted At"],
      id:            s["ID"],
    }));
  } catch(e) { console.error("getSubmissions error:", e); return []; }
}

export async function saveSubmission(data) {
  try { return await post({action:"submit", ...data}); }
  catch(e) { console.error("saveSubmission error:", e); }
}
