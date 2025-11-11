export type TenantConfig = {
  id?: string;
  dark_logo?: string;
  white_logo?: string;
  primary_color?: string;
  is_cluster_owner?: boolean;
  version?: string;
  modules: string[];
  favicon?: string;
  favicon_white?: string;
  config: {
    id: string;
    name?: string;
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
  values?: string[];
  label?: string;
  hint?: string;
  type?: string;
};

export type Company = {
  uuid: string;
  name: string;
  email: string;
  phone: string;
  logo?: ApiFile;
  legal_name: string;
  legal_address: string;
  legal_uid: string;
};

export type Profile = {
  uuid: string;
  name: string;
  last_name: string;
  birthday?: string;
  personal_email?: string;
  email?: string;
  doc_number?: string;
  doc_type?: string;
  gender?: string;
  phone?: string;
  address?: string;
  employees?: Employee[];
  contracts?: Contract[];
  client?: Client;
  commercial_client?: Client;
  created_at?: string;
  login_method?: string;
  user?: User;
  active_subscriptions?: Subscription[];
  memberships?: SubscriptionMember[];
  avatar?: ApiFile;
};

export type Client = {
  uuid: string;
  type: string;
  entity?: Profile | Company | any;
  contracts?: Contract[];
};
export type Provider = {
  uuid: string;
  category: string;
  currency: string;
  score: string;
  service_description: string;
  company?: Company;
};
export type Lead = {
  uuid: string;
  score: number;
  observations?: string;
  profile: Profile;
  referer?: Profile;
  campaign?: Campaign;
  created_at: string;
};
export type Campaign = {
  uuid: string;
  name: string;
  description?: string;
};
export type Contract = {
  uuid: string;
  status: string;
  amount: number;
  currency?: string;
  client?: Client;
  amount_string?: string;
  approved_at?: string;
  next_invoice_at?: string;
  budget_details?: string;
  created_at: string;
  locked_at: string;
  created_by?: Profile;
  date_end?: string;
  date_start: string;
  dead_line?: string;
  include_taxes: boolean;
  observations?: string;
  payment_conditions?: string;
  payment_type?: string;
  period: string;
  billing_period: string;
  proposal?: string;
  provided_at?: string;
  service_details?: string;
  signed_at?: string;
  terminated_at?: string;
  updated_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
  contractable?: any;
  cart?: StorageContractCartItem[];
  invoices?: Invoice[];
  items?: ContractItem[];
  totals?: { PEN: number, USD: number };
  title: string;
  is_template?: boolean;
  template?: Contract;
  fk_template_uuid?: string;
  tracking_id?: number;
  document_progress?: number;
  items_required?: number;
  items_completed?: number;
};
export type ContractItem = {
  uuid: string;
  amount?: number;
  description: string;
  group: string;
  value: string;
  type: string;
  additional_details?: string;
  is_required?: boolean;
  approved_at?: string;
  approved_by?: Profile;
};
export type CommercialCategory = {
  uuid: string;
  name: string;
  description: string;
  code: string;
  created_at: string;
}
export type CommercialCategoryFee = {
  uuid: string;
  stock: StorageStock;
  category: CommercialCategory;
  amount: number;
  type: string;
  rules?: string[];
  created_at: string;
}
export type CommercialSeller = {
  uuid: string;
  profile: Profile;
  category: CommercialCategory;
  created_at: string;
};
export type Employee = {
  uuid: string;
  bank_account?: string;
  email?: string;
  bank_name?: string;
  children_number?: number;
  cost_center?: string;
  created_at?: string;
  cuspp?: string;
  employee_code?: string;
  fk_company_uuid?: string;
  fk_group_uuid?: string;
  fk_profile_uuid?: string;
  has_family_bonus?: boolean;
  joining_date?: string;
  monthly_salary?: number;
  pension_system?: string;
  position?: string;
  termination_date?: string;
  work_regime?: string;
  working_department?: string;
  working_place?: string;
  contracts?: Contract[];
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
  group: string;
  name: string;
  guard_name: string;
};

export type Token = {
  id: 14;
  abilities: ['*'];
  name: string;
  created_at: string;
  last_used_at: string;
  updated_at: string;
};

export type User = {
  uuid: number;
  last_login_at: string;
  /**
   * email is not used anymore, use profile email instead
   * @deprecated
   */
  email: string;
  profile?: Profile;
  roles?: Role[];
  /**
   * name will be removed, use profile name instead
   * @deprecated
   */
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
  tenants?: TenantConfig[];
  disabled_at?: string;
  email_verified_at?: string;
  token: string;
};

export type FileActivity = {
  uuid: number;
  user?: User;
  comment: string;
  attachments: ApiFile[];
  requested_at?: string;
  created_at: string;
  time?: number;
  verified_at?: string;
  action: string;
  file?: ApiFile;
};

export type ApiFile = {
  uuid: string;
  name: string;
  description: string;
  code: string;
  type: string;
  created_at: string;
  size: number;
  container_uuid?: string;
  container?: Container;
  activity?: Array<FileActivity>;
  source: string;
  details: string;
  public: string;
  thumbnail?: string;
  download?: string;
  start_from?: number;
};

export type UploadQueueFile = {
  id: string;
  hash: string;
  chunkSize: number;
  totalChunks: number;
  file: File;
  fileData?: ApiFile;
  containerUuid?: string;
  progress: number;
};

export type Container = {
  uuid: string;
  name: string;
  open: boolean; //local
  is_public: boolean;
  is_locked: boolean;
  lock_type: string;
  num_files?: number;
  num_containers?: number;
  description?: string;
  parent_container?: Container;
  created_at: string;
  updated_at: string;
};

export type ContainerContent = {
  container?: Container;
  containers: Array<Container>;
  files: Array<ApiFile>;
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
  uuid: string;
  billing_currency: string;
  billing_period: string;
  email_verified_at: string;
  is_active: boolean;
  code: string;
  //plan: Plan;
  observations: string;
  amount: number;
  started_at: string;
  terminated_at: string;
  contract_uuid?: string;
  contract?: Contract;
  members: SubscriptionMember[];
  holder_profile?: Profile;
};

export type SubscriptionMember = {
  uuid: string;
  relation_type: string;
  suspended_at?: string;
  profile: Profile;
  subscription?: Subscription;
};
export type InvoicePayment = {
  amount: number;
  created_at: string;
  description?: string;
  payment_channel?: string;
  fk_invoice_uuid: string;
  fk_payment_method_uuid: string;
  purchase_token: string;
  transaction_info: string;
  transaction_date: string;
  updated_at: string;
  uuid: string;
  voucher_code: string;
  method?: PaymentMethod;
  invoice?: Invoice;
};

export type PaymentMethod = {
  uuid: string;
  created_at: string;
  cvv: string;
  expire_date: string;
  profile?: Profile;
  is_active: boolean;
  is_default: boolean;
  issuer: string;
  name: string;
  number: number;
  type: string;
  updated_at: string;
};

export type Invoice = {
  uuid: string;
  amount: number;
  amount_string: string;
  tracking_id: string;
  concept: string;
  currency: string;
  pending_payment?: number;
  created_at: string;
  expires_on: string;
  issued_on: string;
  paid_at?: string;
  payments?: InvoicePayment[];
  items?: InvoiceItem[];
  purchase_token?: string;
  updated_at: string;
};

export type InvoiceItem = {
  uuid: string;
  amount: number;
  concept: string;
  created_at: string;
  fk_invoice_uuid: string;
  itemable_id: string;
  itemable_type: string;
  quantity: number;
  updated_at: string;
};

export type Wallet = {
  uuid: string;
  created_at: string;
  updated_at: string;
  name: string;
  description: string;
  bank_name: string;
  account_number: string;
  currency: string;
  international_account_number: string;
  country_code: string;
  balance: number;
  holder: any;
  holder_type: string;
  issued_at: string;
  disabled_at: string;
};

export type WalletTransaction = {
  uuid: string;
  created_at: string;
  amount: number;
  exchange_rate: number;
  type: string;
  updated_at: string;
  observations?: string;
  profile?: Profile;
  authorized_by?: Profile;
  wallet_from?: Wallet;
  wallet_to?: Wallet;
  needsAuthorization?: boolean;
};

export type MoveLocation = {
  uuid: string;
  name: string;
  address: string;
  created_at: string;
  updated_at: string;
};

export type MoveRoute = {
  uuid: string;
  name: string;
  locations?: MoveLocation[];
  created_at: string;
  circulation_card: string;
  updated_at: string;
  fk_route_uuid?: string;
  fk_vehicle_uuid?: string;
};
export type MoveTrip = {
  uuid: string;
  contracts?: Contract[];
  route?: MoveRoute;
  vehicle?: MoveVehicle;
  driver?: MoveDriver;
  created_by?: Profile;
  arrival_time: string;
  max_passengers: number;
  total_passengers: number;
  departure_time: string;
  started_at: string;
  arrived_at: string;
  cancelled_at: string;
  confirmed_at: string;
  created_at: string;
  updated_at: string;
};

export type MovePassenger = {
  uuid: string;
  checkin_date: string;
  checkout_date: string;
  created_at: string;
  drop_off_location?: MoveLocation;
  pickup_location?: MoveLocation;
  observations: string;
  updated_at: string;
  profile?: Profile;
  trip?: MoveTrip;
  ledger: string;
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
  driver?: MoveDriver;
  circulation_card?: string;
  weight?: number;
  max_capacity: number;
  fk_driver_uuid?: string;
  color?: string;
  created_at: string;
  updated_at: string;
};

export type TaxonomyDefinition = {
  uuid: string;
  name: string;
  code: string;
  cover?: ApiFile;
  description?: string;
  items: TaxonomyDefinitionItem[];
  order: number;
  parent?: TaxonomyDefinition;
  children?: TaxonomyDefinition[];
};

export type TaxonomyDefinitionItem = {
  uuid: string;
  entity: any;
  order: number;
  type: string;
};

export type Course = {
  uuid: string;
  benefits?: string;
  category: string;
  taxonomy?: TaxonomyDefinition;
  created_at: string;
  description: string;
  duration?: number;
  chat_room: ChatRoom;
  teacher_profile: Profile;
  is_public: boolean;
  language: string;
  max_attendance?: number;
  name: string;
  price?: number;
  syllabus?: string;
  cover?: ApiFile;
};

export type CourseModule = {
  uuid: string;
  name: string;
  order: number;
  description?: string;
  sessions?: ModuleSession[];
};

export type ModuleSession = {
  uuid: string;
  title: string;
  file: ApiFile;
};

export type LMSEvaluation = {
  uuid: string;
  name: string;
  description: string;
  questions: LMSQuestion[];
};

export type LMSQuestion = {
  uuid: string;
  statement: string;
  grade: number;
  order: number;
  answers?: LMSQuestionAnswer[];
};

export type LMSQuestionAnswer = {
  uuid: string;
  statement: string;
  caption?: string;
  is_correct: boolean;
  order: number;
};

export type ChatRoom = {
  uuid: string;
  name?: string;
};

export type EntityActivityStats = {
  completed: number;
  expired: number;
  pending: number;
  reviewed: number;
  total: number;
};

export type EntityActivity = {
  attachments?: ApiFile[];
  assigned_to?: Profile;
  comment?: string;
  completed_at?: string;
  created_at: string;
  entity?: any;
  entity_type: string;
  expired_at?: string;
  profile?: Profile;
  type: string;
  uuid: string;
};

export type EntityField = {
  uuid: string;
  type: string;
  name: string;
  code: string;
  unit_type: string;
  description: string;
  group: string;
  created_at: string;
  entity?: any;
  entity_type: string;
};

export type EntityFieldValue = {
  uuid: string;
  value: string;
  entity?: any;
  entity_type: string;
  field: EntityField;
};

export type StorageProduct = {
  uuid: string;
  brand: string;
  code: string;
  created_at: string;
  description: string;
  excerpt?: string;
  manufacturer: string;
  available_stock?: number;
  total_stock?: number;
  metadata?: any;
  model?: string;
  name: string;
  type?: string;
  unit_type?: string;
  updated_at: string;
};

export type StorageContractCartItem = {
  uuid: string;
  quantity: number;
  stock?: StorageStock;
  unit_amount?: number | null;
  amount_string?: string;
  created_at?: string;
};

export type StorageProductVariation = {
  uuid: string;
  name?: string;
  description?: string;
  unit_type?: string;
  sku: string;
  order: number;
  group?: string;
  is_public?: boolean;
  product?: StorageProduct;
  attachments?: ApiFile[];
  container_uuid?: string;
  fk_product_uuid: string;
  metadata?: any;
  attributes?: EntityFieldValue[];
  commercial_description?: string;
  excerpt?: string;
  created_at: string;
  updated_at: string;
};

export type StorageStock = {
  uuid: string;
  sku?: string;
  serial_number?: string;
  name?: string;
  type?: string;
  duration?: string;
  excerpt?: string;
  commercial_description?: string;
  currency: string;
  cost_price?: number;
  sale_price?: number;
  quantity?: number;
  is_consumable?: boolean;
  created_at: string;
  fk_product_variation_uuid: string;
  fk_warehouse_uuid: string;
  metadata?: any;
  observations?: string;
  expiration_date?: string;
  status: string;
  updated_at: string;
  attributes?: EntityFieldValue[];
  variation?: StorageProductVariation;
  warehouse?: StorageWarehouse;
  provider?: Provider;
};

export type StorageWarehouse = {
  uuid: string;
  name: string;
  address?: string;
  is_physical: boolean;
  created_at: string;
}
