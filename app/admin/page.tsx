import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdminConfigured, isPasswordRequired, verifySessionValue } from "@/lib/server/security";
import { isDatabaseConfigured } from "@/lib/server/supabase";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";
import "./admin.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Book of the Night · Marta's dashboard",
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminPage() {
  // With ADMIN_PASSWORD set, the dashboard is only rendered for a valid signed
  // session; without it, the dashboard is open to anyone with the link.
  const passwordRequired = isPasswordRequired();
  const authed = !passwordRequired || verifySessionValue((await cookies()).get(ADMIN_COOKIE)?.value);

  return (
    <div className="admin">
      {authed ? (
        <AdminDashboard databaseConfigured={isDatabaseConfigured()} canSignOut={passwordRequired} />
      ) : (
        <AdminLogin configured={isAdminConfigured()} />
      )}
    </div>
  );
}
