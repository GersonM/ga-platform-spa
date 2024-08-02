export type TenantConfig = {
  dark_logo?: string;
  primary_color?: string;
  version?: string;
  white_logo?: string;
  config: {
    id: string;
    color?: string;
    name?: string;
    favicon?: string;
    favicon_white?: string;
    logo?: string;
  };
};

export type SettingsGroup = {
  key: string;
  label: string;
  settings: SettingValue[];
};

export type SettingValue = {
  key: string;
  value?: string;
  label?: string;
  hint?: string;
  type?: string;
};

export type Company = {
  uuid: number;
  name: string;
  legal_name: string;
  legal_uid: string;
};

export type Profile = {
  uuid: string;
  name: string;
  last_name: string;
  birthday?: string;
  email: string;
  doc_number?: string;
  doc_type?: string;
  gender?: string;
  phone?: string;
  address?: string;
  created_at?: string;
  login_method?: string;
  user?: User;
  avatar?: File;
};

export type SharedProfile = {
  uuid: string;
  level: string;
  profile: Profile;
};

export type Role = {
  id: number;
  name: string;
  permissions: Permission[];
};

export type Permission = {
  id: number;
  hint: string;
  name: string;
  guard_name: string;
};

export type User = {
  uuid: number;
  email: string;
  profile: Profile;
  roles?: Role[];
  name: string;
  disabled_at?: string;
  email_verified_at?: string;
  token: string;
};

export type SessionUser = {
  uuid: number;
  email: string;
  profile: Profile;
  roles?: string[];
  name: string;
  disabled_at?: string;
  email_verified_at?: string;
  token: string;
};

export type FileActivity = {
  uuid: number;
  user: User;
  comment: string;
  requested_at?: string;
  created_at: string;
  time?: number;
  verified_at?: string;
  action: string;
  file?: File;
};

export type File = {
  uuid: string;
  name: string;
  description: string;
  code: string;
  type: string;
  created_at: string;
  size: number;
  container?: Container;
  activity?: Array<FileActivity>;
  source: string;
  details: string;
  public: string;
  thumbnail?: string;
  download?: string;
  start_from?: number;
};

export type Container = {
  uuid: string;
  name: string;
  is_public: boolean;
  num_files?: number;
  num_containers?: number;
  description?: string;
  parent_container?: Container;
  created_at: string;
  updated_at: string;
};

export type ContainerContent = {
  container: Container;
  containers: Array<Container>;
  files: Array<File>;
};

export type FileManagementStatus = {
  usage: number;
  total: number;
  payment: number;
};

export type MailAccount = {
  uuid: string;
  contact_name: string;
  address: string;
  created_at: string;
  provider?: MailProvider;
  folders?: MailFolder[];
  is_disabled: boolean;
  setup_completed: boolean;
  space_assigned: number;
  space_used: number;
};

export type MailAccountStats = {
  folder: MailFolder;
  folder_path: string;
  messages_stats: any;
  old_date: number;
  total_messages: number;
};

export type MailFolder = {
  uuid: string;
  name: string;
  order: number;
  path: string;
  parent_uuid: string;
};

export type MailProvider = {
  uuid: string;
  name: string;
  username: string;
  host: string;
  type: string;
  num_accounts?: number;
};

export type MailFolderPageContent = {
  page: number;
  total: number;
  total_pages: number;
  messages: MailMessage[];
};

export type MailMessage = {
  message_id: string;
  subject: string;
  from: any[];
  to: any[];
  bcc?: any[];
  cc?: any[];
  is_read: boolean;
  number_attachments: number;
  excerpt: string;
  delivery_date: string;
  body?: string;
};

export type ResponsePagination = {
  current_page: number;
  from: number;
  last_page: number;
  per_page: number;
  to: number;
  total: number;
};

export type Plan = {
  created_at: string;
  description: string;
  name: string;
  price: number;
  sku: string;
  updated_at: string;
  uuid: string;
};

export type Subscription = {
  billing_currency: string;
  billing_period: string;
  email_verified_at: string;
  is_active: boolean;
  plan: Plan;
  started_at: string;
  terminated_at: string;
  uuid: string;
};

export type InvoicePayment = {
  amount: number;
  created_at: string;
  description?: string;
  fk_invoice_uuid: string;
  fk_payment_method_uuid: string;
  purchase_token: string;
  transaction_info: string;
  updated_at: string;
  uuid: string;
  voucher_code: string;
};

export type Invoice = {
  uuid: string;
  amount: number;
  concept: string;
  created_at: string;
  customer: Profile;
  customer_id: string;
  customer_type: string;
  expires_on: string;
  invoiceable: Subscription;
  invoiceable_id: string;
  invoiceable_type: string;
  issued_on: string;
  paid_at?: string;
  payments: InvoicePayment[];
  purchase_token?: string;
  updated_at: string;
};

export type MoveLocation = {
  uuid: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type MoveRoute = {
  uuid: string;
  name: string;
  locations?: MoveLocation[];
  created_at: string;
  updated_at: string;
};
export type MoveTrip = {
  uuid: string;
  route?: MoveRoute;
  vehicle?: MoveVehicle;
  arrival_time: string;
  departure_time: string;
  arrived_at: string;
  created_at: string;
  updated_at: string;
};
export type MoveDriver = {
  uuid: string;
  name: string;
  license_type: string;
  license_number: string;
  profile?: Profile;
  created_at: string;
  updated_at: string;
};
export type MoveVehicle = {
  uuid: string;
  model?: string;
  brand?: string;
  type?: string;
  registration_plate?: string;
  weight?: string;
  max_capacity?: string;
  fk_driver_uuid?: string;
  color?: string;
  created_at: string;
  updated_at: string;
};
