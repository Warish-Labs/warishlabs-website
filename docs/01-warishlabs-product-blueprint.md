# WarishLabs — Product Blueprint & Business Workflow
**Version 2.0 — Enhanced**

---

## Vision

WarishLabs is not a portfolio.

WarishLabs is a software company platform — the central operating hub for every product, tool, SaaS application, API, mobile application, open-source project, and future startup built under the WarishLabs brand.

The objective is to build one scalable ecosystem rather than many disconnected websites. WarishLabs should grow for years without requiring architectural redesign. Visitors should perceive it as a real software company, not a student project.

---

## Mission

Build high-quality software products that solve real-world problems while maintaining a single, consistent, and professional ecosystem. Every product strengthens the WarishLabs brand. Every visitor is an opportunity to build trust.

---

## Core Philosophy

**Everything is a Product.**

The website exists to showcase products, educate visitors, collect internal analytics, and grow the WarishLabs ecosystem. Content is fully dynamic — nothing visible to visitors is hardcoded. Every element is managed through the Admin Panel.

The platform itself is one of the most important products WarishLabs will ever build.

---

## Target Audience

| Segment | Goal |
|---|---|
| Students | Discover tools, tutorials, open source |
| Developers | Explore engineering quality, contribute |
| Businesses | Evaluate products and services |
| Startups | Find tools and potential collaboration |
| Recruiters | Assess skill depth and production standards |
| Open Source Contributors | Discover repositories and documentation |
| Potential Clients | Review work quality and initiate contact |

---

## Brand Identity

WarishLabs represents:

- Innovation and modern engineering
- Clean, minimal, premium design
- Performance and scalability
- Professionalism and trust
- Long-term product thinking

The brand should feel like an established software company, even if it begins as a solo operation.

---

## Website Structure

```
Public Website
├── Home
├── Products
│   └── [Category] → [Product]
├── Categories
├── Labs
├── Open Source
├── Blog
├── About
├── Contact
├── Search
└── Footer

Private (Admin Only)
└── Admin Dashboard
    ├── Dashboard Overview
    ├── Homepage Builder
    ├── Products Manager
    ├── Categories Manager
    ├── Technologies Manager
    ├── Blog CMS
    ├── Labs Manager
    ├── Open Source Manager
    ├── Media Library
    ├── Messages Inbox
    ├── Newsletter Manager
    ├── FAQs Manager
    ├── Navigation Builder
    ├── Footer Builder
    ├── SEO Manager
    ├── Analytics Dashboard
    ├── Visitor Tracker
    ├── Activity Logs
    ├── Site Settings
    └── System Configuration
```

---

## Domain Strategy

| Domain | Purpose |
|---|---|
| `warishlabs.in` | Primary hub — all products live here |
| `tools.warishlabs.in` | Developer tools subdomain |
| `festoryx.warishlabs.in` | Festoryx SaaS platform |
| `cartnest.warishlabs.in` | CartNest e-commerce app |
| `blueblog.warishlabs.in` | BlueBlog publishing platform |
| `resume.warishlabs.in` | Resume builder tool |
| `api.warishlabs.in` | Public API products |

Every future product receives a dedicated subdomain. The main website acts as the central discovery hub. Subdomains are managed through Admin Panel, not hardcoded.

---

## Visitor Journey

```
Visitor Arrives
    ↓
Homepage — first impression
    ↓
Browses Products or Categories
    ↓
Opens a Product Detail Page
    ↓
Clicks "Visit Live Product"
    ↓
Returns to WarishLabs
    ↓
Reads Blog Articles
    ↓
Subscribes to Newsletter
    ↓
Submits Contact Form
    ↓
Becomes Returning Visitor
```

Every step is tracked via the internal analytics engine.

---

## Homepage Sections (CMS-Controlled)

Each section is independently enabled, disabled, and reordered from the Admin Panel.

```
Navigation Bar
    ↓
Hero Section
    ↓
Featured Product Spotlight
    ↓
Product Categories Grid
    ↓
Latest Products Feed
    ↓
Featured Products Highlight
    ↓
Statistics Counter
    ↓
Why WarishLabs Section
    ↓
Open Source Showcase
    ↓
Latest Blog Posts
    ↓
FAQ Section
    ↓
Newsletter Subscription
    ↓
Contact CTA
    ↓
Footer
```

**Admin Controls per Section:**
- Enabled / Disabled toggle
- Display order (drag-to-reorder)
- Title override
- Visibility scheduling (future)

---

## Products

