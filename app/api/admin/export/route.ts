import { NextResponse, type NextRequest } from "next/server";

import { exportAdminData, isAdminUser } from "@/lib/repository";
import { getCurrentUser } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Autenticación requerida" }, { status: 401 });
  }

  const isAdmin = await isAdminUser(user.id);
  if (!isAdmin) {
    return NextResponse.json({ error: "Rol de fundador requerido" }, { status: 403 });
  }

  const format = request.nextUrl.searchParams.get("format") === "csv" ? "csv" : "json";
  const exported = await exportAdminData(format);

  return new NextResponse(exported.body, {
    headers: {
      "content-type": exported.contentType,
      "content-disposition": `attachment; filename="${exported.filename}"`,
      "cache-control": "no-store",
    },
  });
}
