import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  apiFetch,
  AUTH_STORAGE_KEY,
  TOKEN_REFRESHED_EVENT,
  UNAUTHORIZED_EVENT,
} from "./apiFetch";
import { errorResponse, jsonResponse } from "../test/helpers";

const unauthorized = () => errorResponse({ error: "expirado" }, 401);

describe("apiFetch", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("devuelve la respuesta tal cual cuando no hay 401", async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    const res = await apiFetch("/recurso", { method: "GET" });

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledWith("/recurso", { method: "GET" });
  });

  it("no cierra sesión ante un 403 (permisos insuficientes)", async () => {
    const fetchMock = vi.fn().mockResolvedValue(errorResponse({}, 403));
    vi.stubGlobal("fetch", fetchMock);
    const onUnauthorized = vi.fn();
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);

    const res = await apiFetch("/admin");

    expect(res.status).toBe(403);
    expect(onUnauthorized).not.toHaveBeenCalled();
    window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  });

  it("renueva el token ante un 401 y reintenta el pedido original", async () => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ token: "viejo", refreshToken: "refresh-1", user: { id: 1 } }),
    );
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(unauthorized())
      .mockResolvedValueOnce(jsonResponse({ access_token: "nuevo" }))
      .mockResolvedValueOnce(jsonResponse({ dato: 1 }));
    vi.stubGlobal("fetch", fetchMock);

    const onRefreshed = vi.fn();
    window.addEventListener(TOKEN_REFRESHED_EVENT, onRefreshed);

    const res = await apiFetch("/protegido", { headers: { "X-Test": "1" } });

    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(3);
    // el reintento viaja con el token nuevo y conserva los headers originales
    expect(fetchMock).toHaveBeenLastCalledWith("/protegido", {
      headers: { "X-Test": "1", Authorization: "Bearer nuevo" },
    });
    // el token nuevo queda persistido sin pisar el resto del estado
    expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)!)).toEqual({
      token: "nuevo",
      refreshToken: "refresh-1",
      user: { id: 1 },
    });
    expect(onRefreshed).toHaveBeenCalledTimes(1);
    window.removeEventListener(TOKEN_REFRESHED_EVENT, onRefreshed);
  });

  it("emite el evento de cierre de sesión si no hay refresh token guardado", async () => {
    const fetchMock = vi.fn().mockResolvedValue(unauthorized());
    vi.stubGlobal("fetch", fetchMock);
    const onUnauthorized = vi.fn();
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);

    await apiFetch("/protegido");

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  });

  it("cierra sesión si el endpoint de refresh responde con error", async () => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ token: "viejo", refreshToken: "refresh-1" }),
    );
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(unauthorized())
      .mockResolvedValueOnce(errorResponse({}, 401));
    vi.stubGlobal("fetch", fetchMock);
    const onUnauthorized = vi.fn();
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);

    await apiFetch("/protegido");

    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  });

  it("cierra sesión si el refresh falla por red", async () => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ token: "viejo", refreshToken: "refresh-1" }),
    );
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(unauthorized())
      .mockRejectedValueOnce(new Error("network"));
    vi.stubGlobal("fetch", fetchMock);
    const onUnauthorized = vi.fn();
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);

    await apiFetch("/protegido");

    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  });

  it("cierra sesión si el refresh responde sin access_token", async () => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ token: "viejo", refreshToken: "refresh-1" }),
    );
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(unauthorized())
      .mockResolvedValueOnce(jsonResponse({}));
    vi.stubGlobal("fetch", fetchMock);
    const onUnauthorized = vi.fn();
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);

    await apiFetch("/protegido");

    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  });

  it("tolera un localStorage con JSON corrupto", async () => {
    localStorage.setItem(AUTH_STORAGE_KEY, "{no-es-json");
    const fetchMock = vi.fn().mockResolvedValue(unauthorized());
    vi.stubGlobal("fetch", fetchMock);
    const onUnauthorized = vi.fn();
    window.addEventListener(UNAUTHORIZED_EVENT, onUnauthorized);

    await expect(apiFetch("/protegido")).resolves.toBeDefined();

    expect(onUnauthorized).toHaveBeenCalledTimes(1);
    window.removeEventListener(UNAUTHORIZED_EVENT, onUnauthorized);
  });

  it("no persiste el token nuevo si la sesión fue borrada durante el refresh", async () => {
    localStorage.setItem(
      AUTH_STORAGE_KEY,
      JSON.stringify({ token: "viejo", refreshToken: "refresh-1" }),
    );
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(unauthorized())
      .mockImplementationOnce(async () => {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return jsonResponse({ access_token: "nuevo" });
      })
      .mockResolvedValueOnce(jsonResponse({ dato: 1 }));
    vi.stubGlobal("fetch", fetchMock);

    await apiFetch("/protegido");

    expect(localStorage.getItem(AUTH_STORAGE_KEY)).toBeNull();
  });
});
