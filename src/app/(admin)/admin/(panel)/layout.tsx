import { Suspense } from "react";
import { requireStaff } from "@/lib/auth/staff";

async function StaffGate({ children }: { children: React.ReactNode }) {
  await requireStaff();
  return children;
}

// Every admin page except login sits behind the staff check. Reading the session needs the
// request cookies, so the gate renders inside Suspense.
export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense>
      <StaffGate>{children}</StaffGate>
    </Suspense>
  );
}
