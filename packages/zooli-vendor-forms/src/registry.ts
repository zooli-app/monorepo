import type { FormDefinition, ServiceKey } from "./types";
import { food } from "./forms/food";
import { rides } from "./forms/rides";
import { home } from "./forms/home";
import { shifting } from "./forms/shifting";
import { parcel } from "./forms/parcel";
import { tuition } from "./forms/tuition";
import { hotel } from "./forms/hotel";
import { resort } from "./forms/resort";

export const FORMS: Record<ServiceKey, FormDefinition> = { food, rides, home, shifting, parcel, tuition, hotel, resort };

export const SERVICE_KEYS = Object.keys(FORMS) as ServiceKey[];

export function getForm(service: string): FormDefinition | null {
  return (FORMS as Record<string, FormDefinition>)[service] ?? null;
}
