const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Banner = require('../models/Banner');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Wishlist = require('../models/Wishlist');
const { connectDB } = require('../config/db');
const { calculateFinalPrice } = require('../utils/priceCalculator');

const seedData = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany(),
      Category.deleteMany(),
      Product.deleteMany(),
      Banner.deleteMany(),
      Order.deleteMany(),
      Cart.deleteMany(),
      Wishlist.deleteMany()
    ]);

    console.log('[Seed] Seeding Users...');
    const adminUser = await User.create({
      name: 'SHOPEZ Administrator',
      username: 'shopezadmin',
      email: 'admin@shopez.com',
      password: 'Admin@shopez2026', // Secure default admin credentials
      mobile: '+1 (555) 019-2834',
      address: '742 Evergreen Terrace',
      pincode: '97477',
      userType: 'admin',
      isActive: true,
      savedAddresses: [
        {
          fullName: 'SHOPEZ Operations',
          phone: '+1 (555) 019-2834',
          street: '742 Evergreen Terrace',
          city: 'Springfield',
          state: 'Oregon',
          pincode: '97477',
          isDefault: true
        }
      ]
    });

    const customerUser = await User.create({
      name: 'Alex Johnson',
      username: 'alexj',
      email: 'alex@example.com',
      password: 'User@shopez2026',
      mobile: '+1 (555) 345-6789',
      address: '100 Ocean Drive, Apt 4B',
      pincode: '33139',
      userType: 'customer',
      isActive: true,
      savedAddresses: [
        {
          fullName: 'Alex Johnson',
          phone: '+1 (555) 345-6789',
          street: '100 Ocean Drive, Apt 4B',
          city: 'Miami Beach',
          state: 'Florida',
          pincode: '33139',
          isDefault: true
        }
      ]
    });

    console.log('[Seed] Seeding Categories...');
    const categoriesData = [
      {
        name: "Men's Fashion",
        slug: 'mens-fashion',
        description: 'Premium casual shirts, tailored suits, denim, and jackets designed for modern men.',
        image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?w=600&auto=format&fit=crop&q=80',
        isActive: true
      },
      {
        name: "Women's Fashion",
        slug: 'womens-fashion',
        description: 'Chic dresses, elegant tops, workwear, and trendsetting seasonal styles.',
        image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&auto=format&fit=crop&q=80',
        isActive: true
      },
      {
        name: 'Footwear & Sneakers',
        slug: 'footwear',
        description: 'Performance running shoes, lifestyle sneakers, loafers, and leather boots.',
        image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=80',
        isActive: true
      },
      {
        name: 'Accessories & Watches',
        slug: 'accessories',
        description: 'Designer chronographs, minimalist leather wallets, sunglasses, and travel backpacks.',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
        isActive: true
      },
      {
        name: 'Activewear & Sport',
        slug: 'activewear',
        description: 'Breathable training gear, moisture-wicking tees, yoga apparel, and gym bags.',
        image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
        isActive: true
      }
    ];

    const categories = await Category.insertMany(categoriesData);
    const catMap = {};
    categories.forEach((cat) => {
      catMap[cat.slug] = cat._id;
    });

    console.log('[Seed] Seeding Banners...');
    await Banner.insertMany([
      {
        title: 'Autumn & Winter Collection 2026',
        subtitle: 'Elevate your wardrobe with cozy knitwear and premium wool overcoats.',
        banner: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=1600&auto=format&fit=crop&q=80',
        badge: 'NEW SEASON',
        link: '/products?category=mens-fashion',
        categories: [catMap['mens-fashion'], catMap['womens-fashion']],
        isActive: true
      },
      {
        title: 'Exclusive Sneaker Drop',
        subtitle: 'Ultra-cushioned comfort and iconic athletic silhouettes up to 35% off.',
        banner: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1600&auto=format&fit=crop&q=80',
        badge: 'LIMITED EDITION',
        link: '/products?category=footwear',
        categories: [catMap['footwear']],
        isActive: true
      },
      {
        title: 'Minimalist Chronographs & Leather',
        subtitle: 'Precision quartz watches with genuine sapphire crystal glass.',
        banner: 'https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=1600&auto=format&fit=crop&q=80',
        badge: 'FLASH SALE',
        link: '/products?category=accessories',
        categories: [catMap['accessories']],
        isActive: true
      }
    ]);

    console.log('[Seed] Seeding Products...');
    const productsData = [
      // Men's Fashion
      {
        title: 'Classic Wool Blend Overcoat',
        description: 'Tailored from an Italian wool blend, this single-breasted overcoat features notched lapels, a satin lining, and interior ticket pockets. Perfect for smart office wear or formal evenings.',
        mainImg: 'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['mens-fashion'],
        sizes: ['S', 'M', 'L', 'XL'],
        gender: 'Men',
        price: 249.99,
        discount: 20,
        stock: 25,
        isFeatured: true,
        isActive: true,
        rating: 4.8,
        numReviews: 42
      },
      {
        title: 'Organic Heavyweight Crewneck Sweatshirt',
        description: 'Made from 100% GOTS-certified organic loopback French terry cotton. Pre-shrunk for an enduring relaxed fit that softens with every wash.',
        mainImg: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['mens-fashion'],
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        gender: 'Men',
        price: 89.0,
        discount: 10,
        stock: 45,
        isFeatured: false,
        isActive: true,
        rating: 4.6,
        numReviews: 18
      },
      {
        title: 'Raw Selvedge Denim Jeans (Slim Straight)',
        description: 'Crafted on vintage shuttle looms from 13.5 oz Japanese selvedge denim. Develops custom honeycombs and whiskers unique to your lifestyle.',
        mainImg: 'https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1542272604-780c96856592?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['mens-fashion'],
        sizes: ['30', '32', '34', '36'],
        gender: 'Men',
        price: 155.0,
        discount: 15,
        stock: 30,
        isFeatured: true,
        isActive: true,
        rating: 4.9,
        numReviews: 64
      },

      // Women's Fashion
      {
        title: 'Cashmere Knit Turtleneck Sweater',
        description: 'Pure Grade-A Mongolian cashmere spun into an ultra-soft 12-gauge knit. Features ribbed cuffs, dropped shoulders, and a relaxed silhouette.',
        mainImg: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['womens-fashion'],
        sizes: ['XS', 'S', 'M', 'L'],
        gender: 'Women',
        price: 189.0,
        discount: 25,
        stock: 20,
        isFeatured: true,
        isActive: true,
        rating: 4.9,
        numReviews: 53
      },
      {
        title: 'Structured Linen Blend Wrap Midi Dress',
        description: 'An airy midi dress tailored with a surplice neckline, waist tie belt, and elegant side slit. Perfect for spring brunch and summer vacations.',
        mainImg: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['womens-fashion'],
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        gender: 'Women',
        price: 139.0,
        discount: 0,
        stock: 18,
        isFeatured: false,
        isActive: true,
        rating: 4.7,
        numReviews: 29
      },
      {
        title: 'Tailored Double-Breasted Trench Coat',
        description: 'Water-repellent gabardine cotton trench coat with horn buttons, storm flap, and removable buckle belt.',
        mainImg: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['womens-fashion'],
        sizes: ['S', 'M', 'L'],
        gender: 'Women',
        price: 219.0,
        discount: 15,
        stock: 15,
        isFeatured: true,
        isActive: true,
        rating: 4.8,
        numReviews: 36
      },

      // Footwear
      {
        title: 'AeroGlide Performance Running Shoes',
        description: 'Engineered with responsive carbon-infused foam midsole, breathable micro-mesh upper, and continental rubber traction pods.',
        mainImg: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80',
          'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['footwear'],
        sizes: ['7', '8', '9', '10', '11', '12'],
        gender: 'Unisex',
        price: 160.0,
        discount: 30,
        stock: 50,
        isFeatured: true,
        isActive: true,
        rating: 4.9,
        numReviews: 112
      },
      {
        title: 'Handcrafted Heritage Chelsea Boots',
        description: 'Goodyear-welted full-grain Italian leather boots with durable elastic side gussets and Vibram rubber lug outsoles.',
        mainImg: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['footwear'],
        sizes: ['8', '9', '10', '11'],
        gender: 'Men',
        price: 280.0,
        discount: 10,
        stock: 16,
        isFeatured: false,
        isActive: true,
        rating: 4.8,
        numReviews: 44
      },
      {
        title: 'Retro Court Leather Low-Tops',
        description: 'Clean minimalist white leather sneakers with soft calfskin lining and stitched cupsole construction.',
        mainImg: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['footwear'],
        sizes: ['6', '7', '8', '9', '10', '11'],
        gender: 'Unisex',
        price: 120.0,
        discount: 15,
        stock: 35,
        isFeatured: true,
        isActive: true,
        rating: 4.7,
        numReviews: 78
      },

      // Accessories
      {
        title: 'Chronograph Minimalist Sapphire Watch',
        description: 'Featuring a 40mm 316L stainless steel case, scratch-proof sapphire crystal glass, Japanese quartz movement, and interchangeable top-grain leather strap.',
        mainImg: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['accessories'],
        sizes: ['Standard'],
        gender: 'Unisex',
        price: 195.0,
        discount: 25,
        stock: 22,
        isFeatured: true,
        isActive: true,
        rating: 4.9,
        numReviews: 87
      },
      {
        title: 'Full-Grain Leather Everyday Commuter Backpack',
        description: 'Handcrafted with vegetable-tanned leather, dedicated padded 16-inch laptop compartment, YKK water-resistant zippers, and ergonomic shoulder straps.',
        mainImg: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['accessories'],
        sizes: ['20L'],
        gender: 'Unisex',
        price: 175.0,
        discount: 10,
        stock: 14,
        isFeatured: false,
        isActive: true,
        rating: 4.8,
        numReviews: 32
      },

      // Activewear
      {
        title: 'Pro-Breeze Seamless Gym Compression T-Shirt',
        description: 'Engineered with 4-way stretch fabric and micro-ventilation zones to keep you cool during intense CrossFit and marathon workouts.',
        mainImg: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['activewear'],
        sizes: ['S', 'M', 'L', 'XL'],
        gender: 'Men',
        price: 48.0,
        discount: 0,
        stock: 60,
        isFeatured: false,
        isActive: true,
        rating: 4.6,
        numReviews: 24
      },
      {
        title: 'High-Waist ButterSoft Workout Leggings',
        description: 'Featuring zero-slip contour waistband, hidden pocket for phone/keys, and squat-proof moisture-wicking fabric.',
        mainImg: 'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?w=800&auto=format&fit=crop&q=80',
        images: [
          'https://images.unsplash.com/photo-1506152983158-b4a74a01c721?w=800&auto=format&fit=crop&q=80'
        ],
        category: catMap['activewear'],
        sizes: ['XS', 'S', 'M', 'L'],
        gender: 'Women',
        price: 68.0,
        discount: 20,
        stock: 40,
        isFeatured: true,
        isActive: true,
        rating: 4.9,
        numReviews: 95
      }
    ];

    const products = [];
    for (const item of productsData) {
      item.finalPrice = calculateFinalPrice(item.price, item.discount);
      const prod = await Product.create(item);
      products.push(prod);
    }

    console.log('[Seed] Seeding Sample Order...');
    const sampleProduct1 = products[0]; // Wool Overcoat
    const sampleProduct2 = products[6]; // AeroGlide Shoes

    const item1Final = calculateFinalPrice(sampleProduct1.price, sampleProduct1.discount);
    const item2Final = calculateFinalPrice(sampleProduct2.price, sampleProduct2.discount);

    const subtotal = sampleProduct1.price * 1 + sampleProduct2.price * 1;
    const discountAmount = (sampleProduct1.price - item1Final) + (sampleProduct2.price - item2Final);
    const itemsTotal = item1Final + item2Final;
    const shippingFee = 0; // Free shipping over 50
    const taxAmount = Math.round(itemsTotal * 0.05 * 100) / 100;
    const totalAmount = Math.round((itemsTotal + shippingFee + taxAmount) * 100) / 100;

    await Order.create({
      orderNumber: 'SHP-20261028-A4F9',
      userId: customerUser._id,
      items: [
        {
          productId: sampleProduct1._id,
          title: sampleProduct1.title,
          image: sampleProduct1.mainImg,
          price: sampleProduct1.price,
          discount: sampleProduct1.discount,
          finalPrice: item1Final,
          size: 'L',
          quantity: 1,
          lineTotal: item1Final
        },
        {
          productId: sampleProduct2._id,
          title: sampleProduct2.title,
          image: sampleProduct2.mainImg,
          price: sampleProduct2.price,
          discount: sampleProduct2.discount,
          finalPrice: item2Final,
          size: '10',
          quantity: 1,
          lineTotal: item2Final
        }
      ],
      shippingAddress: {
        fullName: 'Alex Johnson',
        phone: '+1 (555) 345-6789',
        street: '100 Ocean Drive, Apt 4B',
        city: 'Miami Beach',
        state: 'Florida',
        pincode: '33139'
      },
      paymentMethod: 'Cash on Delivery',
      paymentStatus: 'Pending',
      paymentDetails: {
        transactionId: 'TXN-COD-SAMPLE',
        gateway: 'Cash on Delivery'
      },
      subtotal,
      discountAmount,
      shippingFee,
      taxAmount,
      totalAmount,
      orderDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      status: 'Processing',
      trackingNumber: 'TRK-98234-USA'
    });

    console.log('=====================================================');
    console.log('  SHOPEZ DATABASE SEEDED SUCCESSFULLY!              ');
    console.log('=====================================================');
    console.log(`  Admin User:`);
    console.log(`    Email:    admin@shopez.com`);
    console.log(`    Password: Admin@shopez2026`);
    console.log(`  Customer User:`);
    console.log(`    Email:    alex@example.com`);
    console.log(`    Password: User@shopez2026`);
    console.log(`  Categories: ${categories.length}`);
    console.log(`  Products:   ${products.length}`);
    console.log('=====================================================');

    process.exit(0);
  } catch (err) {
    console.error('[Seed] Error seeding data:', err);
    process.exit(1);
  }
};

seedData();
