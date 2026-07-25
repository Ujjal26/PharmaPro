---
name: PharmaPro Clinical Inventory System
colors:
  surface: '#f9f9ff'
  surface-dim: '#d9d9e2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3fc'
  surface-container: '#ededf6'
  surface-container-high: '#e7e8f0'
  surface-container-highest: '#e1e2ea'
  on-surface: '#191c21'
  on-surface-variant: '#424752'
  inverse-surface: '#2e3037'
  inverse-on-surface: '#f0f0f9'
  outline: '#727784'
  outline-variant: '#c2c6d4'
  surface-tint: '#115cb9'
  primary: '#003f87'
  on-primary: '#ffffff'
  primary-container: '#0056b3'
  on-primary-container: '#bbd0ff'
  inverse-primary: '#acc7ff'
  secondary: '#006a61'
  on-secondary: '#ffffff'
  secondary-container: '#86f2e4'
  on-secondary-container: '#006f66'
  tertiary: '#722b00'
  on-tertiary: '#ffffff'
  tertiary-container: '#983c00'
  on-tertiary-container: '#ffc2a7'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#d7e2ff'
  primary-fixed-dim: '#acc7ff'
  on-primary-fixed: '#001a40'
  on-primary-fixed-variant: '#004491'
  secondary-fixed: '#89f5e7'
  secondary-fixed-dim: '#6bd8cb'
  on-secondary-fixed: '#00201d'
  on-secondary-fixed-variant: '#005049'
  tertiary-fixed: '#ffdbcc'
  tertiary-fixed-dim: '#ffb694'
  on-tertiary-fixed: '#351000'
  on-tertiary-fixed-variant: '#7b2f00'
  background: '#f9f9ff'
  on-background: '#191c21'
  surface-variant: '#e1e2ea'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-caps:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  data-mono:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '450'
    lineHeight: 20px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  unit: 4px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
---

## Brand & Style
The design system centers on **Precision, Security, and Efficiency**. Given the high-stakes nature of pharmaceutical management, the UI prioritizes clarity over decoration. The aesthetic follows a **Modern Corporate** approach—utilizing a structured grid, ample whitespace to reduce cognitive load during data entry, and a subtle tactile quality through soft shadows. The emotional response should be one of absolute reliability and professional calm, ensuring users feel in control of critical inventory data.

## Colors
The palette is anchored by **Medical Blue (#0056B3)**, a color that communicates authority and trust. A secondary **Teal (#0D9488)** is used for secondary actions and subtle accents to provide a modern clinical feel. 

The system relies heavily on a high-contrast functional palette:
- **Critical (Red):** Reserved strictly for expired stock or system errors.
- **Warning (Amber):** Used for low stock levels or near-expiry items.
- **Success (Green):** Indicates healthy stock levels and completed transactions.
- **Neutrals:** A range of cool grays (Slate) provides the structural framework, using a light background (#F8FAFC) to maintain a sterile, clean environment.

## Typography
This design system utilizes **Inter** for all primary interface elements due to its exceptional legibility in data-dense environments. For SKU numbers, batch codes, and quantities, **JetBrains Mono** is introduced to ensure character distinction (e.g., distinguishing '0' from 'O') which is vital for pharmaceutical safety. 

- **Headlines:** Bold and tight-set to define clear section boundaries.
- **Body:** Standardized at 14px for the primary dashboard experience to balance information density with readability.
- **Data Mono:** Used specifically for technical identifiers and tabular figures to ensure vertical alignment in columns.

## Layout & Spacing
The system employs a **12-column fluid grid** for dashboard views, transitioning to a focused single-column layout for modal forms and mobile views. 

- **Spacing Scale:** A strict 4px base unit (4, 8, 12, 16, 24, 32, 48, 64) ensures mathematical harmony.
- **Data Density:** Dashboard tables utilize "Compact" (8px vertical padding) and "Comfortable" (16px vertical padding) modes to accommodate different user preferences.
- **Sidebars:** A fixed 260px navigation sidebar provides constant access to top-level modules (Inventory, Dispensing, Reports, Settings).

## Elevation & Depth
Depth is used functionally to indicate interactivity and information hierarchy. 
- **Surface Level (Level 0):** The main background using the neutral base color.
- **Card Level (Level 1):** White backgrounds with a 1px border (#E2E8F0) and a very soft, diffused shadow (Y: 2px, Blur: 4px, 2% Opacity Black).
- **Overlay Level (Level 2):** Modals and dropdowns use a more pronounced shadow (Y: 8px, Blur: 16px, 8% Opacity Black) to separate the action from the underlying data.
- **Interactive States:** Buttons and cards lift slightly on hover (Y: 4px, Blur: 8px) to provide tactile feedback.

## Shapes
The design system adopts a **Soft (0.25rem)** roundedness profile. This level of rounding softens the industrial nature of a pharmaceutical tool without appearing overly casual or "bubbly." 
- **Standard UI (Buttons, Inputs, Cards):** 4px (0.25rem) radius.
- **Large Containers (Modals):** 8px (0.5rem) radius.
- **Status Pills:** Fully rounded (pill-shaped) to distinguish them from interactive buttons.

## Components
- **App Shell & Navigation:** A fixed 260px sidebar anchors the primary modules (**Inventory, Dispensing, Reports, Settings**) and keeps location context visible at all times. The top app bar includes global actions and search.
- **Global Search Bar:** A prominent command-style search field in the top bar supports quick lookup of SKUs, batches, and medicines, with a keyboard shortcut hint (e.g., `Ctrl + K` / `Cmd + K`) for high-throughput workflows.
- **Buttons:** Primary actions use solid Medical Blue with white text. Secondary actions use an outlined or ghost treatment with a 1px border and clear hover elevation feedback.
- **Input Fields & Form Groups:** Text fields, selectors, and quantity inputs use a 1px neutral border, visible persistent labels (non-floating), inline helper/error text, and a Primary Blue focus ring for rapid and safe data entry.
- **Data Tables:** The operational core for inventory and dispensing records. Tables include sticky headers using `label-caps`, sortable columns, row hover state (`#F1F5F9`), and compact/comfortable density modes for different workload preferences.
- **Status Chips:** Compact chips represent stock and lifecycle states (e.g., **In Stock**, **Low**, **Near Expiry**, **Expired**) using tinted backgrounds (about 10% fill) and high-contrast text in the matching semantic color.
- **Inventory Summary Cards:** High-priority overview cards for key KPIs and alerts (critical low stock, near-expiry counts, expiring batches). Each card includes a top-edge visual indicator bar mapped to status severity.
- **Modal & Overlay Components:** Confirmation dialogs, adjustment forms, and detail drawers appear on elevated overlay surfaces (Level 2) with clear action hierarchy to reduce accidental critical actions.
- **Notification & Alert Banners:** Inline and toast notifications communicate transaction outcomes, warnings, and blocking errors with strict semantic color usage and concise, action-oriented language.