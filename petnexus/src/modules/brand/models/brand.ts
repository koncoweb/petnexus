import { model } from "@medusajs/framework/utils"

const Brand = model.define("brand", {
  id: model.id().primaryKey(),
  name: model.text(),
  description: model.text(),
  logo_url: model.text(),
  website_url: model.text(),
})

export default Brand 