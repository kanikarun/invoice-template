export type Accessories = {
  date_created?: string | null;
  date_updated?: string | null;
  demo_video_thumbnail?: (string & DirectusFiles) | null;
  demo_video_url?: string | null;
  description?: string | null;
  id: number;
  images: any[] & AccessoriesFiles[];
  name?: string | null;
  sort?: number | null;
  status: string;
  stock_status?: string | null;
  unit_price?: number | null;
  user_created?: (string & DirectusUsers) | null;
  user_updated?: (string & DirectusUsers) | null;
};

export type AccessoriesFiles = {
  accessories_id?: (number & Accessories) | null;
  directus_files_id?: (string & DirectusFiles) | null;
  id: number;
};

export type AppConfig = {
  id: number;
  invoice_android_current_version?: string | null;
  invoice_android_maintenance?: boolean | null;
  invoice_android_store_url?: string | null;
  invoice_android_update_required?: boolean | null;
  invoice_enable_monthly?: boolean | null;
  invoice_ios_current_version?: string | null;
  invoice_ios_maintenance?: boolean | null;
  invoice_ios_min_version?: string | null;
  invoice_ios_store_url?: string | null;
};

export type Coupons = {
  code?: string | null;
  date_created?: string | null;
  date_expired?: string | null;
  date_updated?: string | null;
  discount_amount?: number | null;
  discount_type?: string | null;
  id: number;
  status?: string | null;
  total_usage?: number | null;
  usage?: number | null;
  user_created?: (string & DirectusUsers) | null;
  user_updated?: (string & DirectusUsers) | null;
};

export type Customers = {
  address?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  fullname?: string | null;
  id: number;
  note?: string | null;
  phone?: string | null;
  phone2?: string | null;
  status?: string | null;
  tin?: string | null;
  user_created?: (string & DirectusUsers) | null;
  user_updated?: (string & DirectusUsers) | null;
};

export type DirectusAccess = {
  id: string;
  policy: string & DirectusPolicies;
  role?: (string & DirectusRoles) | null;
  sort?: number | null;
  user?: (string & DirectusUsers) | null;
};

export type DirectusActivity = {
  action?: string | null;
  collection?: string | null;
  id: number;
  ip?: string | null;
  item?: string | null;
  origin?: string | null;
  revisions: any[] & DirectusRevisions[];
  timestamp: string;
  user?: (string & DirectusUsers) | null;
  user_agent?: string | null;
};

export type DirectusCollections = {
  accountability?: string | null;
  archive_app_filter: boolean;
  archive_field?: string | null;
  archive_value?: string | null;
  collapse: string;
  collection: string;
  color?: string | null;
  display_template?: string | null;
  group?: (string & DirectusCollections) | null;
  hidden: boolean;
  icon?: string | null;
  item_duplication_fields?: unknown | null;
  note?: string | null;
  preview_url?: string | null;
  singleton: boolean;
  sort?: number | null;
  sort_field?: string | null;
  translations?: unknown | null;
  unarchive_value?: string | null;
  versioning: boolean;
};

export type DirectusComments = {
  collection: string & DirectusCollections;
  comment: string;
  date_created?: string | null;
  date_updated?: string | null;
  id: string;
  item: string;
  user_created?: (string & DirectusUsers) | null;
  user_updated?: (string & DirectusUsers) | null;
};

export type DirectusDashboards = {
  color?: string | null;
  date_created?: string | null;
  icon: string;
  id: string;
  name: string;
  note?: string | null;
  panels: any[] & DirectusPanels[];
  user_created?: (string & DirectusUsers) | null;
};

export type DirectusExtensions = {
  bundle?: string | null;
  enabled: boolean;
  folder: string;
  id: string;
  source: string;
};

export type DirectusFields = {
  collection: string & DirectusCollections;
  conditions?: unknown | null;
  display?: string | null;
  display_options?: unknown | null;
  field: string;
  group?: (string & DirectusFields) | null;
  hidden: boolean;
  id: number;
  interface?: string | null;
  note?: string | null;
  options?: unknown | null;
  readonly: boolean;
  required?: boolean | null;
  sort?: number | null;
  special?: unknown | null;
  translations?: unknown | null;
  validation?: unknown | null;
  validation_message?: string | null;
  width?: string | null;
};

