import AdminLayout from '@/components/pages/admin/AdminLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
   return <AdminLayout>{children}</AdminLayout>;
}
