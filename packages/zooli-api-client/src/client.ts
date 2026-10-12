// Framework-agnostic API client — used identically by zooli-web,
// zooli-vendor, zooli-admin (Next.js) and the future Expo app. Each
// platform owns its own Supabase client / session storage (localStorage on
// web, AsyncStorage on native) and just hands this a `getAccessToken`
// function; this file never touches platform-specific storage itself.

export interface ApiClientConfig {
  baseUrl: string; // e.g. process.env.NEXT_PUBLIC_API_URL
  getAccessToken: () => Promise<string | null>;
}

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, message: string, body: unknown) {
    super(message);
    this.status = status;
    this.body = body;
  }
}

async function request<T>(
  config: ApiClientConfig,
  path: string,
  init: RequestInit = {}
): Promise<T> {
  const token = await config.getAccessToken();
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);

  if (!config.baseUrl) {
    throw new ApiError(0, "NEXT_PUBLIC_API_URL is not set for this app. Add it in the project's environment variables (the deployed API URL) and redeploy.", null);
  }
  const res = await fetch(`${config.baseUrl}${path}`, { ...init, headers });
  const text = await res.text();
  let body: any = null; // eslint-disable-line @typescript-eslint/no-explicit-any
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    throw new ApiError(
      res.status,
      `The server at ${config.baseUrl} answered with a web page instead of data (HTTP ${res.status}). ` +
        "Check that NEXT_PUBLIC_API_URL is the deployed API project's URL, that the API deployed successfully, and open <API URL>/api/vendor-applications/config in a browser — it should show JSON.",
      null,
    );
  }

  if (!res.ok) {
    throw new ApiError(res.status, (body && body.error) || res.statusText, body);
  }
  return body as T;
}

export type ApplicationStatus = "pending" | "under_review" | "needs_info" | "approved" | "rejected";

export interface VendorApplicationSummary {
  id: string; reference: string; service: string; status: ApplicationStatus;
  applicant_name: string; business_name: string | null; mobile: string; email: string | null;
  city: string | null; district: string | null; created_at: string; reviewed_at: string | null;
}

export interface VendorApplication extends VendorApplicationSummary {
  /** Sensitive numbers arrive masked; `_revealable` lists the ones an admin may reveal; files carry a 15-minute `signedUrl`. */
  data: Record<string, unknown>;
  admin_notes: string | null;
  reviewed_by: string | null;
  vendor_user_id: string | null;
  store_id: string | null;
  last_message: string | null;
}

export interface ApplyConfig {
  captcha: "mock" | "live";
  turnstileSiteKey: string | null;
  otpRequired: boolean;
  otpMode: "mock" | "live";
}

export interface ReviewInput {
  status?: ApplicationStatus;
  admin_notes?: string;
  /** Text included in the needs-info / rejected message to the applicant. */
  message?: string;
  /** Default true. */
  notify?: boolean;
  /** Approval only: the email the vendor logs in with (defaults to the application email). */
  login_email?: string;
}

export type DeliveryState = "sent" | "mock" | "skipped" | "failed";

export interface ReviewResult {
  application: VendorApplication;
  delivery: { sms: DeliveryState; email: DeliveryState };
  /** Present only when it may not have reached the vendor (mock mode / delivery failed). */
  credentials?: { email: string; tempPassword: string; portalUrl: string };
}