Every creation under the WarishLabs brand is a **Product**.

### Product Types

- Developer Tools
- AI Applications
- Utilities and Web Apps
- SaaS Platforms
- APIs
- Templates
- Mobile Applications
- Open Source Projects
- Browser Extensions
- Experiments and Labs

### Product Data Model

```
Product
├── Identity
│   ├── name
│   ├── slug
│   ├── tagline
│   ├── description (rich text)
│   └── version
│
├── Branding
│   ├── logo (Cloudinary URL)
│   ├── banner (Cloudinary URL)
│   ├── gallery[] (Cloudinary URLs)
│   └── color_accent
│
├── Classification
│   ├── category_id
│   ├── tags[]
│   ├── status (idea | planning | building | beta | live | maintenance | deprecated | archived)
│   └── type (tool | saas | api | mobile | os | template | experiment)
│
├── Links
│   ├── live_url
│   ├── subdomain
│   ├── repository_url (optional)
│   └── documentation_url (optional)
│
├── Technologies
│   └── technology_ids[]
│
├── SEO
│   ├── meta_title
│   ├── meta_description
│   ├── og_image (Cloudinary URL)
│   └── keywords[]
│
├── Analytics
│   ├── total_views
│   ├── total_clicks
│   └── total_visits
│
├── Config
│   ├── featured (boolean)
│   ├── show_on_homepage (boolean)
│   ├── sections_enabled{}
│   └── display_order
│
└── Timestamps
    ├── created_at
    ├── updated_at
    └── published_at
```

---

## Product Lifecycle

```
Idea
  ↓
Planning
  ↓
Building
  ↓
Private Testing
  ↓
Public Beta
  ↓
Live
  ↓
Maintenance
  ↓
Deprecated
  ↓
Archived
```

- Lifecycle state is visible inside the Admin Panel
- Visitors see only user-appropriate public statuses (e.g., "Live", "Beta", "Coming Soon")
- Status changes are logged in the Activity Log

---

## Product Page Layout

Each product follows a consistent page structure. Admin can enable or disable individual sections per product.

```
Product Hero (name, tagline, status badge, live link)
    ↓
Overview (description, key highlights)
    ↓
Features Grid
    ↓
Gallery / Screenshots
    ↓
Technology Stack Badges
    ↓
FAQ (product-specific)
    ↓
Related Products
    ↓
Visit Product CTA
    ↓
Contact / Feedback
```

---

## Categories

Products are organized into categories. Each category is a first-class entity.

### Category Types

| Category | Example Products |
|---|---|
| Developer Tools | CLI tools, code generators |
| AI Applications | AI assistants, automation tools |
| Utilities | Productivity apps, converters |
| Education | Learning platforms, quiz apps |
| Web Applications | Full-stack apps, dashboards |
| SaaS Platforms | Subscription-based software |
| Productivity | Task managers, note apps |
| Open Source | Community-driven projects |
| Templates | Starter kits, UI libraries |
| Browser Extensions | Chrome/Firefox tools |
| APIs | Public and private APIs |
| Mobile Apps | Android/iOS applications |
| Experiments | Prototypes, proof of concepts |

### Category Data Model

```
Category
├── name
├── slug
├── description
├── banner (Cloudinary URL)
├── icon (Cloudinary URL)
├── seo{}
├── product_count
├── visibility
├── display_order
└── timestamps
```

---

## Labs

Labs is a dedicated section for experimental work.

**Purpose:**
- Research and innovation
- Hackathon projects
- Proof of concepts
- Early-stage product ideas
- Technical experiments

Labs communicates transparency and engineering curiosity. Items in Labs may graduate into full Products.

---

## Open Source

Selected projects are showcased in a dedicated Open Source section, separate from the main Products area.

**Each Open Source entry includes:**
- Project name and description
- Problem it solves
- Technology stack
- GitHub repository link (optional)
- Documentation link
- License type
- Stars / forks (fetched from GitHub API or manually updated)

Open Source reflects engineering quality and community contribution, not just portfolio items.

---

## Blog

The blog serves as a content engine for the WarishLabs ecosystem.

**Purpose:**
- Share engineering knowledge
- Improve organic SEO
- Explain product decisions
- Teach technology
- Announce product launches

**Blog Categories:**

| Category | Content |
|---|---|
| Development | Code tutorials, engineering lessons |
| AI | AI tools, experiments, research |
| Engineering | Architecture, system design |
| Case Studies | How products were built |
| Announcements | Product launches, updates |
| Tutorials | Step-by-step technical guides |
| Behind the Scenes | Product decisions, process |

