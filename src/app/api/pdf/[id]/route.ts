import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { sanitizeFileName } from "@/lib/utils";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const doc = await prisma.document.findFirst({ where: { id, organizationId: session.orgId } });
  if (!doc || !doc.pdfData) return NextResponse.json({ error: "Documento no encontrado" }, { status: 404 });

  const filename = sanitizeFileName(`${doc.number}_${doc.title}`) + ".pdf";

  return new NextResponse(doc.pdfData, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, max-age=60",
    },
  });
}
