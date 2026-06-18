# Requirements Document

## 1. Application Overview

**Application Name:** King-David & Esther Wedding Invitation

**Description:** A one-page luxury wedding invitation website for King-David and Esther's wedding on Saturday, 22 August 2026 at Camp Young, Ede, Osun State, Nigeria. The site features interactive elements including animated curtain reveal, scratch card date reveal, RSVP form with capacity management, and comprehensive wedding information in a Formal Garden Elegance style.

## 2. Users and Usage Scenarios

**Target Users:** Wedding guests invited to King-David and Esther's wedding

**Core Usage Scenarios:**
- View wedding invitation and details
- Discover wedding date through interactive scratch card
- Learn about the couple's story
- Check dress code and gift information
- Submit RSVP with attendance confirmation
- Access venue directions via embedded map

## 3. Page Structure and Functional Description

### Page Structure
```
Single Page Wedding Invitation
├── Fixed Navigation Bar
├── Curtain Hero Section
├── Date Reveal / Scratch Card
├── Our Story
├── Pre-Wedding Gallery
├── Wedding Details
├── Dress Code
├── Gifts
├── Guest Notice
├── RSVP Form
└── Footer
```

### 3.1 Fixed Navigation Bar
- Display \"King David & Esther\" logo on the left side
- Display RSVP button on the right side
- Navigation bar remains fixed at top during scrolling
- RSVP button scrolls page to RSVP Form section when clicked

