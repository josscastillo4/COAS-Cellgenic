# Cellgenic Document Manager (CDM)

## Vision

Cellgenic Document Manager is an internal platform that allows the Marketing team to manage product documents without accessing WordPress.

The system replaces the current manual workflow between Marketing and IT.

---

# Current Problem

Today the workflow is:

Marketing
↓

Sends PDF to IT
↓

IT uploads PDF to WordPress
↓

IT creates or edits a page
↓

IT sends the URL back
↓

Marketing prints the QR

Problems:

- IT is a bottleneck.
- URLs can contain mistakes.
- WordPress stores hundreds of PDFs.
- WP Engine bandwidth keeps increasing.
- No version history.
- No activity log.
- No centralized document management.

---

# Goal

Marketing should be able to:

- Upload documents
- Replace documents
- Search documents
- Copy public URLs
- View document history
- Manage WordPress links

Without accessing WordPress.

---

# Main Modules

## Dashboard

Overview and statistics.

---

## Documents

Core module.

Manage:

- COA
- MSDS
- IFU
- Brochure
- Package Insert

---

## Products

Manage products.

Each product can have multiple documents.

---

## Storage

Cloudflare R2

Shows:

- Total files
- Storage used
- Latest uploads

---

## Users

User management.

---

## Settings

General configuration.

---

# Initial Database

Products

- id
- name
- sku
- status

Documents

- id
- product_id
- title
- type
- version
- language
- storage_url
- wordpress_slug
- public_url
- status
- updated_at

Users

Activity

Settings

---

# Integrations

Future:

- WordPress REST API
- Cloudflare R2
- Supabase

---

# Development Roadmap

Sprint 1
✔ Dashboard

Sprint 2
Documents

Sprint 3
Upload PDFs

Sprint 4
Supabase

Sprint 5
Cloudflare R2

Sprint 6
WordPress Integration

---

# Important Rule

Never break existing WordPress public URLs.

Existing QR codes must continue working.

The system should update documents without changing public links.