import { model } from "@medusajs/framework/utils"

const Supplier = model.define("supplier", {
  id: model.id().primaryKey(),
  company_name: model.text(),
  contact_person: model.text(),
  email: model.text(),
  phone: model.text(),
  address: model.text(),
  city: model.text(),
  state: model.text(),
  country: model.text(),
  postal_code: model.text(),
  tax_id: model.text(),
  payment_terms: model.text(),
  status: model.enum(["active", "inactive", "suspended"]).default("active"),
  notes: model.text(),
  website: model.text(),
  whatsapp_number: model.text(),
  auto_restock_enabled: model.boolean().default(false),
  ai_restock_threshold: model.number().default(10),
  
  // New fields for promotion management
  promotion_auto_approval: model.boolean().default(false),
  max_active_promotions: model.number().default(5),
  promotion_notification_email: model.text(),
})

export default Supplier 