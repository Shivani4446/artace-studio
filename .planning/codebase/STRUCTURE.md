# Directory Structure

## Root Level

E:\ARTACE-STUDIOS\artace-studio\artace-studio\
- package.json (30 lines) - Dependencies and scripts
- tsconfig.json - TypeScript configuration
- next.config.* - Next.js configuration
- tailwind.config.* - Tailwind CSS 4 configuration
- eslint.config.mjs - ESLint configuration
- .env.local - Environment variables
- .env.example - Environment template
- .gitignore - Git exclusions
- README.md - Project documentation

## App Directory (app/)

Next.js 16 App Router structure with 60+ route files.

### Route Groups

| Path | Description |
|------|-------------|
| app/(home)/ | Homepage route group |
| app/shop/ | Shop catalog and products |
| app/blogs/ | Blog archive and posts |
| app/collections/ | Collection pages |
| app/dashboard/ | User dashboard |
| app/checkout/ | Checkout and success |
| app/account/ | Account pages |
| app/api/ | API routes |

### Pages (39 files)

| Page | File | Lines |
|------|------|-------|
| Homepage | (home)/page.tsx | 130 |
| Shop Catalog | shop/page.tsx | - |
| Product Detail | shop/[slug]/page.tsx | 826 |
| Collections | collections/[slug]/page.tsx | - |
| Blog Archive | blogs/page.tsx | - |
| Single Blog | blogs/[slug]/page.tsx | - |
| Cart | cart/page.tsx | - |
| Checkout | checkout/page.tsx | - |
| Checkout Success | checkout/success/page.tsx | - |
| Wishlist | wishlist/page.tsx | - |
| Search | search/page.tsx | - |
| Custom Order | custom-order/page.tsx | - |
| Corporate Bulk | corporate-bulk-orders/page.tsx | - |
| Contact | contact-us/page.tsx | - |
| Login | login/page.tsx | - |
| Signup | signup/page.tsx | - |
| Forgot Password | forgot-password/page.tsx | - |
| Reset Password | reset-password/page.tsx | - |
| Dashboard | dashboard/page.tsx | - |
| Dashboard Orders | dashboard/orders/page.tsx | - |
| Dashboard Profile | dashboard/profile/page.tsx | - |
| Dashboard Details | dashboard/details/page.tsx | - |
| About Us | about-us/page.tsx | - |
| Team | team/page.tsx | - |
| Exhibition | exhibition/page.tsx | - |
| Privacy Policy | privacy-policy/page.tsx | - |
| Terms of Use | terms-of-use/page.tsx | - |
| Return Policy | return-policy/page.tsx | - |
| Cancellation | cancellation-policy/page.tsx | - |

### API Routes (20 files)

| Endpoint | File |
|----------|------|
| Auth - Login | api/auth/login/route.ts |
| Auth - Register | api/auth/register/route.ts |
| Auth - Session | api/auth/session/route.ts |
| Auth - Logout | api/auth/logout/route.ts |
| Auth - Forgot Password | api/auth/forgot-password/route.ts |
| Auth - Reset Password | api/auth/reset-password/route.ts |
| Checkout | api/checkout/route.ts |
| Checkout - Verify | api/checkout/verify/route.ts |
| Checkout - Status | api/checkout/status/route.ts |
| Checkout - Coupon | api/checkout/coupon/route.ts |
| Razorpay Webhook | api/razorpay/webhook/route.ts |
| Products | api/store/products/route.ts |
| Blogs | api/blogs/route.ts |
| Search | api/search/route.ts |
| Custom Order | api/custom-order/route.ts |
| Corporate Leads | api/corporate-leads/route.ts |
| Contact | api/contact/route.ts |
| Upload Image | api/upload-image/route.ts |
| Orders | api/orders/route.ts |
| Account Profile | api/account/profile/route.ts |

### Layout Files

- app/layout.tsx (130 lines) - Root layout with providers
- app/dashboard/layout.tsx - Dashboard layout
- app/globals.css - Global styles
- app/robots.ts - Robots.txt
- app/sitemap.ts - Sitemap

### Support Files

- app/fonts/ - Custom fonts (Sentient)
- app/favicon.ico - Favicon

## Components Directory (components/)

~55 React component files organized by feature domain.

### Homepage (9 files)

| Component | File |
|-----------|------|
| Hero Section | homepage/HeroSection.tsx |
| Best Sellers | homepage/ShopBestSellers.tsx |
| Discover Essentials | homepage/DiscoverEssentials.tsx |
| True Artistry | homepage/TrueArtistrySection.tsx |
| Shop by Artist | homepage/ShopByArtist.tsx |
| Testimonials | homepage/Testimonials.tsx |
| Promotional Banner | homepage/PromotionalBanner.tsx |
| Journal Section | homepage/JournalSection.tsx |
| Artist Invitation | homepage/ArtistInvitation.tsx |

### Shop (2 files)

| Component | File |
|-----------|------|
| Shop Catalog | shop/ShopCatalog.tsx |
| Single Product | singleproduct/SingleProduct.tsx |

### Blog (5 files)

| Component | File |
|-----------|------|
| Blog Content | blog/BlogContentWithProducts.tsx |
| Archive Catalog | blogarchive/BlogArchiveCatalog.tsx |
| Archive Page Client | blogarchive/BlogArchivePageClient.tsx |
| Archive Hero | blogarchive/Hero.tsx |
| Archive Sections | blogarchive/Thirdsection.tsx, Secondsection.tsx |

