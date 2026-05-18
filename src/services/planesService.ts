import { API_BASE_URL } from "../config/apiBaseUrl";
import { apiFetch } from "../utils/apiFetch";

export interface PlanFeatureValue {
  codigo: string;
  nombre: string;
  tipo_limite: "numeric" | "boolean";
  valor: number | boolean | null;
  disponible: boolean;
}

export interface PlanFeatureDef {
  codigo: string;
  nombre: string;
  descripcion: string;
  tipo_limite: "numeric" | "boolean";
  icono: string;
  orden: number;
}

export interface Plan {
  id: number;
  name: string;
  description: string;
  price: number;
  price_cents: number;
  interval: string;
  limits: Record<string, number | boolean>;
  active: boolean;
  features?: PlanFeatureValue[];
  inicial?: boolean;
}

export interface UpdatePlanPayload {
  nombre: string;
  descripcion: string;
  precio: number;
  intervalo: string;
  limits: Record<string, number | boolean>;
}

export interface CreatePlanPayload extends UpdatePlanPayload {}

const authHeaders = (token: string) => ({
  Authorization: `Bearer ${token}`,
  "Content-Type": "application/json",
});

export const getPlanes = async (): Promise<Plan[]> => {
  const res = await apiFetch(`${API_BASE_URL}/planes`);
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message ?? "Error obteniendo planes");
  return (json?.data ?? []) as Plan[];
};

export const getPlanesAdmin = async (token: string): Promise<Plan[]> => {
  const res = await apiFetch(`${API_BASE_URL}/planes/admin/all`, {
    headers: authHeaders(token),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message ?? "Error obteniendo planes admin");
  return (json?.data ?? []) as Plan[];
};

export const getFeatures = async (token: string): Promise<PlanFeatureDef[]> => {
  const res = await apiFetch(`${API_BASE_URL}/planes/features`, {
    headers: authHeaders(token),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message ?? "Error obteniendo features");
  return (json?.data ?? []) as PlanFeatureDef[];
};

export const createPlan = async (
  token: string,
  payload: CreatePlanPayload,
): Promise<Plan> => {
  const res = await apiFetch(`${API_BASE_URL}/planes`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message ?? "Error creando plan");
  return json.data as Plan;
};

export const updatePlan = async (
  token: string,
  id: number,
  payload: UpdatePlanPayload,
): Promise<Plan> => {
  const res = await apiFetch(`${API_BASE_URL}/planes/${id}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message ?? "Error actualizando plan");
  return json.data as Plan;
};

export const deactivatePlan = async (
  token: string,
  id: number,
): Promise<void> => {
  const res = await apiFetch(`${API_BASE_URL}/planes/${id}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message ?? "Error desactivando plan");
};

export const activatePlan = async (
  token: string,
  id: number,
): Promise<void> => {
  const res = await apiFetch(`${API_BASE_URL}/planes/${id}/activate`, {
    method: "PATCH",
    headers: authHeaders(token),
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.message ?? "Error activando plan");
};
