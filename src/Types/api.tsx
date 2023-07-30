export type TenantConfig = {
  id: string;
  color?: string;
  favicon?: string;
  favicon_white?: string;
  logo?: string;
};
export type Company = {
  uuid: number;
  name: string;
  legal_name: string;
  legal_uid: string;
};

export type Profile = {
  uuid: number;
  name: string;
  last_name: string;
  email: string;
  user?: User;
  avatar?: File;
};

export type User = {
  uuid: number;
  email: string;
  profile: Profile;
  name: string;
  token: string;
};

export type FileActivity = {
  uuid: number;
  user: User;
  comment: string;
  requested_at?: string;
  created_at: string;
  verified_at?: string;
  action: string;
  file?: File;
};

export type File = {
  uuid: number;
  name: string;
  description: string;
  code: string;
  type: string;
  created_at: string;
  size: number;
  container?: Container;
  activity?: Array<FileActivity>;
  source: string;
  public: string;
  thumbnail?: string;
  download?: string;
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
  space_assigned: number;
  space_used: number;
};

export type MailFolder = {
  uuid: number;
  name: string;
  path: string;
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