### 3.2 Curtain Hero Section
- Display two red velvet curtain panels covering the hero content initially
- Show \"Tap to Open\" button centered on curtains
- When user taps button, curtains animate open to reveal hero content
- Hero content includes:
  - Couple name \"King-David & Esther\" in script font (Great Vibes)
  - Tagline \"Formal Garden Elegance\"
  - Invitation text
  - Two CTA buttons: \"Your Invitation\" and \"Details\"
  - Live countdown timer displaying days, hours, minutes, seconds until Saturday, 22 August 2026 at 11:00 AM
  - Colour palette swatches showing: Sage (#737b54), Wine (#7b0014), Dusty Rose (#c89485), Terracotta (#c97658), Blush (#e9c0b6), Champagne (#eadfc9), Ivory (#fbf6ed)
- Display floating petal animations in background
- Countdown timer updates every second

### 3.3 Date Reveal / Scratch Card
- Display interactive scratch card element
- Card initially shows scratchable surface
- When user scratches or clicks the card, reveal text: \"Saturday, 22 August 2026 / Camp Young, Ede, Osun State\"
- Trigger ribbon burst confetti animation upon reveal

### 3.4 Our Story
- Display decorative arch/portrait element on left side
- Display story content on right side:
  - Heading: \"A love rooted in grace, friendship and promise.\"
  - Paragraph describing faith, laughter, and family

### 3.5 Pre-Wedding Gallery
- Display 3 placeholder cards in a row:
  - Card 1: \"Garden Walk\" with \"Coming soon\" label
  - Card 2: \"Soft Portrait\" with \"Coming soon\" label
  - Card 3: \"Evening Promise\" with \"Coming soon\" label
- Apply hover effects to cards

### 3.6 Wedding Details
- Apply dark moss/green background
- Display 3 information cards:
  - Date card
  - Venue card
  - Reception card
- Display Order of Celebration schedule:
  - 11:00 AM ceremony
  - Reception follows
  - Evening dinner
- Embed Google Maps showing Camp Young, Ede location
- Provide \"Open Directions\" link to open full map

### 3.7 Dress Code
- Display \"Formal Garden Elegance\" heading with floral frame decoration
- Display Ladies section:
  - Long or midi dresses
  - Fascinators welcome
- Display Gentlemen section:
  - Suits/blazers or formal shirt with trousers
- Display colour palette: Sage (#737b54), Wine (#7b0014), Dusty Rose (#c89485), Terracotta (#c97658), Blush (#e9c0b6), Champagne (#eadfc9), Ivory (#fbf6ed)

### 3.8 Gifts
- Apply dark moss background
- Display text: \"Your presence is our greatest gift\"
- Display two bank account cards:
  - Card 1: King-David Duruihuoma / Guaranty Trust Bank / 0012782278
  - Card 2: Blessing Timehin / Access Bank / 0733934621
- Display floating petal animations in background

### 3.9 Guest Notice
- Display adults-only notice in bordered card
- Include info icon

### 3.10 RSVP Form
- Left side content:
  - Heading: \"Kindly reserve your place\"
  - Capacity note: \"100 guests maximum\"
- Right side form fields:
  - Full Name (text input, required)
  - Email (email input, required)
  - WhatsApp Number (text input, required)
  - Number Attending (number selector 1-10, required)
  - Attendance (dropdown with options: \"Joyfully attending\" / \"Regretfully unable to attend\", required)
  - Message (textarea, optional)
  - Submit button
- When user submits form:
  - Validate all required fields are filled
  - Check if email already exists in database
  - Check if total guest count would exceed 100
  - If validation passes, save RSVP data to backend
  - Display success animation
- When capacity reaches 100 guests:
  - Replace form with closed message
  - Prevent new RSVP submissions

### 3.11 Footer
- Display couple name in script font
- Display date: Saturday, 22 August 2026
- Display venue: Camp Young, Ede, Osun State
- Display text: \"Made with love\"

## 4. Business Rules and Logic

### 4.1 RSVP Capacity Management
- Maximum total guest capacity: 100 guests
- Track cumulative \"Number Attending\" from all submitted RSVPs
- When total reaches 100, close RSVP form and display capacity reached message
- Prevent duplicate submissions from same email address

### 4.2 Countdown Timer Logic
- Target date and time: Saturday, 22 August 2026 at 11:00 AM
- Calculate remaining time from current time to target time
- Display format: X days, Y hours, Z minutes, W seconds
- Update display every second
- When target time is reached, display \"The celebration has begun\" or similar message

### 4.3 Curtain Animation
- Curtains remain closed on initial page load
- User must tap \"Tap to Open\" button to trigger opening animation
- Curtains open once per session (do not close again after opening)

### 4.4 Scratch Card Reveal
- Date information hidden until user interacts with scratch card
- Confetti animation triggers only once upon first reveal
- Revealed content remains visible after interaction

### 4.5 Data Storage
- Store RSVP submissions in backend database with fields: Full Name, Email, WhatsApp Number, Number Attending, Attendance status, Message, Submission timestamp
- Backend enforces capacity limit and duplicate email prevention

## 5. Exceptions and Edge Cases

| Scenario | Handling |
|----------|----------|
| User submits RSVP with duplicate email | Display error message: \"This email has already been registered\" |
| RSVP submission would exceed 100 guest capacity | Display error message: \"We're sorry, capacity has been reached\" |
| User submits form with missing required fields | Display validation error for each missing field |
| User enters invalid email format | Display error: \"Please enter a valid email address\" |
| User selects 0 or negative number for Number Attending | Prevent selection, enforce minimum value of 1 |
| Countdown timer reaches zero | Display message indicating celebration has begun |
| Google Maps fails to load | Display fallback text with venue address and manual directions link |
| Backend connection fails during RSVP submission | Display error message: \"Unable to submit RSVP, please try again\" |
| User attempts to scratch card on touch device | Support both click and touch/drag interactions |
| Curtain animation interrupted | Allow animation to complete before enabling further interactions |

## 6. Acceptance Criteria

1. User opens the wedding invitation website and sees closed red velvet curtains with \"Tap to Open\" button
2. User taps the button, curtains animate open revealing hero section with couple name, countdown timer, and colour palette
3. User scrolls down and interacts with scratch card to reveal wedding date and venue, triggering confetti animation
4. User continues scrolling through Our Story, Pre-Wedding Gallery, Wedding Details sections and views embedded Google Maps
5. User reviews Dress Code section with colour palette and attire guidelines
6. User views Gifts section with two bank account details
7. User reads Guest Notice about adults-only policy
8. User fills out RSVP form with all required fields (Full Name, Email, WhatsApp Number, Number Attending, Attendance status) and submits successfully, seeing success animation

## 7. Out of Scope for This Release

- Photo upload functionality for Pre-Wedding Gallery
- Guest login or authentication system
- Email notifications to couple when RSVP is submitted
- SMS reminders to guests
- Gift registry integration
- Guest list management dashboard for couple
- Multi-language support
- Social media sharing buttons
- Guest comments or guestbook feature
- Dietary restrictions or special requirements fields in RSVP
- Accommodation recommendations section
- Transportation information section
- Wedding party/bridal party profiles
- Live streaming information
- Post-wedding photo gallery
- Thank you message section
- RSVP editing or cancellation after submission
- Printable invitation version
- Calendar event download (.ics file)
- WhatsApp or email invitation forwarding