import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import LoginModal from "./LoginModal";
import { AuthProvider } from "../../context/AuthContext";
import * as authService from "../../services/authService";
import { AUTH_STORAGE_KEY } from "../../utils/apiFetch";
import { makeUser } from "../../test/helpers";

const setup = (props: Partial<React.ComponentProps<typeof LoginModal>> = {}) => {
  const onClose = vi.fn();
  const onSuccess = vi.fn();
  const utils = render(
    <AuthProvider>
      <LoginModal isOpen onClose={onClose} onSuccess={onSuccess} {...props} />
    </AuthProvider>,
  );
  return { onClose, onSuccess, ...utils };
};

const ingresar = async (email = "ana@zentinel.test", password = "secreta") => {
  await userEvent.type(screen.getByLabelText("Email"), email);
  await userEvent.type(screen.getByLabelText("Contraseña"), password);
  await userEvent.click(screen.getByRole("button", { name: "Ingresar" }));
};

describe("LoginModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("no renderiza nada cerrado", () => {
    setup({ isOpen: false });
    expect(screen.queryByRole("button", { name: "Ingresar" })).not.toBeInTheDocument();
  });

  it("permite personalizar título y subtítulo", () => {
    setup({ title: "Acceso staff", subtitle: "Sólo personal autorizado" });
    expect(screen.getByRole("heading", { name: "Acceso staff" })).toBeInTheDocument();
    expect(screen.getByText("Sólo personal autorizado")).toBeInTheDocument();
  });

  it("inicia sesión, guarda el token y cierra el modal", async () => {
    vi.spyOn(authService, "loginRequest").mockResolvedValue({
      token: "tok",
      refreshToken: "ref",
      usuario: makeUser(),
    });
    const { onClose, onSuccess } = setup();

    await ingresar();

    expect(JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)!).token).toBe("tok");
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it("muestra el error de credenciales inválidas", async () => {
    vi.spyOn(authService, "loginRequest").mockRejectedValue(new Error("Credenciales inválidas"));
    const { onClose } = setup();

    await ingresar();

    expect(await screen.findByText("Credenciales inválidas")).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it("usa un mensaje genérico si el rechazo no es un Error", async () => {
    vi.spyOn(authService, "loginRequest").mockRejectedValue("boom");
    setup();

    await ingresar();

    expect(await screen.findByText("No se pudo iniciar sesión.")).toBeInTheDocument();
  });

  it("ofrece reenviar la verificación si el email no está verificado", async () => {
    vi.spyOn(authService, "loginRequest").mockRejectedValue(
      Object.assign(new Error("Verificá tu email"), { code: "EMAIL_NOT_VERIFIED" }),
    );
    const reenviar = vi
      .spyOn(authService, "reenviarVerificacionRequest")
      .mockResolvedValue(undefined as never);
    setup();

    await ingresar();

    await userEvent.click(await screen.findByRole("button", { name: /reenviar correo/i }));

    expect(reenviar).toHaveBeenCalledWith("ana@zentinel.test");
    expect(await screen.findByText(/correo reenviado/i)).toBeInTheDocument();
  });

  it("vuelve a habilitar el reenvío si falla", async () => {
    vi.spyOn(authService, "loginRequest").mockRejectedValue(
      Object.assign(new Error("Verificá tu email"), { code: "EMAIL_NOT_VERIFIED" }),
    );
    vi.spyOn(authService, "reenviarVerificacionRequest").mockRejectedValue(new Error("falló"));
    setup();

    await ingresar();
    await userEvent.click(await screen.findByRole("button", { name: /reenviar correo/i }));

    expect(
      await screen.findByRole("button", { name: /reenviar correo/i }),
    ).toBeEnabled();
  });

  it("envía las instrucciones de recuperación y muestra la confirmación", async () => {
    const olvide = vi
      .spyOn(authService, "olvideContrasenaRequest")
      .mockResolvedValue(undefined as never);
    setup();

    await userEvent.click(screen.getByRole("button", { name: /olvidaste tu contraseña/i }));
    await userEvent.type(screen.getByLabelText("Email"), "ana@zentinel.test");
    await userEvent.click(screen.getByRole("button", { name: /enviar instrucciones/i }));

    expect(olvide).toHaveBeenCalledWith("ana@zentinel.test");
    expect(await screen.findByText("Revisá tu bandeja")).toBeInTheDocument();
    expect(screen.getByText("ana@zentinel.test")).toBeInTheDocument();
  });

  it("muestra el error de recuperación y permite volver al login", async () => {
    vi.spyOn(authService, "olvideContrasenaRequest").mockRejectedValue(
      new Error("Email inexistente"),
    );
    setup();

    await userEvent.click(screen.getByRole("button", { name: /olvidaste tu contraseña/i }));
    await userEvent.type(screen.getByLabelText("Email"), "ana@zentinel.test");
    await userEvent.click(screen.getByRole("button", { name: /enviar instrucciones/i }));

    expect(await screen.findByText("Email inexistente")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /volver al login/i }));
    expect(screen.getByRole("button", { name: "Ingresar" })).toBeInTheDocument();
  });

  it("cierra con Escape, con el fondo y con Cancelar", async () => {
    const { onClose, container } = setup();

    await userEvent.keyboard("{Escape}");
    await userEvent.click(document.body.querySelector('[aria-hidden="true"]')!);
    await userEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onClose).toHaveBeenCalledTimes(3);
    expect(container).toBeEmptyDOMElement();
  });

  it("limpia el formulario al cerrarse", async () => {
    const { rerender } = setup();
    await userEvent.type(screen.getByLabelText("Email"), "ana@zentinel.test");

    rerender(
      <AuthProvider>
        <LoginModal isOpen={false} onClose={vi.fn()} />
      </AuthProvider>,
    );
    rerender(
      <AuthProvider>
        <LoginModal isOpen onClose={vi.fn()} />
      </AuthProvider>,
    );

    expect(screen.getByLabelText("Email")).toHaveValue("");
  });
});
