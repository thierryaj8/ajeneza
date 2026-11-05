"use client";
import { notFound, useParams } from "next/navigation";
import { resourceByKey } from "@/components/admin/config";
import { ResourceEditor } from "@/components/admin/ResourceViews";

export default function Page() {
  const { resource, id } = useParams<{ resource: string; id: string }>();
  const config = resourceByKey(resource);
  if (!config) notFound();
  return <ResourceEditor key={id} config={config} id={id === "new" ? undefined : id} />;
}