export type DirectusFiles = {
  charset?: string | null;
  created_on: string;
  description?: string | null;
  duration?: number | null;
  embed?: string | null;
  filename_disk?: string | null;
  filename_download: string;
  filesize?: number | null;
  focal_point_x?: number | null;
  focal_point_y?: number | null;
  folder?: (string & DirectusFolders) | null;
  height?: number | null;
  id: string;
  is_transformed?: boolean | null;
  location?: string | null;
  metadata?: unknown | null;
  modified_by?: (string & DirectusUsers) | null;
  modified_on: string;
  storage: string;
  tags?: unknown | null;
  title?: string | null;
  tus_data?: unknown | null;
  tus_id?: string | null;
  type?: string | null;
  uploaded_by?: (string & DirectusUsers) | null;
  uploaded_on?: string | null;
  width?: number | null;
};

export type DirectusFlows = {
  accountability?: string | null;
  color?: string | null;
  date_created?: string | null;
  description?: string | null;
  icon?: string | null;
  id: string;
  name: string;
  operation?: (string & DirectusOperations) | null;
  operations: any[] & DirectusOperations[];
  options?: unknown | null;
  status: string;
  trigger?: string | null;
  user_created?: (string & DirectusUsers) | null;
};

export type DirectusFolders = {
  id: string;
  name: string;
  parent?: (string & DirectusFolders) | null;
};

export type DirectusMigrations = {
  name: string;
  timestamp?: string | null;
  version: string;
};

export type DirectusNotifications = {
  collection?: string | null;
  id: number;
  item?: string | null;
  message?: string | null;
  recipient: string & DirectusUsers;
  sender?: (string & DirectusUsers) | null;
  status?: string | null;
  subject: string;
  timestamp?: string | null;
};

export type DirectusOperations = {
  date_created?: string | null;
  flow: string & DirectusFlows;
  id: string;
  key: string;
  name?: string | null;
  options?: unknown | null;
  position_x: number;
  position_y: number;
  reject?: (string & DirectusOperations) | null;
  resolve?: (string & DirectusOperations) | null;
  type: string;
  user_created?: (string & DirectusUsers) | null;
};

export type DirectusPanels = {
  color?: string | null;
  dashboard: string & DirectusDashboards;
  date_created?: string | null;
  height: number;
  icon?: string | null;
  id: string;
  name?: string | null;
  note?: string | null;
  options?: unknown | null;
  position_x: number;
  position_y: number;
  show_header: boolean;
  type: string;
  user_created?: (string & DirectusUsers) | null;
  width: number;
};

export type DirectusPermissions = {
  action: string;
  collection: string;
  fields?: unknown | null;
  id: number;
  permissions?: unknown | null;
  policy: string & DirectusPolicies;
  presets?: unknown | null;
  validation?: unknown | null;
};

export type DirectusPolicies = {
  admin_access: boolean;
  app_access: boolean;
  description?: string | null;
  enforce_tfa: boolean;
  icon: string;
  id: string;
  ip_access?: unknown | null;
  name: string;
  permissions: any[] & DirectusPermissions[];
  roles: any[] & DirectusAccess[];
  users: any[] & DirectusAccess[];
};

export type DirectusPresets = {
  bookmark?: string | null;
  collection?: string | null;
  color?: string | null;
  filter?: unknown | null;
  icon?: string | null;
  id: number;
  layout?: string | null;
  layout_options?: unknown | null;
  layout_query?: unknown | null;
  refresh_interval?: number | null;
  role?: (string & DirectusRoles) | null;
  search?: string | null;
  title?: string | null;
  user?: (string & DirectusUsers) | null;
};

export type DirectusRelations = {
  id: number;
  junction_field?: string | null;
  many_collection: string;
  many_field: string;
  one_allowed_collections?: unknown | null;
  one_collection?: string | null;
  one_collection_field?: string | null;
  one_deselect_action: string;
  one_field?: string | null;
  sort_field?: string | null;
};

export type DirectusRevisions = {
  activity: number & DirectusActivity;
  collection: string;
  data?: unknown | null;
  delta?: unknown | null;
  id: number;
  item: string;
  parent?: (number & DirectusRevisions) | null;
  version?: (string & DirectusVersions) | null;
};

export type DirectusRoles = {
  children: any[] & DirectusRoles[];
  description?: string | null;
  icon: string;
  id: string;
  name: string;
  parent?: (string & DirectusRoles) | null;
  policies: any[] & DirectusAccess[];
  users: any[] & DirectusUsers[];
  users_group: string;
};

export type DirectusSessions = {
  expires: string;
  ip?: string | null;
  next_token?: string | null;
  origin?: string | null;
  share?: (string & DirectusShares) | null;
  token: string;
  user?: (string & DirectusUsers) | null;
  user_agent?: string | null;
};