Blogs are written using the Tiptap rich text editor and are fully CMS-managed.

---

## Search System

Global search covers all public content.

**Indexed Entities:**
- Products (name, description, tags)
- Blog posts (title, excerpt, content)
- Categories (name, description)
- Labs entries
- FAQ questions

**Requirements:**
- Fast response (under 200ms target)
- Typo-tolerant matching
- Ranked results by relevance
- Keyboard navigable results panel
- Search analytics tracked internally

---

## Contact Workflow

```
Visitor fills Contact Form
    ↓
Submission validated (Zod)
    ↓
Stored in database
    ↓
Admin notification sent (Resend)
    ↓
Message appears in Admin Dashboard Inbox
    ↓
Admin manages message status:
    ├── Unread
    ├── Read
    ├── Archived
    ├── Spam
    └── Deleted
```

Published business email also listed on Contact page for direct reach.

---

## Newsletter Workflow

```
Visitor enters email
    ↓
Email validated
    ↓
Stored with status: Subscribed
    ↓
Welcome confirmation sent (Resend)
    ↓
Subscriber list updated in Admin Dashboard
    ↓
Admin can export subscribers
    ↓
Future campaigns sent from Admin Panel
```

Newsletter becomes a long-term communication and product announcement channel.

---

## FAQ System

FAQs are fully dynamic.

- Questions and answers managed via Admin Panel
- Questions can belong to global or product-specific categories
- Display order is configurable via drag-to-reorder
- Visibility toggle per question
- Searchable from the global search

---

## Analytics Engine

WarishLabs maintains its own internal analytics engine alongside Google Analytics and Microsoft Clarity.

**Tracked Dimensions:**

| Dimension | Details |
|---|---|
| Visitors | Unique, returning, anonymous |
| Sessions | Start, end, duration, pages |
| Pages | URL, referrer, time-on-page |
| Geography | Country, state, city (IP-based) |
| Devices | Desktop, tablet, mobile |
| Browsers | Chrome, Firefox, Safari, etc. |
| OS | Windows, Mac, Linux, Android, iOS |
| Traffic Sources | Direct, organic, referral, social |
| Products | Views, clicks, live visits |
| Categories | Opens, clicks |
| Search | Queries, results clicked |
| Newsletter | Subscriptions, unsubscribes |
| Contact | Submissions |
| Downloads | File downloads |

---

## Event Tracking System

Every important user interaction is tracked as a named event.

```
PAGE_VIEW            — Any page opened
PRODUCT_OPEN         — Product detail page opened
PRODUCT_VISIT        — "Visit Live" button clicked
CATEGORY_OPEN        — Category page opened
BUTTON_CLICK         — Any tracked button clicked
SEARCH               — Search query submitted
NEWSLETTER_SUBSCRIBE — Newsletter form submitted
CONTACT_SUBMIT       — Contact form submitted
SCROLL_25            — Scrolled 25% of page
SCROLL_50            — Scrolled 50% of page
SCROLL_75            — Scrolled 75% of page
SCROLL_100           — Scrolled 100% of page
DOWNLOAD             — File downloaded
COPY                 — Code or text copied
EXTERNAL_LINK        — External link opened
ERROR_404            — 404 page hit
LOGIN                — Admin login
LOGOUT               — Admin logout
```

Events are extensible. New events can be added without schema redesign.

---

## Media Workflow (Cloudinary)

### Folder Structure

All media is organized using Cloudinary's folder-based structure. Only Cloudinary URLs are stored in the database.

```
warishlabs/
├── products/
│   ├── {product-slug}/
│   │   ├── logo/
│   │   ├── banner/
│   │   ├── gallery/
│   │   └── og/
│
├── categories/
│   ├── {category-slug}/
│   │   ├── banner/
│   │   └── icon/
│
├── blogs/
│   ├── {blog-slug}/
│   │   ├── cover/
│   │   └── content/
│
├── labs/
│   └── {lab-slug}/
│       └── media/
│
├── open-source/
│   └── {project-slug}/
│       └── media/
│
├── site/
│   ├── logo/
│   ├── favicon/
│   ├── og/
│   └── announcements/
│
└── misc/
    └── uploads/
```

**Workflow:**
```
Admin uploads file
    ↓
File stored in Cloudinary under correct folder
    ↓
Cloudinary returns public URL
    ↓
URL stored in database (media_library table)
    ↓
URL referenced across website
    ↓
Admin can replace or delete from Media Library
```

