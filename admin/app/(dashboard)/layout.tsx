import Sidebar from '@/components/Sidebar';

/**
 * SCULPT'AURA Admin — dashboard shell.
 *
 * Wraps every authenticated section with the fixed sidebar and the left offset.
 * The auth routes live in a separate group and therefore render without it.
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Sidebar />
      <div className="lg:pl-64">{children}</div>
    </>
  );
}
