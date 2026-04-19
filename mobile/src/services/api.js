/**
 * Prediction API client (thin wrapper around fetch).
 */
export async function predict(baseUrl, payload, { signal } = {}) {
  const url = `${baseUrl.replace(/\/+$/, "")}/api/v1/predict`;
  let resp;
  try {
    resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal,
    });
  } catch (e) {
    throw new Error(`network: ${e.message}`);
  }
  const text = await resp.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`HTTP ${resp.status}: ${text.slice(0, 120)}`);
  }
  if (!resp.ok) {
    const detail = json?.detail ?? `HTTP ${resp.status}`;
    throw new Error(typeof detail === "string" ? detail : JSON.stringify(detail));
  }
  return json;
}

export async function health(baseUrl, { signal } = {}) {
  const url = `${baseUrl.replace(/\/+$/, "")}/api/v1/health`;
  const resp = await fetch(url, { signal });
  return resp.json();
}

/**
 * Ask the LLM to explain/justify a prediction.
 * On upstream errors the thrown Error has a `.code` property so the UI can
 * render a specific message: network | auth_error | rate_limited | timeout |
 * not_configured | upstream | empty_reply | http_XXX.
 */
export async function explain(baseUrl, body, { signal, timeoutMs = 25000 } = {}) {
  const url = `${baseUrl.replace(/\/+$/, "")}/api/v1/explain`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const composedSignal = signal
    ? mergeSignals([signal, controller.signal])
    : controller.signal;

  let resp;
  try {
    resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: composedSignal,
    });
  } catch (e) {
    const err = new Error(e.name === "AbortError" ? "timeout" : "network");
    err.code = err.message;
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }

  const text = await resp.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    const err = new Error(`HTTP ${resp.status}`);
    err.code = `http_${resp.status}`;
    throw err;
  }
  if (!resp.ok) {
    const detail = json?.detail;
    const code =
      typeof detail === "object" && detail?.code ? detail.code : `http_${resp.status}`;
    const message =
      typeof detail === "object" && detail?.message
        ? detail.message
        : typeof detail === "string"
        ? detail
        : `HTTP ${resp.status}`;
    const err = new Error(message);
    err.code = code;
    throw err;
  }
  return json;
}

function mergeSignals(signals) {
  const controller = new AbortController();
  for (const s of signals) {
    if (s.aborted) {
      controller.abort();
      break;
    }
    s.addEventListener("abort", () => controller.abort(), { once: true });
  }
  return controller.signal;
}
