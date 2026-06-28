import { redirect } from 'next/navigation';

export default function AdminHomepageRedirect() {
  redirect('/admin/settings');
}