export type DirectusSettings = {
  auth_login_attempts?: number | null;
  auth_password_policy?: string | null;
  basemaps?: unknown | null;
  custom_aspect_ratios?: unknown | null;
  custom_css?: string | null;
  default_appearance: string;
  default_language: string;
  default_theme_dark?: string | null;
  default_theme_light?: string | null;
  id: number;
  mapbox_key?: string | null;
  module_bar?: unknown | null;
  project_color: string;
  project_descriptor?: string | null;
  project_logo?: (string & DirectusFiles) | null;
  project_name: string;
  project_url?: string | null;
  public_background?: (string & DirectusFiles) | null;
  public_favicon?: (string & DirectusFiles) | null;
  public_foreground?: (string & DirectusFiles) | null;
  public_note?: string | null;
  public_registration: boolean;
  public_registration_email_filter?: unknown | null;
  public_registration_role?: (string & DirectusRoles) | null;
  public_registration_verify_email: boolean;
  report_bug_url?: string | null;
  report_error_url?: string | null;
  report_feature_url?: string | null;
  storage_asset_presets?: unknown | null;
  storage_asset_transform?: string | null;
  storage_default_folder?: (string & DirectusFolders) | null;
  theme_dark_overrides?: unknown | null;
  theme_light_overrides?: unknown | null;
  theming_group: string;
  visual_editor_urls?: unknown | null;
};

export type DirectusShares = {
  collection: string & DirectusCollections;
  date_created?: string | null;
  date_end?: string | null;
  date_start?: string | null;
  id: string;
  item: string;
  max_uses?: number | null;
  name?: string | null;
  password?: string | null;
  role?: (string & DirectusRoles) | null;
  times_used?: number | null;
  user_created?: (string & DirectusUsers) | null;
};

export type DirectusSyncIdMap = {
  created_at?: string | null;
  id: number;
  local_id: string;
  sync_id: string;
  table: string;
};

export type DirectusTranslations = {
  id: string;
  key: string;
  language: string;
  value: string;
};

export type DirectusUsers = {
  appearance?: string | null;
  auth_data?: unknown | null;
  avatar?: (string & DirectusFiles) | null;
  description?: string | null;
  email?: string | null;
  email_notifications?: boolean | null;
  external_identifier?: string | null;
  first_name?: string | null;
  id: string;
  language?: string | null;
  last_access?: string | null;
  last_name?: string | null;
  last_page?: string | null;
  location?: string | null;
  merchants: any[] & MerchantsDirectusUsers[];
  password?: string | null;
  policies: any[] & DirectusAccess[];
  provider: string;
  role?: (string & DirectusRoles) | null;
  status: string;
  tags?: unknown | null;
  tfa_secret?: string | null;
  theme_dark?: string | null;
  theme_dark_overrides?: unknown | null;
  theme_light?: string | null;
  theme_light_overrides?: unknown | null;
  title?: string | null;
  token?: string | null;
  user_type?: string | null;
};

export type DirectusVersions = {
  collection: string & DirectusCollections;
  date_created?: string | null;
  date_updated?: string | null;
  delta?: unknown | null;
  hash?: string | null;
  id: string;
  item: string;
  key: string;
  name?: string | null;
  user_created?: (string & DirectusUsers) | null;
  user_updated?: (string & DirectusUsers) | null;
};

export type DirectusWebhooks = {
  actions: unknown;
  collections: unknown;
  data: boolean;
  headers?: unknown | null;
  id: number;
  method: string;
  migrated_flow?: (string & DirectusFlows) | null;
  name: string;
  status: string;
  url: string;
  was_active_before_deprecation: boolean;
};

export type Invoices = {
  currency?: string | null;
  customer?: (number & Customers) | null;
  date?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  delivery_price?: number | null;
  deposit?: number | null;
  deposit_price?: number | null;
  deposit_type?: string | null;
  discount?: number | null;
  discount_price?: number | null;
  discount_type?: string | null;
  exchange_rate?: number | null;
  id: string;
  invoice_no?: string | null;
  invoice_status?: string | null;
  invoice_type?: string | null;
  menus: any[] & InvoicesMenus[];
  merchant_id?: (string & Merchants) | null;
  note?: string | null;
  status?: string | null;
  sub_total?: number | null;
  tax_percentage?: number | null;
  tax_price?: number | null;
  total_price?: number | null;
  user_created?: (string & DirectusUsers) | null;
  user_updated?: (string & DirectusUsers) | null;
};

