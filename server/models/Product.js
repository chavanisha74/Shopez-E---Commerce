const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide product title'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters']
    },
    description: {
      type: String,
      required: [true, 'Please provide product description'],
      trim: true
    },
    mainImg: {
      type: String,
      required: [true, 'Please provide main product image URL']
    },
    images: {
      type: [String],
      default: []
    },
    carousel: {
      type: [String],
      default: []
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Please specify a category']
    },
    sizes: {
      type: [String],
      default: ['S', 'M', 'L', 'XL']
    },
    gender: {
      type: String,
      enum: ['Men', 'Women', 'Unisex', 'Kids', 'All'],
      default: 'All'
    },
    price: {
      type: Number,
      required: [true, 'Please provide price'],
      min: [0, 'Price must be positive']
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%']
    },
    finalPrice: {
      type: Number,
      min: [0, 'Final price cannot be negative']
    },
    stock: {
      type: Number,
      required: [true, 'Please provide stock quantity'],
      min: [0, 'Stock cannot be negative'],
      default: 10
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    rating: {
      type: Number,
      default: 4.5,
      min: 0,
      max: 5
    },
    numReviews: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Calculate finalPrice before saving
productSchema.pre('save', function (next) {
  if (this.price !== undefined) {
    const discount = this.discount || 0;
    const computed = this.price - (this.price * discount) / 100;
    this.finalPrice = Math.round(computed * 100) / 100;
  }
  next();
});

// Indexes for search and query performance
productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Product', productSchema);
