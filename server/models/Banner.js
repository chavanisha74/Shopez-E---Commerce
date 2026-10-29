const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide banner title'],
      trim: true
    },
    subtitle: {
      type: String,
      trim: true
    },
    banner: {
      type: String,
      required: [true, 'Please provide banner image URL']
    },
    badge: {
      type: String,
      default: 'Special Offer'
    },
    link: {
      type: String,
      default: '/products'
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
      }
    ],
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Banner', bannerSchema);