export type InvoicesMenus = {
  discount?: number | null;
  discount_string?: string | null;
  discount_type?: string | null;
  id: number;
  invoices_id?: (string & Invoices) | null;
  menus_id?: (string & Menus) | null;
  merchant_uom_id?: (number & MerchantUoms) | null;
  qty?: number | null;
  total_price?: number | null;
  unit_price?: number | null;
};

export type Languages = {
  code: string;
  direction?: string | null;
  name?: string | null;
};

export type Leads = {
  biz_type?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  id: number;
  name?: string | null;
  note?: string | null;
  phone?: string | null;
  sender_id?: string | null;
  status?: string | null;
  user_created?: (string & DirectusUsers) | null;
  user_updated?: (string & DirectusUsers) | null;
};

export type MenuCategories = {
  date_created?: string | null;
  date_updated?: string | null;
  id: string;
  merchant_id?: (string & Merchants) | null;
  sort?: number | null;
  status?: string | null;
  translations: any[] & MenuCategoriesTranslations[];
  user_created?: (string & DirectusUsers) | null;
  user_updated?: (string & DirectusUsers) | null;
};

export type MenuCategoriesTranslations = {
  id: number;
  languages_code?: (string & Languages) | null;
  menu_categories_id?: (string & MenuCategories) | null;
  name?: string | null;
};

export type MenuOrderItems = {
  date_created?: string | null;
  date_updated?: string | null;
  discount?: number | null;
  discount_price?: number | null;
  discount_type?: string | null;
  id: number;
  menu_id?: (string & Menus) | null;
  menu_name?: string | null;
  menu_order_id?: (number & MenuOrders) | null;
  menu_price_id?: (string & MenuPrices) | null;
  menu_price_name?: string | null;
  qty?: number | null;
  sub_total?: number | null;
  total_price?: number | null;
  unit_price?: number | null;
  user_created?: (string & DirectusUsers) | null;
  user_updated?: (string & DirectusUsers) | null;
};

export type MenuOrderRefunds = {
  date_created?: string | null;
  date_updated?: string | null;
  id: number;
  menu_order_id?: (number & MenuOrders) | null;
  merchant_id?: (string & Merchants) | null;
  refund_amount?: number | null;
  remark?: string | null;
  response?: unknown | null;
  transaction_status?: string | null;
  user_created?: (string & DirectusUsers) | null;
  user_updated?: (string & DirectusUsers) | null;
};

export type MenuOrders = {
  code?: string | null;
  customer_address?: string | null;
  customer_name?: string | null;
  customer_note?: string | null;
  customer_phone?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  delivery_price?: number | null;
  discount_price?: number | null;
  id: number;
  menu_order_items: any[] & MenuOrderItems[];
  menu_order_refunds: any[] & MenuOrderRefunds[];
  merchant_id?: (string & Merchants) | null;
  order_note?: string | null;
  order_status?: string | null;
  payment_method?: string | null;
  payment_status?: string | null;
  refund_amount?: number | null;
  sub_total?: number | null;
  total_price?: number | null;
  user_created?: (string & DirectusUsers) | null;
  user_updated?: (string & DirectusUsers) | null;
};

export type MenuPrices = {
  date_created?: string | null;
  date_updated?: string | null;
  discount?: number | null;
  discount_type?: string | null;
  id: string;
  menu_id?: (string & Menus) | null;
  merchant_id?: (string & Merchants) | null;
  name?: string | null;
  sort?: number | null;
  status: string;
  unit_price?: number | null;
  user_created?: (string & DirectusUsers) | null;
  user_updated?: (string & DirectusUsers) | null;
};

export type MenuStocks = {
  date?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  id: number;
  invoice_id?: (string & Invoices) | null;
  menu_id?: (string & Menus) | null;
  merchant_id?: (string & Merchants) | null;
  note?: string | null;
  qty?: number | null;
  status: string;
  type?: string | null;
  unit?: string | null;
  user_created?: (string & DirectusUsers) | null;
  user_updated?: (string & DirectusUsers) | null;
};

export type MenuTags = {
  bg_color?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  id: number;
  merchant_id?: (string & Merchants) | null;
  status?: string | null;
  translations: any[] & MenuTagsTranslations[];
  user_created?: (string & DirectusUsers) | null;
  user_updated?: (string & DirectusUsers) | null;
};

export type MenuTagsTranslations = {
  id: number;
  languages_code?: (string & Languages) | null;
  menu_tags_id?: (number & MenuTags) | null;
  name?: string | null;
};

