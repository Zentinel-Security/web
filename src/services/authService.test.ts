import { describe, expect, it } from "vitest";
import {
  loginRequest,
  olvideContrasenaRequest,
  reenviarVerificacionRequest,
  resetearContrasenaRequest,
  verificarEmailRequest,
} from "./authService";
import { API_BASE_URL } from "../config/apiBaseUrl";
import { brokenJsonResponse, errorResponse, jsonResponse, makeUser, mockFetch } from "../test/helpers";

describe("loginRequest", () => {
  it("envía las credenciales con source web y normaliza access_token", async () => {
    const fetchMock = mockFetch(
      jsonResponse({ access_token: "abc", refresh_token: "ref", usuario: makeUser() }),
    );

    const result = await loginRequest({ email: "ana@zentinel.test", password: "secreta" });

    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "ana@zentinel.test",
        contraseña: "secreta",
        source: "web",
      }),
    });
    expect(result).toEqual({
      token: "abc",
      refreshToken: "ref",
      usuario: makeUser(),
    });
  });

  it("acepta la variante token del backend", async () => {
    mockFetch(jsonResponse({ token: "abc", usuario: makeUser() }));
    const result = await loginRequest({ email: "a@b.c", password: "x" });
    expect(result.token).toBe("abc");
    expect(result.refreshToken).toBeUndefined();
  });

  it("propaga el mensaje y el código de error del backend", async () => {
    mockFetch(errorResponse({ message: "Cuenta suspendida", code: "ACCOUNT_SUSPENDED" }, 403));

    await expect(loginRequest({ email: "a@b.c", password: "x" })).rejects.toMatchObject({
      message: "Cuenta suspendida",
      code: "ACCOUNT_SUSPENDED",
    });
  });

  it("usa el campo error cuando no hay message", async () => {
    mockFetch(errorResponse({ error: "Credenciales inválidas" }, 401));
    await expect(loginRequest({ email: "a@b.c", password: "x" })).rejects.toThrow(
      "Credenciales inválidas",
    );
  });

  it("usa un mensaje por defecto si el backend no devuelve JSON", async () => {
    mockFetch(brokenJsonResponse(500));
    await expect(loginRequest({ email: "a@b.c", password: "x" })).rejects.toThrow(
      "No se pudo iniciar sesión. Revisa tus credenciales.",
    );
  });

  it("rechaza una respuesta 200 sin token o sin usuario", async () => {
    mockFetch(jsonResponse({ usuario: makeUser() }));
    await expect(loginRequest({ email: "a@b.c", password: "x" })).rejects.toThrow(
      "Respuesta de login inválida.",
    );

    mockFetch(jsonResponse({ access_token: "abc" }));
    await expect(loginRequest({ email: "a@b.c", password: "x" })).rejects.toThrow(
      "Respuesta de login inválida.",
    );
  });
});

describe("verificarEmailRequest", () => {
  it("codifica el token en la query", async () => {
    const fetchMock = mockFetch(jsonResponse({}));
    await verificarEmailRequest("tok en/+");
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE_URL}/auth/verificar-email?token=tok%20en%2F%2B`,
    );
  });

  it("expone el código de error para que la UI distinga token vencido", async () => {
    mockFetch(errorResponse({ error: "Token vencido", code: "TOKEN_EXPIRED" }, 410));
    await expect(verificarEmailRequest("t")).rejects.toMatchObject({
      message: "Token vencido",
      code: "TOKEN_EXPIRED",
    });
  });

  it("cae al mensaje genérico si el backend no devuelve detalle", async () => {
    mockFetch(brokenJsonResponse(500));
    await expect(verificarEmailRequest("t")).rejects.toThrow("Error al verificar el email.");
  });
});

describe("reenviarVerificacionRequest", () => {
  it("postea el email", async () => {
    const fetchMock = mockFetch(jsonResponse({}));
    await reenviarVerificacionRequest("ana@zentinel.test");
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/auth/reenviar-verificacion`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "ana@zentinel.test" }),
    });
  });

  it("propaga el error del backend", async () => {
    mockFetch(errorResponse({ error: "Demasiados intentos" }, 429));
    await expect(reenviarVerificacionRequest("a@b.c")).rejects.toThrow("Demasiados intentos");
  });

  it("usa el mensaje por defecto sin JSON", async () => {
    mockFetch(brokenJsonResponse());
    await expect(reenviarVerificacionRequest("a@b.c")).rejects.toThrow(
      "Error al reenviar el correo.",
    );
  });
});

describe("olvideContrasenaRequest", () => {
  it("postea el email", async () => {
    const fetchMock = mockFetch(jsonResponse({}));
    await olvideContrasenaRequest("ana@zentinel.test");
    expect(fetchMock).toHaveBeenCalledWith(
      `${API_BASE_URL}/auth/olvide-contrasena`,
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("propaga el error del backend", async () => {
    mockFetch(errorResponse({ error: "Email inexistente" }, 404));
    await expect(olvideContrasenaRequest("a@b.c")).rejects.toThrow("Email inexistente");
  });

  it("usa el mensaje por defecto sin JSON", async () => {
    mockFetch(brokenJsonResponse());
    await expect(olvideContrasenaRequest("a@b.c")).rejects.toThrow("Error al enviar el correo.");
  });
});

describe("resetearContrasenaRequest", () => {
  it("envía token y contraseña nueva", async () => {
    const fetchMock = mockFetch(jsonResponse({}));
    await resetearContrasenaRequest("tok", "NuevaClave1");
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/auth/resetear-contrasena`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: "tok", nuevaContrasena: "NuevaClave1" }),
    });
  });

  it("propaga el código cuando la contraseña repite la anterior", async () => {
    mockFetch(
      errorResponse({ error: "No puede ser igual a la anterior", code: "SAME_PASSWORD" }, 400),
    );
    await expect(resetearContrasenaRequest("tok", "vieja")).rejects.toMatchObject({
      code: "SAME_PASSWORD",
    });
  });

  it("usa el mensaje por defecto sin JSON", async () => {
    mockFetch(brokenJsonResponse());
    await expect(resetearContrasenaRequest("tok", "x")).rejects.toThrow(
      "Error al restablecer la contraseña.",
    );
  });
});
