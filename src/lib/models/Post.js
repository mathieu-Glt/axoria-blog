import mongoose from "mongoose";
import slugify from "slugify";

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    markdownArticle: {
      type: String,
      required: true,
    },
    markdownHTMLResult: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    slug: {
      type: String,
      required: true,
      unique: true, // Ajoute l'unicité
    },
    coverImageUrl: {
      type: String,
      required: true,
    },
    tags: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
      },
    ],
  },
  { timestamps: true },
);

// Middleware AVANT la sauvegarde
postSchema.pre("validate", async function (next) {
  if (!this.slug && this.title) {
    let slugCandidate = slugify(this.title, { lower: true, strict: true });

    // Vérifier l'unicité
    let slugExists = await mongoose.models.Post.findOne({
      slug: slugCandidate,
    });

    let counter = 1;
    while (slugExists) {
      slugCandidate = `${slugify(this.title, { lower: true, strict: true })}-${counter}`;
      slugExists = await mongoose.models.Post.findOne({ slug: slugCandidate });
      counter++;
    }

    this.slug = slugCandidate;
  }
  next();
});

export const Post = mongoose.models?.Post || mongoose.model("Post", postSchema);