export type Menus = {
  code?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  discount_khr?: string | null;
  discount_percentage?: number | null;
  discount_usd?: string | null;
  id: string;
  image?: (string & DirectusFiles) | null;
  latest_invoice_menu_price?: unknown | null;
  media: any[] & MenusFiles[];
  menu_categories: any[] & MenusMenuCategories[];
  menu_price_enabled?: boolean | null;
  menu_prices: any[] & MenuPrices[];
  menu_tag?: (number & MenuTags) | null;
  merchant_id?: (string & Merchants) | null;
  note?: string | null;
  price_khr?: string | null;
  price_usd?: string | null;
  show_in_saveme?: boolean | null;
  sort?: number | null;
  status?: string | null;
  translations: any[] & MenusTranslations[];
  user_created?: (string & DirectusUsers) | null;
  user_updated?: (string & DirectusUsers) | null;
};

export type MenusFiles = {
  directus_files_id?: (string & DirectusFiles) | null;
  id: number;
  menus_id?: (string & Menus) | null;
};

export type MenusMenuCategories = {
  id: number;
  menu_categories_id?: (string & MenuCategories) | null;
  menus_id?: (string & Menus) | null;
};

export type MenusTranslations = {
  description?: string | null;
  id: number;
  languages_code?: (string & Languages) | null;
  menus_id?: (string & Menus) | null;
  name?: string | null;
};

export type MerchantPaymentMethods = {
  date_created?: string | null;
  date_updated?: string | null;
  id: number;
  merchant_id?: (string & Merchants) | null;
  payway_api_key?: string | null;
  payway_enabled?: boolean | null;
  payway_merchant_id?: string | null;
  payway_merchant_key?: string | null;
  payway_merchant_name?: string | null;
  payway_public_rsa?: string | null;
  status: string;
  user_created?: (string & DirectusUsers) | null;
  user_updated?: (string & DirectusUsers) | null;
};

export type MerchantUoms = {
  date_created?: string | null;
  date_updated?: string | null;
  id: number;
  merchant_id?: (string & Merchants) | null;
  name?: string | null;
  status: string;
  user_created?: (string & DirectusUsers) | null;
  user_updated?: (string & DirectusUsers) | null;
};

export type Merchants = {
  admin_email?: string | null;
  admin_first_name?: string | null;
  admin_last_name?: string | null;
  admin_password?: string | null;
  admins: any[] & MerchantsDirectusUsers[];
  code?: string | null;
  color?: string | null;
  cover?: (string & DirectusFiles) | null;
  date_created?: string | null;
  date_updated?: string | null;
  expired_date?: string | null;
  facebook_url?: string | null;
  google_map_url?: string | null;
  id: string;
  instagram_url?: string | null;
  invoice_header?: string | null;
  invoice_no_template?: string | null;
  invoice_note?: string | null;
  invoice_start_no?: number | null;
  invoice_tin?: string | null;
  khqr_image?: (string & DirectusFiles) | null;
  line_url?: string | null;
  logo?: (string & DirectusFiles) | null;
  max_menu_image?: number | null;
  menu_image_fit?: string | null;
  menu_order_delivery_price?: number | null;
  menu_order_payment_enabled?: boolean | null;
  menu_order_refund_enabled?: boolean | null;
  merchandise?: unknown | null;
  payment_note?: string | null;
  show_signature?: boolean | null;
  signature_image?: (string & DirectusFiles) | null;
  sort?: number | null;
  status: string;
  telegram_url?: string | null;
  telephone?: string | null;
  template?: string | null;
  theme?: string | null;
  tier?: string | null;
  tiktok_url?: string | null;
  translations: any[] & MerchantsTranslations[];
  user_created?: (string & DirectusUsers) | null;
  user_updated?: (string & DirectusUsers) | null;
  whatsapp_url?: string | null;
  youtube_url?: string | null;
};

export type MerchantsDirectusUsers = {
  directus_users_id?: (string & DirectusUsers) | null;
  id: number;
  merchants_id?: (string & Merchants) | null;
};

export type MerchantsTranslations = {
  description?: string | null;
  id: number;
  languages_code?: (string & Languages) | null;
  merchants_id?: (string & Merchants) | null;
  title?: string | null;
};

export type PaymentOrderItems = {
  accessory_id?: (number & Accessories) | null;
  id: number;
  item_name?: string | null;
  payment_order_id?: (string & PaymentOrders) | null;
  qty?: number | null;
  total_price?: number | null;
  unit_price?: number | null;
};

