import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const loadModule = async () => {
  vi.resetModules();
  return import("./apiBaseUrl");
};

describe("API_BASE_URL", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("usa VITE_BACKEND_URL cuando está definida", async () => {
    vi.stubEnv("VITE_BACKEND_URL", "https://api.zentinel.test");
    const { API_BASE_URL } = await loadModule();
    expect(API_BASE_URL).toBe("https://api.zentinel.test");
  });

  it("cae a VITE_API_URL si no hay VITE_BACKEND_URL", async () => {
    vi.stubEnv("VITE_BACKEND_URL", undefined);
    vi.stubEnv("VITE_API_URL", "https://alternativa.zentinel.test");
    const { API_BASE_URL } = await loadModule();
    expect(API_BASE_URL).toBe("https://alternativa.zentinel.test");
  });

  it("elimina las barras finales", async () => {
    vi.stubEnv("VITE_BACKEND_URL", "https://api.zentinel.test///");
    const { API_BASE_URL } = await loadModule();
    expect(API_BASE_URL).toBe("https://api.zentinel.test");
  });

  it("falla al importar si no hay ninguna URL configurada", async () => {
    vi.stubEnv("VITE_BACKEND_URL", undefined);
    vi.stubEnv("VITE_API_URL", undefined);
    await expect(loadModule()).rejects.toThrow(/VITE_BACKEND_URL/);
  });
});
