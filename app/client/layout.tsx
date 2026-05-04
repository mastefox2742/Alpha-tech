import Sidebar from '@/components/layout/Sidebar';
import { AuthGuard } from '@/components/layout/AuthGuard';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="team">
      <div className="flex h-screen overflow-hidden">
        <Sidebar role="client" />
        <main className="flex-1 overflow-y-auto bg-bg">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
