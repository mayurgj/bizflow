var CONFIG = {
  TITLE: "BizFlow",
  DATABASE: {
    dbUrl: PropertiesService.getScriptProperties().getProperty('SUPABASE_URL'),
    dbKey: PropertiesService.getScriptProperties().getProperty('SUPABASE_ANON_KEY'),
    hashSalt: "session" 
  },
  SCHEMA: {},
};

function doGet() {
  return HtmlService.createTemplateFromFile('index')
        .evaluate()
        .setTitle(CONFIG.TITLE)
        .addMetaTag('viewport', 'width=device-width, initial-scale=1')
        .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include_(fileName){
  return HtmlService.createTemplateFromFile(fileName).evaluate().getContent();
}

function initSchemas_() {
  if (!CONFIG.SCHEMA.public) {
    CONFIG.SCHEMA.public = new SupabaseClient();
    CONFIG.SCHEMA.reporting = new SupabaseClient(undefined, undefined, "reporting");
  }
}

function getView(viewName){
  initSchemas_();
  return CONFIG.SCHEMA.reporting.from(viewName).select("*").data;
}

function getVoucher(voucherType, options = {}) {
  initSchemas_();
  let query = CONFIG.SCHEMA.reporting.from("voucher").eq("voucher_type", voucherType);
  
  if (options.order) query = query.order(options.order);
  if (options.limit) query = query.limit(options.limit);
  
  const result = query.select(options.columns || "*");
  if (result.error) {
    console.error("Supabase Error:", result.error);
    return null;
  }
  return result.data;
}

function getItem(guid){
  initSchemas_();
  const result = CONFIG.SCHEMA.public.from("trn_inventory")
    .eq("guid", guid)
    .select("guid,item,quantity,rate,discount:discount_amount,amount,order_number");

  if (result.error) return null;
  return result.data;
}

function authUser(identifier, password) {
  initSchemas_();
  const hashedPassword = hashPassword_(password);
  const res = CONFIG.SCHEMA.public.from('users')
    .or(`email_id.eq.${identifier},user_name.eq.${identifier}`)
    .eq('password_hash', hashedPassword)
    .eq('is_active', true)
    .limit(1)
    .single()
    .select('email_id, full_name, user_name');
  if (res.error || !res.data) {
    console.error('Auth error:', res.error);
    return { success: false, message: 'Invalid credentials' };
  }

  return {
    success: true,
    user: {
      email: res.data.email_id,
      name: res.data.full_name,
      username: res.data.user_name
    }
  };
}

function signupUser(userObj) {
  initSchemas_();
  const users = CONFIG.SCHEMA.public.from('users');
  
  const existsRes = users.eq('email_id', userObj.email_id).select('id');
  if (existsRes.data && existsRes.data.length > 0) {
    return { success: false, message: 'Email already registered' };
  }

  const hashedPassword = hashPassword_(userObj.password);
  const insertRes = users.insert({
    email_id: userObj.email_id,
    full_name: userObj.full_name,
    user_name: userObj.user_name,
    password_hash: hashedPassword
  });

  return insertRes.error ? { success: false } : { success: true };
}

function hashPassword_(password) {
  if (!password) return '';
  const saltedPassword = password + CONFIG.DATABASE.hashSalt;
  const raw = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, saltedPassword, Utilities.Charset.UTF_8);
  return raw.map(b => {
    const v = (b < 0 ? b + 256 : b);
    return v.toString(16).padStart(2, '0');
  }).join('');
}
