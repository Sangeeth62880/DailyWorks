import { redirect } from "next/navigation"

export default function JobsRedirectPage() {
  redirect("/jobs")
  return null
}

