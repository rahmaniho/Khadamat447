import { Alert } from "@/components/ui";

export function Flash({ msg, err }: { msg?: string; err?: string }) {
  if (err) return <Alert tone="error">{err}</Alert>;
  if (msg) return <Alert tone="success">{msg}</Alert>;
  return null;
}