export type PaymentOrders = {
  apple_iap_transaction_id?: string | null;
  code?: string | null;
  coupon?: (number & Coupons) | null;
  customer_address?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  date_created?: string | null;
  date_updated?: string | null;
  discount_price?: number | null;
  id: string;
  merchant?: (string & Merchants) | null;
  payment_method?: string | null;
  payment_order_items: any[] & PaymentOrderItems[];
  plan?: string | null;
  price?: number | null;
  status?: string | null;
  total_price?: number | null;
  tracking_status?: string | null;
  type?: string | null;
  user?: (string & DirectusUsers) | null;
  user_created?: (string & DirectusUsers) | null;
  user_updated?: (string & DirectusUsers) | null;
};

export type RedboxAds = {
  date_created?: string | null;
  date_updated?: string | null;
  id: number;
  image?: (string & DirectusFiles) | null;
  sort?: number | null;
  status: string;
  title?: string | null;
  url?: string | null;
  user_created?: (string & DirectusUsers) | null;
  user_updated?: (string & DirectusUsers) | null;
};

export type Sliders = {
  date_created?: string | null;
  date_updated?: string | null;
  id: number;
  image?: (string & DirectusFiles) | null;
  merchant_id?: (string & Merchants) | null;
  status?: string | null;
  title?: string | null;
  user_created?: (string & DirectusUsers) | null;
  user_updated?: (string & DirectusUsers) | null;
};

export type Subscriptions = {
  apple_original_tran_id?: string | null;
  date_cancelled?: string | null;
  date_created?: string | null;
  date_expired?: string | null;
  date_updated?: string | null;
  id: string;
  is_manual?: boolean | null;
  merchant?: (string & Merchants) | null;
  plan?: string | null;
  status?: string | null;
  type?: string | null;
  user?: (string & DirectusUsers) | null;
};

export type CustomDirectusTypes = {
  accessories: Accessories[];
  accessories_files: AccessoriesFiles[];
  app_config: AppConfig;
  coupons: Coupons[];
  customers: Customers[];
  directus_access: DirectusAccess[];
  directus_activity: DirectusActivity[];
  directus_collections: DirectusCollections[];
  directus_comments: DirectusComments[];
  directus_dashboards: DirectusDashboards[];
  directus_extensions: DirectusExtensions[];
  directus_fields: DirectusFields[];
  directus_files: DirectusFiles[];
  directus_flows: DirectusFlows[];
  directus_folders: DirectusFolders[];
  directus_migrations: DirectusMigrations[];
  directus_notifications: DirectusNotifications[];
  directus_operations: DirectusOperations[];
  directus_panels: DirectusPanels[];
  directus_permissions: DirectusPermissions[];
  directus_policies: DirectusPolicies[];
  directus_presets: DirectusPresets[];
  directus_relations: DirectusRelations[];
  directus_revisions: DirectusRevisions[];
  directus_roles: DirectusRoles[];
  directus_sessions: DirectusSessions[];
  directus_settings: DirectusSettings;
  directus_shares: DirectusShares[];
  directus_sync_id_map: DirectusSyncIdMap[];
  directus_translations: DirectusTranslations[];
  directus_users: DirectusUsers[];
  directus_versions: DirectusVersions[];
  directus_webhooks: DirectusWebhooks[];
  invoices: Invoices[];
  invoices_menus: InvoicesMenus[];
  languages: Languages[];
  leads: Leads[];
  menu_categories: MenuCategories[];
  menu_categories_translations: MenuCategoriesTranslations[];
  menu_order_items: MenuOrderItems[];
  menu_order_refunds: MenuOrderRefunds[];
  menu_orders: MenuOrders[];
  menu_prices: MenuPrices[];
  menu_stocks: MenuStocks[];
  menu_tags: MenuTags[];
  menu_tags_translations: MenuTagsTranslations[];
  menus: Menus[];
  menus_files: MenusFiles[];
  menus_menu_categories: MenusMenuCategories[];
  menus_translations: MenusTranslations[];
  merchant_payment_methods: MerchantPaymentMethods[];
  merchant_uoms: MerchantUoms[];
  merchants: Merchants[];
  merchants_directus_users: MerchantsDirectusUsers[];
  merchants_translations: MerchantsTranslations[];
  payment_order_items: PaymentOrderItems[];
  payment_orders: PaymentOrders[];
  redbox_ads: RedboxAds[];
  sliders: Sliders[];
  subscriptions: Subscriptions[];
};
