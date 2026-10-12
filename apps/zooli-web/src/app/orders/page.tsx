import { redirect } from 'next/navigation';
// Orders are accessible via the Account page's Orders tab.
export default function OrdersPage() { redirect('/account'); }