### Single Blog (4 files)

| Component | File |
|-----------|------|
| Blog Content | singleblog/SingleBlogContent.tsx |
| Blog Hero | singleblog/SingleBlogHero.tsx |
| Blog Author | singleblog/SingleBlogAuthor.tsx |
| Related Posts | singleblog/SingleBlogRelated.tsx |

### Cart (3 files)

| Component | File |
|-----------|------|
| Cart Provider | cart/CartProvider.tsx (183 lines) |
| Add to Cart Button | cart/AddToCartButton.tsx |

### Wishlist (1 file)

| Component | File |
|-----------|------|
| Wishlist Provider | wishlist/WishlistProvider.tsx |

### Auth (7 files)

| Component | File |
|-----------|------|
| Session Provider | auth/AuthSessionProvider.tsx (104 lines) |
| Login Form | auth/LoginForm.tsx |
| Login Page Shell | auth/LoginPageShell.tsx |
| Signup Form | auth/SignupForm.tsx |
| Signup Page Shell | auth/SignupPageShell.tsx |
| Forgot Password | auth/ForgotPasswordForm.tsx |
| Reset Password | auth/ResetPasswordForm.tsx, ResetPasswordPageShell.tsx |
| Logout Button | auth/LogoutButton.tsx |

### Account / Dashboard (7 files)

| Component | File |
|-----------|------|
| Dashboard Shell | account/DashboardShell.tsx |
| Dashboard Overview | account/DashboardOverview.tsx |
| Dashboard Orders | account/DashboardOrders.tsx |
| Dashboard Profile | account/DashboardProfile.tsx |
| Dashboard Details | account/DashboardDetails.tsx |
| Account Details Form | account/AccountDetailsForm.tsx |

### Custom Order (2 files)

| Component | File |
|-----------|------|
| Custom Order Form | custom-order/CustomOrderForm.tsx |
| Image Upload | custom-order/ImageUpload.tsx |

### Corporate (2 files)

| Component | File |
|-----------|------|
| Lead Form | corporate/CorporateLeadForm.tsx |
| Bulk Ordering Process | corporate/BulkOrderingProcess.tsx |

### Collections (3 files)

| Component | File |
|-----------|------|
| Collection Landing | collections/CollectionLandingPage.tsx |
| Editorial Loop | collections/CollectionEditorialLoop.tsx |

### About (6 files)

| Component | File |
|-----------|------|
| About Hero | About/Abouthero.tsx |
| Who Are We | About/AboutusWhoarewe.tsx |
| Second Section | About/AboutusSecondsection.tsx |
| Legacy | About/Legacy.tsx |
| Our Commitment | About/OurCommitment.tsx |
| Why Us | About/Whyus.tsx |

### Article (2 files)

| Component | File |
|-----------|------|
| Article Layout | article/ArticleLayout.tsx |
| TOC Highlighter | article/ArticleTocHighlighter.tsx |

### UI Components (3 files)

| Component | File |
|-----------|------|
| Custom Dropdown | ui/CustomDropdown.tsx |
| Promotion Modal | ui/PromotionModal.tsx |
| Protected Image | ui/ProtectedImage.tsx |

### Global Components

| Component | File |
|-----------|------|
| Navbar | navbar.tsx (1200+ lines) |
| Footer | footer.tsx |

## Utils Directory (utils/)

Business logic and service modules (~12 files).

| File | Lines | Purpose |
|------|-------|---------|
| auth.ts | 308 | WordPress JWT authentication |
| razorpay.ts | 200 | Payment gateway integration |
| woocommerce-checkout.ts | 333 | WooCommerce order management |
| wordpress-blog.ts | 247 | WordPress blog integration |
| gtm.ts | 182 | Google Tag Manager tracking |
| jwt.ts | - | JWT token handling |
| wordpress-auth.ts | - | WP authentication helpers |
| checkout-client.ts | - | Client-side checkout utilities |
| woocommerce-orders.ts | - | Order fetching |
| collections.ts | 84 | Collection data and utilities |
| text.ts | - | Text processing utilities |

## Lib Directory (lib/)

Shared services (1 file).

| File | Lines | Purpose |
|------|-------|---------|
| search.ts | 202 | Unified search service |

## Supabase Directory (supabase/)

| File | Description |
|------|-------------|
| custom_orders.sql | Database schema for custom orders |

## Public Directory (public/)

Static assets:
- Images (webp, svg)
- Fonts
- Icons

## Planning Directory (.planning/codebase/)

Documentation files generated from codebase analysis:

| File | Description |
|------|-------------|
| ARCHITECTURE.md | Application architecture patterns |
| STRUCTURE.md | Directory structure documentation |
| STACK.md | Tech stack overview |
| TESTING.md | Testing approach |
| CONVENTIONS.md | Code conventions |

## Summary Statistics

- Total route pages: 39
- API routes: 20
- Component files: ~55
- Utility modules: 12
- Total lines (key files): ~3000+

## Key Observations

1. Modular component organization by feature domain
2. Heavy use of server components for data fetching
3. Client state managed via React Context
4. Edge runtime for all API routes
5. Integration-heavy (WooCommerce, WordPress, Razorpay, Supabase)
6. No formal test suite (linting only)