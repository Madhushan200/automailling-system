"use client";

import React from "react";
import { useParams } from "next/navigation";
import { QuotationWorkspace } from "@/components/quotations/QuotationWorkspace";

export default function QuotationDetailPage() {
  const params = useParams();
  const quoteId = (params.id as string) || "qt-001";

  return <QuotationWorkspace quotationId={quoteId} isNew={false} />;
}
