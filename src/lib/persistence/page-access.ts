import "server-only";
import { notFound, redirect } from "next/navigation";
import { requireOwner } from "@/lib/server/auth";
import { safeError } from "./http-policy";
export async function requireOwnerPage() {
  try {
    return await requireOwner();
  } catch (error) {
    const { body } = safeError(error);
    if (body.error.code === "not_configured") redirect("/setup");
    if (
      body.error.code === "unauthenticated" ||
      body.error.code === "forbidden"
    )
      redirect("/login");
    throw new Error("The campaign store could not be reached. Please retry.");
  }
}
export function campaignPageError(error: unknown): never {
  if (
    safeError(error).body.error.code === "not_found" ||
    safeError(error).body.error.code === "validation"
  )
    notFound();
  if (
    safeError(error).body.error.code === "unauthenticated" ||
    safeError(error).body.error.code === "forbidden"
  )
    redirect("/login");
  throw new Error("The campaign store could not be reached. Please retry.");
}
