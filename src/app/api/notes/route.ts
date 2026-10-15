// src/app/api/notes/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { apiError, PRIVATE_HEADERS } from "@/lib/api";
import { ROLE_SUPER_ADMIN } from "@/lib/constants";
import { requirePermission } from "@/lib/permission";
import { listParamsSchema } from "@/lib/validations";
import { getNotes } from "@/modules/note/note.queries";

export async function GET(request: NextRequest) {
  try {
    const session = await requirePermission("note", "read"); // 401 / 403
    const params = listParamsSchema.parse(
      Object.fromEntries(request.nextUrl.searchParams)
    );

    const data = await getNotes(
      {
        userId: session.userId,
        canManageAll: session.roleName === ROLE_SUPER_ADMIN,
      },
      params
    );

    return NextResponse.json(
      { ...data, page: params.page, limit: params.limit },
      { headers: PRIVATE_HEADERS }
    );
  } catch (e) {
    return apiError(e);
  }
}