**Rules:**
- Never store raw files in the application server
- Always organize by entity type and slug
- Alt text is required for all uploads
- Metadata (size, format, dimensions) stored in database

---

## Navigation Workflow

```
Admin opens Navigation Builder
    ↓
Creates or edits Menu Item
    ├── Label
    ├── URL
    ├── Position (header / footer)
    ├── Parent (for dropdowns)
    ├── Display order
    ├── Visibility
    └── Icon (optional)
    ↓
Saves
    ↓
Navbar and Footer update automatically
```

No code changes required for navigation updates.

---

## SEO Workflow

Every public page has independently managed SEO.

```
Page exists (Product / Blog / Category / Lab / Static)
    ↓
Admin configures SEO:
    ├── Meta Title
    ├── Meta Description
    ├── Keywords
    ├── Open Graph Image (Cloudinary URL)
    ├── Twitter Card
    ├── Canonical URL
    ├── Slug
    ├── Robots directive
    └── Schema.org JSON-LD
    ↓
Next.js generateMetadata() reads from database
    ↓
Sitemap auto-generated from database
    ↓
Search engine crawls updated sitemap
```

---

## Admin Dashboard Modules

| Module | Responsibility |
|---|---|
| Dashboard | Overview metrics, quick stats, recent activity |
| Homepage Builder | Drag-to-reorder sections, configure content |
| Products | Create, edit, publish, archive products |
| Categories | Manage product categories |
| Technologies | Manage technology entities used across products |
| Blog CMS | Write, publish, schedule blog posts |
| Labs | Manage experimental entries |
| Open Source | Manage open source project listings |
| Media Library | Upload, organize, replace, delete media |
| Messages | Inbox for contact form submissions |
| Newsletter | Manage subscribers, export list |
| FAQs | Manage questions and categories |
| Navigation | Build navbar and footer menus |
| SEO | Manage metadata per page |
| Analytics | Internal analytics dashboard |
| Visitors | Real-time and historical visitor data |
| Activity Logs | Full audit trail of admin actions |
| Site Settings | Global configuration |
| System | Health checks, environment, maintenance mode |

---

## Analytics Dashboard Views

- Overview (total visitors, sessions, page views)
- Visitor Trends (daily / weekly / monthly charts)
- Top Products (by views and live visits)
- Top Categories
- Traffic Sources (direct, organic, referral, social)
- Geographic Distribution (countries, cities)
- Device Breakdown
- Browser and OS Statistics
- Popular Searches
- Contact Request Volume
- Newsletter Growth Chart
- Real-Time Visitors (live count)
- Custom Date Range Filters
- Export to CSV

---

## Site Settings

Everything centralized, nothing hardcoded.

| Setting | Examples |
|---|---|
| Brand | Name, tagline, description, logo, favicon |
| Colors | Primary accent, background, text |
| Social Links | GitHub, Twitter/X, LinkedIn |
| Email Config | Business email, SMTP, Resend API key |
| Analytics Keys | Google Analytics ID, Clarity ID |
| Maintenance Mode | Toggle with custom message |
| Announcement Bar | Enable, message, CTA, color |
| Custom Scripts | Inject head/body scripts |
| SEO Defaults | Global fallback metadata |

---

## Business Growth Strategy

- Every new idea becomes a Product inside WarishLabs
- Every Product cross-links to related Products
- Cross-linking increases session depth and brand awareness
- The Blog drives organic traffic to Products
- Newsletter converts visitors into long-term audience
- Open Source builds developer trust and community
- Analytics informs what to build next

The platform evolves from a showcase into a complete software ecosystem.

---

## Success Metrics

| Metric | Description |
|---|---|
| Product Count | Growing number of live products |
| Visitor Retention | Returning visitor percentage |
| Newsletter Subscribers | Growing email list |
| Session Depth | Pages per session |
| Product Engagement | Clicks and live visits per product |
| Search Traffic | Organic keyword rankings |
| Brand Recognition | Direct traffic, brand searches |
| Engineering Quality | Code standards, test coverage, uptime |

---

## Long-Term Vision

WarishLabs should eventually feel less like a personal website and more like the official home of an established software company. Visitors should naturally assume there is a team behind it.

The platform should scale from one product to hundreds without redesigning the system, replacing the technology stack, or changing the user experience.

Every future application becomes another product inside the WarishLabs ecosystem. Adding a new product should require only opening the Admin Panel — never touching code.

The platform itself should be regarded as one of the strongest products WarishLabs ever ships.
