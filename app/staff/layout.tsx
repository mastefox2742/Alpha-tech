import Sidebar from '@/components/layout/Sidebar';
import { AuthGuard } from '@/components/layout/AuthGuard';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="staff">
      <div className="flex h-screen overflow-hidden">
        <Sidebar role="staff" />
        <main className="flex-1 overflow-y-auto bg-bg">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
