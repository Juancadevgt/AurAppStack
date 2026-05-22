"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NewsletterSignup() {
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (res.ok) {
      toast.success("¡Suscrito! Te avisaremos de nuevas apps y descuentos.");
      (e.target as HTMLFormElement).reset();
    } else {
      const data = await res.json();
      toast.error(data.error ?? "Error al suscribirse");
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
      <Input
        type="email"
        name="email"
        placeholder="tu@email.com"
        required
        className="flex-1"
      />
      <Button type="submit" disabled={loading}>
        {loading ? "..." : "Suscribirme"}
      </Button>
    </form>
  );
}
