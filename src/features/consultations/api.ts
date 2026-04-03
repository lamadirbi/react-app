import { apiFetch, type ApiResult } from "@/lib/api";
import type { ConsultationDetail, ConsultationListItem, Paginated } from "./types";

export async function getMyConsultations(): Promise<ApiResult<Paginated<ConsultationListItem>>> {
  return apiFetch<Paginated<ConsultationListItem>>("/consultations");
}

export async function getConsultationDetail(
  id: number,
): Promise<ApiResult<{ consultation: ConsultationDetail }>> {
  return apiFetch<{ consultation: ConsultationDetail }>(`/consultations/${id}`);
}

