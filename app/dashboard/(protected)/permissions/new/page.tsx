import PermissionForm from '@/components/admin/PermissionForm';

export default async function NewPermissionPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Yeni İcazə</h1>
      <PermissionForm />
    </div>
  );
}
