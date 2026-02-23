# UI Design System & Aesthetics

BamboChat features a premium, modern design system built from scratch using **Vanilla CSS**. This document outlines the core design principles, layout architecture, and aesthetic choices.

---

## 1. Design Principles

*   **Floating Card Aesthetic**: Main components (Sidebar, Chat Window, Detail Pane) are treated as elevated "cards" over a muted canvas background for better visual separation and depth.
*   **Rounded Geometry**: Extensive use of large border radii (`12px` to `24px`) provides a friendly, modern, and high-end feel similar to top-tier social platforms.
*   **Glassmorphism**: Subtle use of backdrop blurs and semi-transparent backgrounds (`rgba`) for overlays and modals.
*   **Micro-interactions**: Fluid transitions, hover effects on buttons, and slide-in/slide-out animations for panels like the Detail Pane.

---

## 2. Layout Architecture

The application uses a **Flexible Grid/Flexbox** layout divided into three main zones:

1.  **Sidebar**: Left-aligned panel for navigation and conversation list.
2.  **Chat Window**: Central primary interaction zone.
3.  **Detail Pane**: Responsive right-aligned drawer for additional context (Profile, Search, Members).

### Spacing & Gaps
A consistent **Gap System** (currently `10px` padding on the main container) ensures that cards never touch the edges or each other directly, emphasizing the "floating" nature of the design.

---

## 3. Component Styling

### Typography
The system uses **Inter** (via Google Fonts) for its clean, professional, and highly readable geometric sans-serif properties.

### Color Palette (Premium Theme)
*   **Bambo Green**: `#059669` (Primary Brand Color)
*   **Text Primary**: `#0f172a` (Deep Slate)
*   **Background Canvas**: `#e9eef3` (Soft Blue-Gray for Light Mode)
*   **Dark Mode Support**: Context-aware color overrides (`.dark` class) using CSS Variables.

---

## 4. Custom Modals (`ConfirmModal`)

Direct browser `confirm()` dialogs have been replaced with a custom-built modal system featuring:
*   **Contextual Icons**: Danger (Red/Warning) vs Information (Green/Success).
*   **Loading States**: Integrated spinners within buttons for asynchronous actions (e.g., kicking a member).
*   **Overlay Blurs**: High-contrast overlays that focus the user's attention.
