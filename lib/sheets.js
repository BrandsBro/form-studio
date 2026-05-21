const URL = process.env.NEXT_PUBLIC_SHEETS_URL || "https://script.google.com/macros/s/AKfycbwGB78gVmrPU-7W92ybc4EWnjHYt3DM_kZWxW8r6p7gR4CreCFzrB3Dl6aeoPP6pMBUag/exec";

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
      reviewerEmail: (s["Reviewer Email"]||"").toLowerCase(),
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
  try { return await post({action:"saveSubmission", ...data}); }
  catch(e) { console.error("saveSubmission error:", e); }
}

export async function getMarkingConfig() {
  try {
    const d = await get("getMarkingConfig");
    return d.config || null;
  } catch(e) { return null; }
}

export async function saveMarkingConfig(config) {
  try { await post({action:"saveMarkingConfig", config}); } 
  catch(e) { console.error("saveMarkingConfig error:", e); }
}

export async function deleteForm(formId) {
  try { await post({action:"deleteForm", formId}); }
  catch(e) { console.error("deleteForm error:", e); }
}

export async function getReReview() {
  try {
    const d = await get("getReReview");
    return d.reviews || [];
  } catch(e) { return []; }
}

export async function saveReReview(data) {
  try { await post({action:"saveReReview",...data}); }
  catch(e) { console.error("saveReReview error:", e); }
}

export async function deleteReReview(data) {
  try { await post({action:"deleteReReview",...data}); }
  catch(e) { console.error("deleteReReview error:", e); }
}

export async function getFlagged() {
  try {
    const d = await get("getFlagged");
    return d.flagged || [];
  } catch(e) { return []; }
}

export async function saveFlagged(data) {
  try { await post({action:"saveFlagged",...data}); }
  catch(e) { console.error("saveFlagged error:", e); }
}

export async function deleteFlagged(data) {
  try { await post({action:"deleteFlagged",...data}); }
  catch(e) { console.error("deleteFlagged error:", e); }
}
