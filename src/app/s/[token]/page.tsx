import { redirect } from "next/navigation";

export default async function LegacySignPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  redirect(`/aprobacion/${token}`);
}
