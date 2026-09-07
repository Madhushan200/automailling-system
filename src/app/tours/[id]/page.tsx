"use client";

import React from "react";
import { useParams } from "next/navigation";
import { TourDataEntryWorkspace } from "@/components/tours/TourDataEntryWorkspace";

export default function TourDetailPage() {
  const params = useParams();
  const tourId = (params.id as string) || "tour-dl-001";

  return <TourDataEntryWorkspace tourId={tourId} isNew={false} />;
}
