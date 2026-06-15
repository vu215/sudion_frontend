import { notFound } from "next/navigation";
import { SettingsAdminPageContent } from "../_components/settings-admin-page";
import { getSettingsSection, settingsSections } from "../settings-sections";

export function generateStaticParams() {
  return settingsSections.filter((item) => item.slug !== "system").map((item) => ({ section: item.slug }));
}

export default async function SettingsSectionPage({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  const exists = settingsSections.some((item) => item.slug === section && item.slug !== "system");

  if (!exists) {
    notFound();
  }

  return <SettingsAdminPageContent active={getSettingsSection(section)} />;
}
