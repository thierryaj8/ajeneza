"use client";
import { notFound, useParams } from "next/navigation";
import { resourceByKey } from "@/components/admin/config";
import { ResourceList } from "@/components/admin/ResourceViews";

export default function Page() {
  const { resource } = useParams<{ resource: string }>();
  const config = resourceByKey(resource);
  if (!config) notFound();
  return <ResourceList key={config.key} config={config} />;
}
