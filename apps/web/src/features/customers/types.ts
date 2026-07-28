export interface Customer {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  firstSeenAt: string;
  lastSeenAt: string;
}
