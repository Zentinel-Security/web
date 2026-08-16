import { describe, expect, it } from "vitest";
import { fetchSelfUser, updateProfile } from "./profileService";
import { API_BASE_URL } from "../config/apiBaseUrl";
import { brokenJsonResponse, errorResponse, jsonResponse, makeUser, mockFetch } from "../test/helpers";

describe("updateProfile", () => {
  it("envía los datos como multipart e incluye el avatar cuando hay archivo", async () => {
    const fetchMock = mockFetch(jsonResponse({}));
    const avatarFile = new File(["x"], "avatar.png", { type: "image/png" });

    await updateProfile("tok", 7, { nombre: "Ana", apellido: "Pérez", avatarFile });

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${API_BASE_URL}/usuarios/7`);
    expect(init.method).toBe("PUT");
    expect(init.headers).toEqual({ Authorization: "Bearer tok" });
    const body = init.body as FormData;
    expect(body.get("datos_usuario")).toBe(JSON.stringify({ nombre: "Ana", apellido: "Pérez" }));
    expect(body.get("avatar")).toBe(avatarFile);
  });

  it("omite el avatar si no se seleccionó archivo", async () => {
    const fetchMock = mockFetch(jsonResponse({}));
    await updateProfile("tok", 7, { nombre: "Ana", apellido: "Pérez", avatarFile: null });
    const body = fetchMock.mock.calls[0][1].body as FormData;
    expect(body.get("avatar")).toBeNull();
  });

  it("lanza el error del backend", async () => {
    mockFetch(errorResponse({ error: "Avatar demasiado grande" }, 413));
    await expect(
      updateProfile("tok", 7, { nombre: "Ana", apellido: "Pérez" }),
    ).rejects.toThrow("Avatar demasiado grande");
  });

  it("usa el mensaje por defecto si no hay JSON", async () => {
    mockFetch(brokenJsonResponse());
    await expect(
      updateProfile("tok", 7, { nombre: "Ana", apellido: "Pérez" }),
    ).rejects.toThrow("No se pudo actualizar el perfil.");
  });
});

describe("fetchSelfUser", () => {
  it("consulta el usuario propio por id", async () => {
    const usuario = makeUser({ id: 9 });
    const fetchMock = mockFetch(jsonResponse(usuario));

    await expect(fetchSelfUser("tok", 9)).resolves.toEqual(usuario);
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/usuarios/getUsuario?id=9`, {
      headers: { Authorization: "Bearer tok" },
    });
  });

  it("lanza el error del backend", async () => {
    mockFetch(errorResponse({ error: "Usuario inexistente" }, 404));
    await expect(fetchSelfUser("tok", 9)).rejects.toThrow("Usuario inexistente");
  });

  it("usa el mensaje por defecto si no hay JSON", async () => {
    mockFetch(brokenJsonResponse());
    await expect(fetchSelfUser("tok", 9)).rejects.toThrow("No se pudo obtener el usuario.");
  });
});
