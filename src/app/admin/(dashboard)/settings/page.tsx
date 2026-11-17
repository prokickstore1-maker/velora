import { getOrCreateStoreSettings } from "@/db";
import { MOCK_STORE_SETTINGS } from "@/db/mock-data";
import { SettingsManager } from "@/components/admin/settings-manager";

export const metadata = {
  title: "Store Settings & Guardrails | Admin Dashboard",
};

export default async function AdminSettingsPage() {
  let settings = null;

  try {
    settings = await getOrCreateStoreSettings();
  } catch {
    settings = MOCK_STORE_SETTINGS as unknown as typeof settings;
  }

  return <SettingsManager initialSettings={settings} />;
}
