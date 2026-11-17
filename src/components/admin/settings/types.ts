import { StoreSettings, FaqItem } from "@/db/schema";

export type { StoreSettings, FaqItem };

export interface SettingsManagerProps {
  initialSettings: StoreSettings | null;
}
