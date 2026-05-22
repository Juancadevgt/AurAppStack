export const FULFILLMENT_STATUS = {
  received: { label: "Recibido", color: "bg-blue-100 text-blue-800 border-blue-300", emoji: "📥" },
  documents_requested: { label: "Esperando documentos", color: "bg-yellow-100 text-yellow-800 border-yellow-300", emoji: "📋" },
  documents_received: { label: "Documentos recibidos", color: "bg-purple-100 text-purple-800 border-purple-300", emoji: "📦" },
  in_progress: { label: "En proceso", color: "bg-indigo-100 text-indigo-800 border-indigo-300", emoji: "⚙️" },
  completed: { label: "Completado", color: "bg-green-100 text-green-800 border-green-300", emoji: "✅" },
  cancelled: { label: "Cancelado", color: "bg-gray-100 text-gray-800 border-gray-300", emoji: "❌" },
  on_hold: { label: "Pausado", color: "bg-orange-100 text-orange-800 border-orange-300", emoji: "⏸️" },
} as const;

export type FulfillmentStatus = keyof typeof FULFILLMENT_STATUS;

export const FULFILLMENT_FLOW: FulfillmentStatus[] = [
  "received",
  "documents_requested",
  "documents_received",
  "in_progress",
  "completed",
];
