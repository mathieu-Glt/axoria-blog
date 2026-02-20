import slugify from "slugify";

const { Tag } = require("@/lib/models/Tag");

export async function findOrCreateTag(tagName) {
  const tagSlug = slugify(tagName, { lower: true, strict: true });
  let tag = await Tag.findOne({ slug: tagSlug });

  if (!tag) {
    tag = await Tag.create({ name: tagName, slug: tagSlug });
  }
}