export function createApiClient(config: ApiClientConfig) {
  const get = <T>(path: string) => request<T>(config, path);
  const post = <T>(path: string, body?: unknown) =>
    request<T>(config, path, { method: "POST", body: body ? JSON.stringify(body) : undefined });
  const del = <T>(path: string) => request<T>(config, path, { method: "DELETE" });

  return {
    // ---- categories & stores (groceries + food share these) ----
    categories: {
      list: () => get<{ categories: Category[] }>("/api/categories"),
    },
    stores: {
      list: (category = "grocery") => get<{ stores: Store[] }>(`/api/stores?category=${encodeURIComponent(category)}`),
      products: (storeId: string) => get<{ products: Product[] }>(`/api/stores/${storeId}/products`),
      addProduct: (storeId: string, product: NewProduct) =>
        post<{ product: Product }>(`/api/stores/${storeId}/products`, product),
    },

    // ---- cart ----
    cart: {
      get: (storeId: string) => get<{ cart: Cart | null }>(`/api/cart?storeId=${storeId}`),
      addItem: (storeId: string, productId: string, qty: number) =>
        post<{ item: CartItem }>("/api/cart", { storeId, productId, qty }),
      removeItem: (itemId: string) => del<{ ok: true }>(`/api/cart/item?itemId=${itemId}`),
    },

    // ---- addresses ----
    addresses: {
      list: () => get<{ addresses: Address[] }>("/api/addresses"),
      create: (input: NewAddress) => post<{ address: Address }>("/api/addresses", input),
    },

    // ---- orders (groceries + food share these) ----
    orders: {
      list: () => get<{ orders: Order[] }>("/api/orders"),
      checkout: (storeId: string, addressId: string) =>
        post<{ order: Order }>("/api/orders", { storeId, addressId }),
      updateStatus: (orderId: string, status: OrderStatus) =>
        post<{ order: Order }>(`/api/orders/${orderId}/status`, { status }),
      claimForDelivery: (orderId: string) => post<{ order: Order }>(`/api/orders/${orderId}/claim`),
    },

    // ---- rides ----
    rides: {
      list: () => get<{ rides: Ride[] }>("/api/rides"),
      get: (rideId: string) => get<{ ride: Ride; driverLocation: LatLng | null }>(`/api/rides/${rideId}`),
      request: (input: RideRequestInput) => post<{ ride: Ride; nearbyDrivers: number }>("/api/rides", input),
      accept: (rideId: string) => post<{ ride: Ride }>(`/api/rides/${rideId}/accept`),
      updateStatus: (rideId: string, status: RideStatus) =>
        post<{ ride: Ride }>(`/api/rides/${rideId}/status`, { status }),
    },

    // ---- drivers ----
    drivers: {
      setStatus: (online: boolean, location?: LatLng) =>
        post<{ ok: true; online: boolean }>("/api/drivers/status", { online, ...location }),
      availableDeliveries: () => get<{ deliveries: AvailableDelivery[] }>("/api/deliveries/available"),
    },

    // ---- vendor registration (public — applicants have no login yet) ----
    applications: {
      config: () => get<ApplyConfig>("/api/vendor-applications/config"),
      startSession: (captchaToken: string) =>
        post<{ token: string; expiresIn: number }>("/api/vendor-applications/session", { captchaToken }),
      sendOtp: (mobile: string, session: string) =>
        request<{ sent: boolean; devHint?: string }>(config, "/api/vendor-applications/otp/send", {
          method: "POST", body: JSON.stringify({ mobile }), headers: { "x-apply-session": session },
        }),
      verifyOtp: (mobile: string, code: string, session: string) =>
        request<{ otpToken: string }>(config, "/api/vendor-applications/otp/verify", {
          method: "POST", body: JSON.stringify({ mobile, code }), headers: { "x-apply-session": session },
        }),
      signUpload: (session: string) =>
        request<UploadSignature>(config, "/api/vendor-applications/upload", {
          method: "POST", body: "{}", headers: { "x-apply-session": session },
        }),
      submit: (service: string, values: Record<string, unknown>, session: string, otpToken?: string) =>
        request<{ reference: string }>(config, "/api/vendor-applications", {
          method: "POST", body: JSON.stringify({ service, values }),
          headers: { "x-apply-session": session, ...(otpToken ? { "x-otp-token": otpToken } : {}) },
        }),
    },

    // ---- uploads ----
    upload: {
      sign: (folder?: string) => post<UploadSignature>("/api/upload", { folder }),
    },

    // ---- admin (admin role only) ----
    admin: {
      stats: () => get<AdminStats>("/api/admin/stats"),
      stores: () => get<{ stores: AdminStore[] }>("/api/admin/stores"),
      orders: () => get<{ orders: AdminOrder[] }>("/api/admin/orders"),
      users: () => get<{ users: AdminUser[] }>("/api/admin/users"),
      setStoreOpen: (storeId: string, isOpen: boolean) =>
        request<{ store: AdminStore }>(config, `/api/admin/stores/${storeId}`, {
          method: "PATCH",
          body: JSON.stringify({ is_open: isOpen }),
        }),
      updateStore: (storeId: string, input: { commission_rate?: number; gstin?: string; zone?: string; is_open?: boolean }) =>
        request<{ store: AdminStore }>(config, `/api/admin/stores/${storeId}`, {
          method: "PATCH",
          body: JSON.stringify(input),
        }),
      wallets: () => get<{ wallets: AdminWallet[]; totalBalance: number; totalCashback: number }>("/api/admin/wallets"),
      analytics: (days = 30) => get<AdminAnalytics>(`/api/admin/analytics?days=${days}`),
      rides: () => get<{ rides: AdminRide[] }>("/api/admin/rides"),
      drivers: () => get<{ drivers: AdminDriver[] }>("/api/admin/drivers"),
      transactions: () => get<{ transactions: AdminTransaction[] }>("/api/admin/transactions"),
      applications: (filters: { status?: string; service?: string; q?: string } = {}) => {
        const qs = new URLSearchParams(Object.entries(filters).filter(([, v]) => !!v) as [string, string][]).toString();
        return get<{ applications: VendorApplicationSummary[] }>(`/api/admin/applications${qs ? `?${qs}` : ""}`);
      },
      application: (id: string) => get<{ application: VendorApplication }>(`/api/admin/applications/${id}`),
      reviewApplication: (id: string, input: ReviewInput) =>
        request<ReviewResult>(config, `/api/admin/applications/${id}`, {
          method: "PATCH",
          body: JSON.stringify(input),
        }),
      revealApplicationField: (id: string, field: string) =>
        post<{ value: string }>(`/api/admin/applications/${id}/reveal`, { field }),
    },

    // ---- reviews ----
    reviews: {
      forStore: (storeId: string) => get<{ reviews: Review[] }>(`/api/stores/${storeId}/reviews`),
      create: (orderId: string, rating: number, comment?: string) =>
        post<{ review: Review }>(`/api/orders/${orderId}/review`, { rating, comment }),
    },

    // ---- wallet ----
    wallet: {
      get: () => get<{ balance: number; cashbackTotal: number }>("/api/wallet"),
    },

    // ---- vendor (vendor role only) ----
    vendor: {
      getStore: () => get<{ store: Store | null }>("/api/vendor/store"),
      createStore: (input: NewStore) => post<{ store: Store }>("/api/vendor/store", input),
      updateStore: (input: Partial<NewStore> & { is_open?: boolean }) =>
        request<{ store: Store }>(config, "/api/vendor/store", { method: "PATCH", body: JSON.stringify(input) }),
      products: () => get<{ products: Product[] }>("/api/vendor/products"),
      orders: () => get<{ orders: VendorOrder[] }>("/api/vendor/orders"),
      reviews: () => get<{ reviews: Review[] }>("/api/vendor/reviews"),
      updateProduct: (productId: string, input: Partial<NewProduct> & { is_available?: boolean }) =>
        request<{ product: Product }>(config, `/api/vendor/products/${productId}`, {
          method: "PATCH",
          body: JSON.stringify(input),
        }),
      deleteProduct: (productId: string) =>
        request<{ ok: true }>(config, `/api/vendor/products/${productId}`, { method: "DELETE" }),
    },
  };
}

