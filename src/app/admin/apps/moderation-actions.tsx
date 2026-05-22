"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

export function ModerationActions({ appId, status }: { appId: string; status: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function approve() {
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("apps")
      .update({ status: "live", published_at: new Date().toISOString(), rejection_reason: null })
      .eq("id", appId);

    if (error) toast.error(error.message);
    else {
      toast.success("App publicada");
      // Trigger newsletter notification
      fetch("/api/notify/new-app", { method: "POST", body: JSON.stringify({ appId }) });
      router.refresh();
    }
    setLoading(false);
  }

  async function reject() {
    const reason = prompt("Razón del rechazo:");
    if (!reason) return;
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("apps")
      .update({ status: "rejected", rejection_reason: reason })
      .eq("id", appId);

    if (error) toast.error(error.message);
    else {
      toast.success("App rechazada");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="flex gap-2 shrink-0">
      <Button onClick={approve} disabled={loading} size="sm">Aprobar</Button>
      <Button onClick={reject} disabled={loading} size="sm" variant="destructive">Rechazar</Button>
    </div>
  );
}
