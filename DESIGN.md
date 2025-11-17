# 🎨 Design System

## Color Palette

### Primary Colors
- **Baby Pink**: `#FFB6C1` - Main brand color, buttons, highlights
- **Baby Blue**: `#B0D4F1` - Secondary accents, info messages
- **Baby Yellow**: `#FFF9C4` - Warnings, highlights
- **Baby Lavender**: `#E6E6FA` - Backgrounds, cards
- **Baby Mint**: `#C7EFCF` - Success messages, positive actions
- **Baby Peach**: `#FFD4B2` - Accents, warm highlights

### Neutral Colors
- **White**: `#FFFFFF` - Card backgrounds, main content
- **Cream**: `#FFF8F0` - Page backgrounds
- **Light Gray**: `#F5F5F5` - Subtle backgrounds
- **Gray**: `#9E9E9E` - Secondary text, icons
- **Dark Gray**: `#616161` - Tertiary elements
- **Text Dark**: `#424242` - Main text color

## Typography

### Font Families
- **Headings**: Fredoka (300, 400, 500, 600, 700)
- **Body**: Quicksand (300, 400, 500, 600, 700)

### Font Sizes
- **h1**: 2.5rem (40px)
- **h2**: 2rem (32px)
- **h3**: 1.5rem (24px)
- **h4**: 1.25rem (20px)
- **body**: 1rem (16px)
- **small**: 0.875rem (14px)
- **tiny**: 0.75rem (12px)

## Spacing System

- **xs**: 0.25rem (4px)
- **sm**: 0.5rem (8px)
- **md**: 1rem (16px)
- **lg**: 1.5rem (24px)
- **xl**: 2rem (32px)
- **xxl**: 3rem (48px)

## Border Radius

- **sm**: 8px - Small elements, inputs
- **md**: 12px - Buttons, cards
- **lg**: 16px - Large cards
- **xl**: 24px - Special elements
- **full**: 50% - Circles, avatars

## Shadows

```css
--shadow-sm: 0 2px 4px rgba(255, 182, 193, 0.1);
--shadow-md: 0 4px 8px rgba(255, 182, 193, 0.15);
--shadow-lg: 0 8px 16px rgba(255, 182, 193, 0.2);
--shadow-xl: 0 12px 24px rgba(255, 182, 193, 0.25);
```

## Component Styling Guide

### Buttons
- Primary: Pink gradient with white text
- Secondary: Mint gradient with dark text
- Outline: Transparent with pink border
- Always include hover effects (transform, shadow)

### Cards
- White background
- 12px border radius
- Medium shadow
- Hover: Increase shadow, slight lift

### Forms
- 2px pink border
- 12px border radius
- Focus: Pink border with soft glow
- Full width by default

### Avatars
- Circular (50% border radius)
- 3px pink border
- Sizes: sm (30px), default (40px), lg (60px), xl (80px)

### Badges
- Pill-shaped (full border radius)
- Small padding (4px 16px)
- Uppercase text
- Font weight 600

## Animations

### Float
```css
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}
```

### Pulse
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
```

### Usage
- Use for playful elements (logo icon)
- 3s duration for subtle effect
- ease-in-out timing function

## Responsive Breakpoints

- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Adjustments
- Hide secondary navigation
- Stack grid layouts to single column
- Reduce font sizes
- Simplify header

## Accessibility

- Minimum contrast ratio: 4.5:1
- Focus indicators on all interactive elements
- Semantic HTML structure
- ARIA labels where needed
- Keyboard navigation support

## Icon Usage

Use emoji icons for friendly, approachable feel:
- 👶 Baby/Main icon
- 💬 Discussions
- ❤️ Likes/Love
- 🔔 Notifications
- ✉️ Messages
- ⚙️ Settings
- 👤 User profile
- 🌟 Featured/Special
- 📌 Pinned
- 🔒 Locked

## Best Practices

1. **Consistency**: Use design system variables
2. **Whitespace**: Don't crowd elements
3. **Hierarchy**: Clear visual hierarchy with size and color
4. **Feedback**: Always show user interaction feedback
5. **Playful but Professional**: Balance cute theme with usability
6. **Mobile First**: Design for mobile, enhance for desktop
7. **Performance**: Optimize images and animations
8. **Accessibility**: Always consider all users

## Example Component

```css
.custom-card {
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-md);
  margin-bottom: var(--spacing-lg);
  transition: all 0.3s ease;
}

.custom-card:hover {
  box-shadow: var(--shadow-lg);
  transform: translateY(-2px);
}
```

## Theme Extension

To create a dark theme, override these variables:
```css
:root[data-theme="dark"] {
  --white: #1a1a1a;
  --cream: #242424;
  --text-dark: #e0e0e0;
  --baby-pink: #c27c86;
  /* ... other overrides */
}
```

---

This design system ensures consistency across the entire application while maintaining the warm, friendly, baby-themed aesthetic! 🎨👶