export type ZooliApiClient = ReturnType<typeof createApiClient>;

// ---------------------------------------------------------------------
// Shared types — mirror the shapes returned by apps/api's route handlers.
// ---------------------------------------------------------------------
export interface LatLng { lat: number; lng: number }
export interface Category { id: string; name: string; slug: string; parent_id: string | null; sort_order: number }
export interface Store {
  id: string; name: string; category: string; address: string | null;
  lat: number | null; lng: number | null; is_open: boolean; logo_url: string | null;
  gstin?: string | null; zone?: string | null; commission_rate?: number; rating_avg?: number; rating_count?: number;
}
export interface AdminStore extends Store { owner_id: string; created_at: string }
export interface Product {
  id: string; store_id?: string; category_id: string | null; name: string; description: string | null;
  unit: string; price: number; mrp: number | null; stock_qty: number; image_url: string | null; is_available: boolean;
}
export interface NewProduct {
  name: string; description?: string; unit?: string; price: number; mrp?: number;
  stock_qty?: number; image_url?: string; category_id?: string;
}
export interface NewStore {
  name: string; category?: string; address?: string; lat?: number; lng?: number; logo_url?: string;
  gstin?: string; zone?: string;
}
export interface Review {
  id: string; rating: number; comment: string | null; created_at: string;
  profiles: { full_name: string | null } | null;
}
export interface Address {
  id: string; user_id: string; label: string; line1: string; line2: string | null;
  city: string; state: string | null; pincode: string; lat: number | null; lng: number | null; is_default: boolean;
}
export interface NewAddress {
  label?: string; line1: string; line2?: string; city: string; state?: string;
  pincode: string; lat?: number; lng?: number; is_default?: boolean;
}
export interface CartItem { id: string; cart_id: string; product_id: string; qty: number }
export interface Cart { id: string; cart_items: Array<CartItem & { products: Pick<Product, "name" | "price" | "unit" | "image_url"> }> }
export type OrderStatus = "confirmed" | "preparing" | "ready_for_pickup" | "delivered" | "cancelled";
export interface Order {
  id: string; user_id: string; store_id: string; address_id: string; driver_id: string | null;
  status: string; payment_status: string; subtotal: number; delivery_fee: number; total: number;
  created_at: string; order_items?: Array<{ name: string; unit_price: number; qty: number }>;
  stores?: { name: string; category: string } | null;
}
export interface VendorOrder extends Order {
  profiles: { full_name: string | null; phone: string | null } | null;
  addresses: { line1: string; line2: string | null; city: string; pincode: string } | null;
}
export interface AdminOrder extends Order {
  stores: { name: string; category: string } | null;
  profiles: { full_name: string | null; phone: string | null } | null;
}
export interface AvailableDelivery {
  id: string; store_id: string; total: number; created_at: string; ready_at: string;
  stores: { name: string; address: string; lat: number; lng: number }; distanceKm: number;
}
export type RideStatus = "arrived" | "in_progress" | "completed" | "cancelled";
export interface RideRequestInput {
  vehicleType: "bike" | "auto" | "sedan" | "suv";
  pickup: { address: string; lat: number; lng: number };
  drop: { address: string; lat: number; lng: number };
}
export interface Ride {
  id: string; customer_id: string; driver_id: string | null; vehicle_type: string; status: string;
  pickup_address: string; pickup_lat: number; pickup_lng: number;
  drop_address: string; drop_lat: number; drop_lng: number;
  distance_km: number | null; fare_estimate: number; fare_final: number | null; requested_at: string;
}
export interface UploadSignature { timestamp: number; folder: string; signature: string; apiKey?: string; cloudName?: string; params?: Record<string, string | number> }
export interface AdminAnalytics {
  days: number;
  totals: { orders: number; revenue: number; avgOrderValue: number; newUsers: number };
  daily: { date: string; orders: number; revenue: number; rides: number }[];
  orderStatus: Record<string, number>;
  payments: { paid: number; unpaid: number; refunded: number; failed: number };
  rides: { total: number; byStatus: Record<string, number>; revenue: number };
  topStores: { id: string; name: string; orders: number; revenue: number }[];
  userGrowth: { month: string; count: number }[];
}
export interface AdminRide extends Ride {
  customer: { full_name: string | null; phone: string | null } | null;
  drivers: { vehicle_number: string; vehicle_type: string; profiles: { full_name: string | null; phone: string | null } | null } | null;
}
export interface AdminDriver {
  id: string; vehicle_type: string; vehicle_number: string; is_online: boolean; rating_avg: number; rating_count: number; created_at: string;
  profiles: { full_name: string | null; phone: string | null } | null;
}
export interface AdminTransaction {
  id: string; amount: number; reason: string; created_at: string;
  profiles: { full_name: string | null; phone: string | null } | null;
}
export interface AdminStats { stores: number; orders: number; users: number; revenue: number }
export interface AdminUser { id: string; role: string; full_name: string | null; phone: string | null; created_at: string }
export interface AdminWallet {
  user_id: string; balance: number; cashback_total: number; updated_at: string;
  profiles: { full_name: string | null; phone: string | null } | null;
}
