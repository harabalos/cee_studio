#!/usr/bin/env python3
"""
Generate a comprehensive Greek-language system documentation PDF
for the CEE Studio booking platform.

Output: docs/CEE_Studio_System_Guide.pdf
"""

import os
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.units import cm
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    KeepTogether, ListFlowable, ListItem, HRFlowable
)

# --- Font setup -----------------------------------------------------
# macOS Arial supports Greek glyphs
pdfmetrics.registerFont(TTFont("Body", "/System/Library/Fonts/Supplemental/Arial.ttf"))
pdfmetrics.registerFont(TTFont("Body-Bold", "/System/Library/Fonts/Supplemental/Arial Bold.ttf"))
pdfmetrics.registerFont(TTFont("Body-Italic", "/System/Library/Fonts/Supplemental/Arial Italic.ttf"))

# --- Brand colors ---------------------------------------------------
BRAND = colors.HexColor("#661414")
CREAM = colors.HexColor("#FDFAF4")
ACCENT = colors.HexColor("#E6CDA3")
FG = colors.HexColor("#2A1A1A")
MUTED = colors.HexColor("#7A6A6A")
SOFT = colors.HexColor("#F5EFE6")

# --- Output path ----------------------------------------------------
OUT = os.path.join(os.path.dirname(__file__), "..", "docs", "CEE_Studio_System_Guide.pdf")
OUT = os.path.abspath(OUT)
os.makedirs(os.path.dirname(OUT), exist_ok=True)

# --- Styles ---------------------------------------------------------
styles = getSampleStyleSheet()
H1 = ParagraphStyle("H1", parent=styles["Heading1"], fontName="Body-Bold",
                    fontSize=28, textColor=BRAND, leading=34, spaceAfter=16, spaceBefore=8)
H2 = ParagraphStyle("H2", parent=styles["Heading2"], fontName="Body-Bold",
                    fontSize=18, textColor=BRAND, leading=24, spaceAfter=10, spaceBefore=20)
H3 = ParagraphStyle("H3", parent=styles["Heading3"], fontName="Body-Bold",
                    fontSize=14, textColor=FG, leading=18, spaceAfter=6, spaceBefore=14)
H4 = ParagraphStyle("H4", parent=styles["Heading4"], fontName="Body-Bold",
                    fontSize=11, textColor=BRAND, leading=14, spaceAfter=4, spaceBefore=10)
BODY = ParagraphStyle("Body", parent=styles["BodyText"], fontName="Body",
                      fontSize=10.5, textColor=FG, leading=15, spaceAfter=6, alignment=TA_JUSTIFY)
BODY_SM = ParagraphStyle("BodySm", parent=BODY, fontSize=9.5, leading=13, textColor=MUTED)
CALLOUT = ParagraphStyle("Callout", parent=BODY, fontSize=10, leading=14,
                          textColor=FG, leftIndent=12, rightIndent=12, spaceAfter=10,
                          spaceBefore=4, borderColor=ACCENT, borderWidth=0,
                          borderPadding=10, backColor=SOFT)
CODE = ParagraphStyle("Code", parent=BODY, fontName="Helvetica", fontSize=9,
                      textColor=BRAND, leading=12, leftIndent=10, rightIndent=10,
                      backColor=SOFT, borderColor=ACCENT, borderWidth=0,
                      borderPadding=6, spaceAfter=8)
TAG = ParagraphStyle("Tag", parent=BODY, fontSize=8, textColor=BRAND,
                     spaceAfter=4, leading=10)
COVER_TITLE = ParagraphStyle("CoverTitle", parent=H1, fontSize=44, leading=52,
                              alignment=TA_CENTER, textColor=BRAND, spaceAfter=8)
COVER_SUB = ParagraphStyle("CoverSub", parent=BODY, fontSize=14, leading=20,
                            alignment=TA_CENTER, textColor=MUTED, fontName="Body-Italic")

story = []

# ============================================================
# COVER PAGE
# ============================================================
story.append(Spacer(1, 6 * cm))
story.append(Paragraph("CEE Studio", COVER_TITLE))
story.append(Paragraph("Πλήρης Οδηγός Συστήματος", COVER_SUB))
story.append(Spacer(1, 0.5 * cm))
story.append(HRFlowable(width="40%", thickness=0.7, color=ACCENT, hAlign="CENTER"))
story.append(Spacer(1, 0.5 * cm))
story.append(Paragraph("Booking · Memberships · Payments · Admin · Email",
                        ParagraphStyle("CoverMeta", parent=BODY, alignment=TA_CENTER,
                                       textColor=MUTED, fontSize=11, leading=16)))
story.append(Spacer(1, 6 * cm))
story.append(Paragraph("Έκδοση 1.0 · 2026", ParagraphStyle(
    "CoverDate", parent=BODY, alignment=TA_CENTER, textColor=MUTED, fontSize=10)))
story.append(Paragraph("Glattpark, Zürich", ParagraphStyle(
    "CoverLoc", parent=BODY, alignment=TA_CENTER, textColor=MUTED, fontSize=10)))
story.append(PageBreak())

# ============================================================
# TABLE OF CONTENTS
# ============================================================
story.append(Paragraph("Περιεχόμενα", H1))
story.append(Spacer(1, 0.2 * cm))

toc_items = [
    ("1.", "Επισκόπηση συστήματος", "Τεχνικά κομμάτια, ποιος μιλάει με ποιον"),
    ("2.", "Ρόλοι χρηστών", "Visitor · Customer · Member · Admin"),
    ("3.", "Flow A — Guest Booking", "Επισκέπτης κάνει booking χωρίς account"),
    ("4.", "Flow B — Member Booking (Full)", "Member με αρκετές ώρες, no Stripe"),
    ("5.", "Flow C — Member Booking (Partial)", "Member με λιγότερες ώρες, Stripe για overage"),
    ("6.", "Flow D — Member Booking + Extras", "Add-ons / late-night charged separately"),
    ("7.", "Flow E — Membership Signup", "Νέος member subscribes σε ABO"),
    ("8.", "Flow F — Cancellation", "Customer ή admin ακυρώνει + refund"),
    ("9.", "Admin operations", "Τι κάνει ο owner στο dashboard"),
    ("10.", "Email system", "Ποιος παίρνει ποιο email, πότε"),
    ("11.", "Automated jobs (Cron)", "Reminders, auto-complete, expiries"),
    ("12.", "Database tables", "Τι αποθηκεύεται και γιατί"),
    ("13.", "Deployment architecture", "Vercel, branches, env vars"),
    ("14.", "Καθημερινές λειτουργίες", "Daily checklist για τον owner"),
    ("15.", "Troubleshooting", "Συχνά προβλήματα + λύσεις"),
]
toc_data = [[num, title, desc] for num, title, desc in toc_items]
toc = Table(toc_data, colWidths=[1.2 * cm, 7 * cm, 8.5 * cm])
toc.setStyle(TableStyle([
    ("FONT", (0, 0), (-1, -1), "Body", 10),
    ("FONT", (1, 0), (1, -1), "Body-Bold", 10.5),
    ("TEXTCOLOR", (0, 0), (0, -1), BRAND),
    ("TEXTCOLOR", (1, 0), (1, -1), FG),
    ("TEXTCOLOR", (2, 0), (2, -1), MUTED),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 8),
]))
story.append(toc)
story.append(PageBreak())

# ============================================================
# 1. SYSTEM OVERVIEW
# ============================================================
story.append(Paragraph("1. Επισκόπηση Συστήματος", H1))

story.append(Paragraph("Τι είναι το CEE Studio σύστημα", H3))
story.append(Paragraph(
    "Είναι ένα custom-built booking platform για φωτογραφικό studio στη Ζυρίχη. "
    "Δεν χρησιμοποιεί κάποια έτοιμη πλατφόρμα (Calendly, Acuity κτλ) — όλο το flow είναι "
    "δικός σας κώδικας πάνω σε modern stack. Αυτό σου δίνει πλήρη έλεγχο, χωρίς monthly "
    "subscription fees, και την δυνατότητα να φτιάχνεις δικιά σου λογική (ABO memberships "
    "με ωρομέτρηση, partial coverage, B2B invoicing κ.λπ.).", BODY))

story.append(Paragraph("Τα 5 βασικά συστατικά", H3))
parts = [
    ("<b>Next.js (Frontend + API)</b>",
     "Το website + όλη η backend λογική σε ένα project. Hosted στο Vercel. "
     "Όταν κάνεις git push → αυτόματα γίνεται deploy."),
    ("<b>Supabase (Database + Auth)</b>",
     "Η database όπου ζουν τα bookings, members, settings. Επίσης διαχειρίζεται "
     "τα magic-link logins (no passwords). Cloud-hosted."),
    ("<b>Stripe (Payments)</b>",
     "Όλες οι πληρωμές + subscriptions. Όταν κάποιος πληρώνει, ο Stripe στέλνει "
     "ένα webhook event στο σύστημα μας → εμείς δημιουργούμε το booking."),
    ("<b>Resend (Emails)</b>",
     "Στέλνει όλα τα transactional emails (confirmations, cancellations, reminders) "
     "από το <b>bookings@ceestudio.ch</b> (DNS verified)."),
    ("<b>Vercel Cron Jobs</b>",
     "Αυτόματα tasks που τρέχουν καθημερινά: 24h reminders, auto-complete past bookings, "
     "expire pending holds κ.λπ. Δεν χρειάζεται να κάνεις τίποτα — τρέχουν μόνα τους."),
]
for label, desc in parts:
    story.append(Paragraph(f"{label}<br/><font color='#7A6A6A' size='10'>{desc}</font>", BODY))
    story.append(Spacer(1, 4))

story.append(Paragraph("Πώς συνδέονται όλα μαζί", H3))
story.append(Paragraph(
    "Όταν κάποιος κάνει booking στο site:<br/>"
    "<b>1.</b> Το <b>Next.js</b> δείχνει το 6-step wizard και συλλέγει τα στοιχεία.<br/>"
    "<b>2.</b> Στο step 6, ένα API call δημιουργεί ένα temporary <i>hold</i> στο <b>Supabase</b>.<br/>"
    "<b>3.</b> Ο user redirect-άρεται στο <b>Stripe Checkout</b> για να πληρώσει.<br/>"
    "<b>4.</b> Όταν πληρώσει, ο <b>Stripe</b> στέλνει webhook event στο σύστημά μας.<br/>"
    "<b>5.</b> Το webhook handler δημιουργεί το booking στη βάση και διαγράφει το hold.<br/>"
    "<b>6.</b> Το <b>Resend</b> στέλνει confirmation email στον customer + στον admin.<br/>"
    "<b>7.</b> Ο user βλέπει την success page με το booking.", BODY))

story.append(Spacer(1, 6))
story.append(Paragraph(
    "<b>💡 Ποιος κάνει τι:</b> Το <i>frontend</i> (αυτό που βλέπει ο user) δείχνει UI. "
    "Το <i>backend</i> (κώδικας στο Vercel) επιβεβαιώνει τα πάντα, γράφει στη βάση, "
    "στέλνει emails. Ο Stripe είναι η μόνη πηγή αλήθειας για τα payments — "
    "ποτέ δεν εμπιστευόμαστε το frontend για χρήματα.", CALLOUT))

story.append(PageBreak())

# ============================================================
# 2. USER ROLES
# ============================================================
story.append(Paragraph("2. Ρόλοι Χρηστών", H1))

story.append(Paragraph(
    "Υπάρχουν 4 ρόλοι. Ο κάθε χρήστης ξεκινάει ως 'Visitor' και μπορεί να ανέβει "
    "ρόλο μέσα από τις διάφορες ενέργειες.", BODY))

story.append(Paragraph("Visitor (χωρίς account)", H3))
story.append(Paragraph(
    "Επισκέπτης που δεν έχει κάνει login. Μπορεί να:<br/>"
    "• Βλέπει όλο το public site<br/>"
    "• Κάνει booking σαν guest (πληρώνει με κάρτα/TWINT)<br/>"
    "• Διαχειρίζεται το booking του μέσω <i>manage_token</i> link από το email<br/>"
    "• Δεν βλέπει historico bookings — μόνο αυτό που μόλις έκανε", BODY))

story.append(Paragraph("Customer (logged in, NOT member)", H3))
story.append(Paragraph(
    "Έχει κάνει sign-in με magic link, αλλά δεν έχει ABO subscription. Επιπλέον:<br/>"
    "• Βλέπει ΟΛΑ τα παλιά bookings του στο <b>/account</b><br/>"
    "• Profile editing (name, phone, preferred language)<br/>"
    "• Όλα τα bookings auto-link σε αυτόν όταν χρησιμοποιεί το ίδιο email", BODY))

story.append(Paragraph("Member (logged in + active ABO)", H3))
story.append(Paragraph(
    "Customer που έκανε <b>subscribe</b> σε ένα από τα 3 plans (Starter / Pro / Unlimited). "
    "Έχει monthly hours balance. Επιπλέον:<br/>"
    "• Μπορεί να κλείνει με <b>hours</b> από το plan (no Stripe charge)<br/>"
    "• Αν δεν φτάνουν, παίρνει overage rate <b>CHF 50/ώρα</b><br/>"
    "• Βλέπει Membership card με balance, renewal date, hours rolled over<br/>"
    "• Πρόσβαση στο <b>Stripe Customer Portal</b> για subscription management", BODY))

story.append(Paragraph("Admin (συγκεκριμένο email)", H3))
story.append(Paragraph(
    "Λίστα στο env var <code>ADMIN_ALLOWED_EMAILS</code>. Επιπλέον:<br/>"
    "• <b>/admin</b> dashboard με statistics και today's bookings<br/>"
    "• <b>/admin/bookings</b> — όλα τα bookings, refunds, edits<br/>"
    "• <b>/admin/manual</b> — manual booking για phone/walk-in clients<br/>"
    "• <b>/admin/settings</b> — door code, WiFi, prices, B2B emails<br/>"
    "• <b>/admin/blocked</b> — block dates (vacation, maintenance)<br/>"
    "• iCal feed για owner's calendar app (Apple/Google Calendar sync)", BODY))

story.append(Paragraph(
    "<b>🔐 Πώς γίνεται κάποιος admin:</b> Προσθέτεις το email στη μεταβλητή "
    "<code>ADMIN_ALLOWED_EMAILS</code> στο <b>Vercel</b> (comma-separated για πολλούς). "
    "Δεν χρειάζεται κώδικα — μετά την επόμενη ανανέωση session, αυτό το email βλέπει το /admin.", CALLOUT))

story.append(PageBreak())

# ============================================================
# 3. FLOW A — GUEST BOOKING
# ============================================================
story.append(Paragraph("3. Flow A — Guest Booking", H1))
story.append(Paragraph("Επισκέπτης χωρίς account κλείνει studio (πληρώνει με κάρτα/TWINT)", BODY_SM))

story.append(Paragraph("Βήμα-βήμα", H3))
steps = [
    ("Step 1 — Visitor μπαίνει στο <b>/booking</b>",
     "Βλέπει 6-step wizard. Επιλέγει duration (1h/2h/3h/4h/8h)."),
    ("Step 2 — Date picker",
     "Calendar UI. Βλέπει διαθέσιμες μέρες (weekends ΕΠΙΤΡΕΠΟΝΤΑΙ αλλά δεν επιτρέπεται cancel)."),
    ("Step 3 — Time picker",
     "Το API <code>/api/availability</code> τσεκάρει τη βάση και δείχνει μόνο "
     "ώρες που δεν συγκρούονται με υπάρχοντα bookings + pending holds + blocked dates."),
    ("Step 4 — Add-ons",
     "Optional: Lighting (CHF 20), Backdrops (CHF 30), Podcast Setup (CHF 40)."),
    ("Step 5 — Contact details",
     "Name, email, phone, company, shoot type. Επιλογή γλώσσας για confirmation email."),
    ("Step 6 — Summary + Pay",
     "Δείχνει breakdown της τιμής (base + addons + late-night surcharge αν ώρες ≥20:00). "
     "Click <b>PAY & BOOK</b>."),
]
for i, (title, desc) in enumerate(steps, 1):
    story.append(Paragraph(f"<font color='#661414' size='10'><b>{i}.</b></font> {title}", BODY))
    story.append(Paragraph(f"<font color='#7A6A6A'>{desc}</font>", BODY_SM))
    story.append(Spacer(1, 2))

story.append(Paragraph("Τι γίνεται στο backend όταν πατήσει 'PAY & BOOK'", H3))
story.append(Paragraph(
    "<b>1.</b> Δημιουργείται <i>pending_hold</i> στη βάση (κρατάει το slot για 30 λεπτά).<br/>"
    "<b>2.</b> Δημιουργείται <b>Stripe Checkout Session</b> με το ποσό + customer email.<br/>"
    "<b>3.</b> User redirect-άρεται στο Stripe site (hosted by Stripe, secure).<br/>"
    "<b>4.</b> Δίνει στοιχεία κάρτας ή TWINT. Πληρώνει.<br/>"
    "<b>5.</b> Stripe redirect στο <b>/booking/success?session_id=...</b><br/>"
    "<b>6.</b> Παράλληλα, Stripe στέλνει <i>webhook event</i> στο <code>/api/webhooks/stripe</code>.<br/>"
    "<b>7.</b> Το webhook handler:<br/>"
    "  &nbsp;&nbsp;a. Επιβεβαιώνει το payment<br/>"
    "  &nbsp;&nbsp;b. Διαβάζει το pending_hold<br/>"
    "  &nbsp;&nbsp;c. Δημιουργεί <b>booking row</b> στη βάση (status=confirmed, paid)<br/>"
    "  &nbsp;&nbsp;d. Διαγράφει το pending_hold (slot is now permanently booked)<br/>"
    "  &nbsp;&nbsp;e. Auto-link σε user record αν υπάρχει με ίδιο email<br/>"
    "  &nbsp;&nbsp;f. Στέλνει <b>confirmation email</b> στον customer (με .ics calendar)<br/>"
    "  &nbsp;&nbsp;g. Στέλνει <b>owner notification email</b> στο admin", BODY))

story.append(Paragraph("Τι βλέπει ο customer", H3))
story.append(Paragraph(
    "<b>Στο /booking/success</b> (~1-3 δευτερόλεπτα μετά το πληρωμή):<br/>"
    "• Big checkmark + 'Booking confirmed'<br/>"
    "• Summary card: ημερομηνία, διάρκεια, total<br/>"
    "• 2 buttons: 'Manage booking' (πάει στο /booking/manage/[token]) + 'Get Directions'<br/>"
    "• Card 'Create your account — no password needed' με 'Sign in' CTA<br/>"
    "  (μόνο αν δεν είναι ήδη logged in — βελτιώνει conversion σε επόμενο booking)", BODY))

story.append(Paragraph("Τι emails στέλνονται", H3))
email_data = [
    ["Email", "Παραλήπτης", "Περιεχόμενο"],
    ["BookingConfirmationCustomer", "Customer email", "Branded confirmation, .ics, manage link, door code, Sign-in CTA"],
    ["BookingConfirmationOwner", "ADMIN_ALLOWED_EMAILS", "Στοιχεία customer, ημερομηνία, ποσό, manage link"],
]
email_tbl = Table(email_data, colWidths=[5.5 * cm, 4 * cm, 7 * cm])
email_tbl.setStyle(TableStyle([
    ("FONT", (0, 0), (-1, 0), "Body-Bold", 9.5),
    ("FONT", (0, 1), (-1, -1), "Body", 9),
    ("BACKGROUND", (0, 0), (-1, 0), BRAND),
    ("TEXTCOLOR", (0, 0), (-1, 0), CREAM),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ("TOPPADDING", (0, 0), (-1, -1), 6),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [CREAM, SOFT]),
    ("LINEBELOW", (0, 0), (-1, -1), 0.3, ACCENT),
]))
story.append(email_tbl)

story.append(Spacer(1, 6))
story.append(Paragraph(
    "<b>⚠️ Αν το stripe-cli δεν τρέχει σε local testing:</b> Το webhook ΔΕΝ φτάνει στο "
    "localhost, οπότε δεν δημιουργείται booking. Σε production αυτό δεν συμβαίνει — "
    "ο Stripe στέλνει direct στο deployed Vercel URL. Στο local πρέπει να τρέχεις: "
    "<code>stripe listen --forward-to localhost:3000/api/webhooks/stripe</code>", CALLOUT))

story.append(PageBreak())

# ============================================================
# 4. FLOW B — MEMBER BOOKING (FULL)
# ============================================================
story.append(Paragraph("4. Flow B — Member Booking (Full Coverage)", H1))
story.append(Paragraph("Member έχει αρκετές ώρες — πληρώνει 0, no Stripe", BODY_SM))

story.append(Paragraph("Προϋποθέσεις", H3))
story.append(Paragraph(
    "• Member έχει active ABO (Starter/Pro/Unlimited)<br/>"
    "• Hours balance ≥ duration του booking<br/>"
    "• Δεν επιλέγει add-ons<br/>"
    "• Δεν πέφτει σε late-night ώρες (≥20:00)", BODY))

story.append(Paragraph("Flow", H3))
story.append(Paragraph(
    "<b>1.</b> Member κάνει login → πάει <b>/account</b> ή <b>/booking</b>.<br/>"
    "<b>2.</b> Στο /booking, εμφανίζεται banner: 'MEMBER · STARTER · 4h available'.<br/>"
    "<b>3.</b> Επιλέγει duration (≤ balance), date, time. Δεν επιλέγει add-ons.<br/>"
    "<b>4.</b> Step 6 δείχνει 'Use hours' button preselected, sidebar Total = <b>CHF 0</b>.<br/>"
    "<b>5.</b> Click <b>PAY & BOOK</b>.<br/>"
    "<b>6.</b> POST <code>/api/me/booking</code> (authenticated request).<br/>"
    "<b>7.</b> Server:<br/>"
    "  &nbsp;&nbsp;a. Verify auth session<br/>"
    "  &nbsp;&nbsp;b. Verify membership exists + active<br/>"
    "  &nbsp;&nbsp;c. Verify balance ≥ duration<br/>"
    "  &nbsp;&nbsp;d. Verify slot available<br/>"
    "  &nbsp;&nbsp;e. <b>Direct insert</b> booking row (no Stripe!)<br/>"
    "  &nbsp;&nbsp;f. Αφαιρεί τις ώρες από το balance (4h → 2h)<br/>"
    "  &nbsp;&nbsp;g. Στέλνει confirmation emails<br/>"
    "<b>8.</b> Redirect στο <b>/booking/manage/[token]?member_booked=1</b>.", BODY))

story.append(Paragraph("Τι βλέπει ο member μετά", H3))
story.append(Paragraph(
    "Στο <b>/account</b> τη επόμενη επίσκεψη:<br/>"
    "• Membership banner: balance 4h → 2h<br/>"
    "• Upcoming bookings: το νέο booking φαίνεται με badge '2h from balance'", BODY))

story.append(PageBreak())

# ============================================================
# 5. FLOW C — MEMBER BOOKING (PARTIAL)
# ============================================================
story.append(Paragraph("5. Flow C — Member Booking (Partial Coverage)", H1))
story.append(Paragraph("Member έχει λιγότερες ώρες — πληρώνει μόνο τη διαφορά μέσω Stripe", BODY_SM))

story.append(Paragraph("Παράδειγμα", H3))
story.append(Paragraph(
    "Έχεις <b>2h</b> available στο plan, θες να κλείσεις <b>4h</b> booking.<br/>"
    "→ 2h καλύπτονται από το plan (FREE)<br/>"
    "→ 2h overage × CHF 50 = <b>CHF 100</b> (πληρώνεις με κάρτα)<br/>"
    "Αν έχεις και add-ons ή late-night, προστίθενται κανονικά.", BODY))

story.append(Paragraph("Πλήρης Τιμολογιακός Τύπος (partial)", H3))
story.append(Paragraph(
    "<b>chargedChf = (duration − balance) × CHF 50 + addons + late-night surcharge</b><br/>"
    "&nbsp;<br/>"
    "Παραδείγματα:<br/>"
    "• 2h balance, 4h booking, no extras → CHF 100<br/>"
    "• 2h balance, 4h booking, Podcast (CHF 40) → CHF 140<br/>"
    "• 2h balance, 4h at 19:00 (1h late-night), Podcast → CHF 150<br/>"
    "• 0 balance, 4h booking → fallback σε regular booking (CHF 250 full price)", BODY))

story.append(Paragraph("Flow", H3))
story.append(Paragraph(
    "<b>1.</b> Member /booking, banner δείχνει '2h available'.<br/>"
    "<b>2.</b> Επιλέγει 4h. Banner γίνεται: '✓ 2h from plan + CHF 100 for 2h extra'.<br/>"
    "<b>3.</b> Step 6 'Use hours' button label: '<b>2h + CHF 100</b>'. Sidebar Total: <b>CHF 100</b>.<br/>"
    "<b>4.</b> Click PAY & BOOK.<br/>"
    "<b>5.</b> POST <code>/api/me/booking</code>:<br/>"
    "  &nbsp;&nbsp;a. Δημιουργεί pending_hold <b>με member context</b><br/>"
    "  &nbsp;&nbsp;b. Δημιουργεί Stripe Checkout για CHF 100<br/>"
    "  &nbsp;&nbsp;c. Returns <code>{ url: 'stripe_checkout_url' }</code><br/>"
    "<b>6.</b> Frontend redirects στο Stripe.<br/>"
    "<b>7.</b> Member πληρώνει 100 CHF.<br/>"
    "<b>8.</b> Stripe webhook fires → finalize booking:<br/>"
    "  &nbsp;&nbsp;a. Inserts booking με <code>membership_id, hours_deducted=2</code><br/>"
    "  &nbsp;&nbsp;b. Αφαιρεί 2h από balance (2h → 0h)<br/>"
    "  &nbsp;&nbsp;c. Στέλνει emails<br/>"
    "<b>9.</b> Member βλέπει success page.", BODY))

story.append(Paragraph(
    "<b>💡 Γιατί χρειάζεται Stripe για το partial:</b> Επειδή χρειάζεται να πληρώσει "
    "ακριβές ποσό (overage + addons + late-night). Το direct member booking χωρίς Stripe "
    "ισχύει μόνο όταν total = CHF 0.", CALLOUT))

story.append(PageBreak())

# ============================================================
# 6. FLOW D — MEMBER + EXTRAS
# ============================================================
story.append(Paragraph("6. Flow D — Member Booking με Extras (Full Hours + Add-ons)", H1))
story.append(Paragraph("Member έχει αρκετές ώρες αλλά διαλέγει add-ons ή πέφτει late-night", BODY_SM))

story.append(Paragraph("Παράδειγμα", H3))
story.append(Paragraph(
    "Έχεις 4h balance, κλείνεις 2h booking + Podcast Setup (CHF 40).<br/>"
    "→ Studio rental: covered by plan (0)<br/>"
    "→ Podcast Setup: CHF 40 (χρεώνεται κανονικά)<br/>"
    "→ Total charged: <b>CHF 40</b><br/>"
    "→ Hours deducted: 2 (4h → 2h)", BODY))

story.append(Paragraph("Γιατί έχουμε αυτή τη λογική", H3))
story.append(Paragraph(
    "Τα <b>plan hours</b> καλύπτουν μόνο το <i>studio rental</i> (τη χρήση του χώρου). "
    "Τα add-ons (extra lighting, backdrops, podcast equipment) και η late-night surcharge "
    "είναι <i>extra services</i> και χρεώνονται κανονικά — όπως θα έπαιρνες κανονικά "
    "από οποιονδήποτε. Αυτό κρατάει το pricing model δίκαιο και predictable.", BODY))

story.append(Paragraph("Flow", H3))
story.append(Paragraph(
    "Ίδιο με Flow C (partial), αλλά:<br/>"
    "• Όταν δεν υπάρχει overage (balance ≥ duration), το base τμήμα είναι 0<br/>"
    "• Το Stripe Checkout δείχνει line items: 'Studio Rental (covered by plan) — CHF 0' + addons<br/>"
    "• Member πληρώνει μόνο τα add-ons / late-night<br/>"
    "• Webhook αφαιρεί τις ώρες (όπως στο Flow C)", BODY))

story.append(PageBreak())

# ============================================================
# 7. MEMBERSHIP SIGNUP
# ============================================================
story.append(Paragraph("7. Flow E — Membership Signup", H1))
story.append(Paragraph("Visitor / Customer γίνεται Member με ABO subscription", BODY_SM))

story.append(Paragraph("3 Plans", H3))
plan_data = [
    ["Plan", "Τιμή/μήνα", "Hours/μήνα", "Roll-over"],
    ["Starter", "CHF 220", "4h", "Up to 4h, expire in 60d"],
    ["Pro", "CHF 420", "8h + 1h bonus", "Up to 9h"],
    ["Unlimited", "CHF 780", "16h", "Up to 16h"],
]
plan_tbl = Table(plan_data, colWidths=[3.5 * cm, 3.5 * cm, 4 * cm, 5.5 * cm])
plan_tbl.setStyle(TableStyle([
    ("FONT", (0, 0), (-1, 0), "Body-Bold", 9.5),
    ("FONT", (0, 1), (-1, -1), "Body", 9),
    ("BACKGROUND", (0, 0), (-1, 0), BRAND),
    ("TEXTCOLOR", (0, 0), (-1, 0), CREAM),
    ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ("ALIGN", (1, 1), (2, -1), "CENTER"),
    ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ("TOPPADDING", (0, 0), (-1, -1), 6),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [CREAM, SOFT]),
]))
story.append(plan_tbl)

story.append(Paragraph("Signup flow", H3))
story.append(Paragraph(
    "<b>1.</b> Visitor πάει <b>/studio</b> → scroll στα ABO Memberships.<br/>"
    "<b>2.</b> Click 'Become a member →' στο επιθυμητό plan → <b>/membership/signup?plan=starter</b>.<br/>"
    "<b>3.</b> Form με email, name, phone, accept terms. Click 'Subscribe now'.<br/>"
    "<b>4.</b> POST <code>/api/membership/checkout</code>:<br/>"
    "  &nbsp;&nbsp;a. Δημιουργεί <b>Stripe Customer</b> (αν δεν υπάρχει)<br/>"
    "  &nbsp;&nbsp;b. Δημιουργεί Stripe Checkout (mode=<b>subscription</b>, όχι one-time)<br/>"
    "<b>5.</b> User πληρώνει την πρώτη δόση (CHF 220 για Starter).<br/>"
    "<b>6.</b> Stripe events:<br/>"
    "  &nbsp;&nbsp;a. <code>customer.subscription.created</code> → δημιουργεί users + memberships row<br/>"
    "  &nbsp;&nbsp;b. <code>invoice.paid</code> → επιβεβαιώνει payment<br/>"
    "<b>7.</b> Στέλνεται <b>MembershipWelcome</b> email <b>με magic link</b>.<br/>"
    "<b>8.</b> User click magic link → /account → βλέπει active membership.", BODY))

story.append(Paragraph("Επαναλαμβανόμενες χρεώσεις", H3))
story.append(Paragraph(
    "<b>Κάθε μήνα</b> ο Stripe χρεώνει αυτόματα την κάρτα:<br/>"
    "• <code>invoice.paid</code> webhook → ανανεώνει τις ώρες (+4h για Starter)<br/>"
    "• <code>MembershipRenewal</code> email στον member<br/>"
    "• Αν payment fails: <code>invoice.payment_failed</code> → email warning + grace period<br/>"
    "Roll-over: ώρες που δεν χρησιμοποιήθηκαν προστίθενται στον επόμενο μήνα "
    "(αλλά λήγουν σε 60 days για να μη συσσωρευτούν).", BODY))

story.append(Paragraph("Cancel subscription", H3))
story.append(Paragraph(
    "Ο member κάνει click 'Manage subscription' στο /account/membership → "
    "redirect στο Stripe Customer Portal (hosted by Stripe) → click 'Cancel plan'. "
    "Συνεχίζει active μέχρι το end of period, μετά αυτόματα cancelled.", BODY))

story.append(PageBreak())

# ============================================================
# 8. CANCELLATION FLOW
# ============================================================
story.append(Paragraph("8. Flow F — Cancellation", H1))
story.append(Paragraph("Customer ή admin ακυρώνει booking", BODY_SM))

story.append(Paragraph("Cancellation Policy", H3))
story.append(Paragraph(
    "Οι κανόνες ακύρωσης είναι ENCODED στο σύστημα και δεν χρειάζεται manual check:<br/>"
    "<b>• Weekday booking, >48h before</b>: ✅ Allowed, refund full minus Stripe fee (CHF 1.50)<br/>"
    "<b>• Weekday booking, <48h before</b>: ❌ Blocked<br/>"
    "<b>• Weekend booking (Sat/Sun)</b>: ❌ Blocked entirely<br/>"
    "<b>• Membership-hour booking</b>: Cancellation επιστρέφει τις ώρες στο balance", BODY))

story.append(Paragraph("Customer-initiated cancellation", H3))
story.append(Paragraph(
    "<b>1.</b> Customer ανοίγει <code>/booking/manage/[token]</code> (link από confirmation email).<br/>"
    "<b>2.</b> Βλέπει cancellation status:<br/>"
    "  &nbsp;&nbsp;• Πράσινο banner 'Cancellable · Refund CHF X' (αν επιτρέπεται)<br/>"
    "  &nbsp;&nbsp;• Κόκκινο banner '<48h' ή 'Weekend' (αν όχι)<br/>"
    "<b>3.</b> Click 'Cancel booking' → inline confirmation.<br/>"
    "<b>4.</b> POST <code>/api/booking/cancel/[token]</code>:<br/>"
    "  &nbsp;&nbsp;a. Verify token valid<br/>"
    "  &nbsp;&nbsp;b. Re-check policy server-side<br/>"
    "  &nbsp;&nbsp;c. Stripe refund (αν payment ήταν με κάρτα)<br/>"
    "  &nbsp;&nbsp;d. Update booking: status='cancelled', payment_status='refunded'<br/>"
    "  &nbsp;&nbsp;e. Αν member booking: επιστρέφει hours στο balance<br/>"
    "  &nbsp;&nbsp;f. Στέλνει <b>BookingCancellationCustomer</b> + <b>BookingCancellationOwner</b><br/>"
    "  &nbsp;&nbsp;g. Slot ξανά διαθέσιμο", BODY))

story.append(Paragraph("Admin-initiated cancellation (refund)", H3))
story.append(Paragraph(
    "Admin πάει /admin/bookings → click 'Refund' σε οποιοδήποτε paid booking. "
    "Bypass-άρει το cancellation policy (admin can refund anytime). Ίδια flow στο backend "
    "από εκεί και κάτω.", BODY))

story.append(PageBreak())

# ============================================================
# 9. ADMIN OPERATIONS
# ============================================================
story.append(Paragraph("9. Admin Operations", H1))
story.append(Paragraph("Τι κάνει η αδερφή σου στο dashboard καθημερινά", BODY_SM))

story.append(Paragraph("/admin (dashboard)", H3))
story.append(Paragraph(
    "Stats: Today's bookings, This week's revenue, This month's revenue, Next 7 days. "
    "Today's timeline visual (horizontal bar 08:00-22:00 με booking blocks).<br/>"
    "Recent activity table με τα 10 πιο πρόσφατα bookings (any status).", BODY))

story.append(Paragraph("/admin/bookings", H3))
story.append(Paragraph(
    "All bookings, filterable by date / status / payment method. Actions ανά booking:<br/>"
    "• <b>Edit</b> — αλλαγή customer name, email, phone, shoot type<br/>"
    "• <b>Refund</b> — Stripe refund (only paid bookings)<br/>"
    "• <b>Mark no-show</b> — αν δεν εμφανίστηκε ο customer<br/>"
    "• <b>Mark completed</b> — past booking κανονικά (auto-cron το κάνει)", BODY))

story.append(Paragraph("/admin/manual", H3))
story.append(Paragraph(
    "<b>Phone / walk-in bookings.</b> Για clients που τηλεφωνούν: ονοματεπώνυμο, "
    "ώρα, payment method (cash/prepaid/invoice). Optionally στέλνει email στον customer "
    "(toggle 'Send confirmation'). Δεν περνάει από Stripe — άρα όχι charge.", BODY))

story.append(Paragraph("/admin/settings", H3))
story.append(Paragraph(
    "Configurable runtime settings:<br/>"
    "• <b>Door code</b> — αυτό που στέλνεται στο confirmation email<br/>"
    "• <b>WiFi password</b><br/>"
    "• <b>Prices</b> — μπορείς να αλλάξεις τις τιμές χωρίς code deploy<br/>"
    "• <b>Late-night cutoff + surcharge</b><br/>"
    "• <b>B2B email whitelist</b> — emails που μπορούν να πληρώσουν με invoice", BODY))

story.append(Paragraph("/admin/blocked", H3))
story.append(Paragraph(
    "Block ολόκληρες ημέρες ή χρονικά διαστήματα (vacation, maintenance, private shoots). "
    "Αυτά τα slots δεν εμφανίζονται στο /booking calendar.", BODY))

story.append(Paragraph("iCal feed (για owner's calendar)", H3))
story.append(Paragraph(
    "Permanent subscription URL: <code>/api/calendar/owner.ics?token=...</code><br/>"
    "Άνοιγμα σε Apple Calendar (File → New Calendar Subscription) ή Google Calendar. "
    "Αυτόματη hourly refresh — όλα τα bookings φαίνονται στο προσωπικό ημερολόγιο της "
    "αδερφής σου χωρίς να μπει στο /admin κάθε μέρα.", BODY))

story.append(PageBreak())

# ============================================================
# 10. EMAIL SYSTEM
# ============================================================
story.append(Paragraph("10. Email System", H1))
story.append(Paragraph("9 templates · Όλα στα DE/EN/FR/IT · Resend με DNS verified", BODY_SM))

story.append(Paragraph("Sender", H3))
story.append(Paragraph(
    "Όλα τα emails στέλνονται από <b>bookings@ceestudio.ch</b> (DNS verified με "
    "SPF/DKIM/DMARC). Φτάνουν στο inbox, όχι spam. Όταν customer κάνει reply, "
    "πάει στο monitored inbox.", BODY))

story.append(Paragraph("Όλα τα emails", H3))
emails_data = [
    ["Template", "Παραλήπτης", "Πότε στέλνεται"],
    ["BookingConfirmationCustomer", "Customer", "Όταν booking confirmed (μετά payment)"],
    ["BookingConfirmationOwner", "Admin emails", "Όταν booking confirmed"],
    ["BookingCancellationCustomer", "Customer", "Όταν booking cancelled (any cause)"],
    ["BookingCancellationOwner", "Admin emails", "Όταν booking cancelled"],
    ["BookingReminder24h", "Customer", "24 ώρες πριν το shoot (cron)"],
    ["MembershipWelcome", "Νέος Member", "Όταν subscription created (με magic link)"],
    ["MembershipRenewal", "Member", "Κάθε μήνα όταν renewal succeed"],
    ["MembershipPaymentFailed", "Member", "Όταν monthly payment failed"],
    ["MembershipLowBalance", "Member", "Όταν balance < 2h (cron)"],
]
emails_tbl = Table(emails_data, colWidths=[6 * cm, 3.5 * cm, 7 * cm])
emails_tbl.setStyle(TableStyle([
    ("FONT", (0, 0), (-1, 0), "Body-Bold", 9),
    ("FONT", (0, 1), (-1, -1), "Body", 8.5),
    ("BACKGROUND", (0, 0), (-1, 0), BRAND),
    ("TEXTCOLOR", (0, 0), (-1, 0), CREAM),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ("TOPPADDING", (0, 0), (-1, -1), 5),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [CREAM, SOFT]),
]))
story.append(emails_tbl)

story.append(Paragraph("Πού πάει το owner notification email", H3))
story.append(Paragraph(
    "Στο env var <code>ADMIN_ALLOWED_EMAILS</code>. Default σε <b>babismetaxas000@gmail.com</b>. "
    "Όταν θέλει η αδερφή σου να παίρνει τα notifications στο δικό της inbox, αλλάζεις αυτό "
    "το var (Vercel project settings → Environment Variables) — π.χ. σε "
    "<code>info@ceestudio.ch,sister@example.com</code> (comma-separated για multiple).", BODY))

story.append(Paragraph(
    "<b>💡 Πώς να ελέγξεις αν στάλθηκε ένα email:</b> Resend dashboard "
    "(<i>resend.com/emails</i>) δείχνει όλα τα sent emails, με delivery status (delivered/"
    "bounced/complained). Επίσης η <b>email_log</b> table στο Supabase κρατάει log "
    "για internal debugging.", CALLOUT))

story.append(PageBreak())

# ============================================================
# 11. CRON JOBS
# ============================================================
story.append(Paragraph("11. Automated Jobs (Cron)", H1))
story.append(Paragraph("Καθημερινά tasks που τρέχουν αυτόματα στο Vercel", BODY_SM))

story.append(Paragraph(
    "Δεν χρειάζεται να κάνεις τίποτα — αυτά τα cron jobs τρέχουν αυτόματα κάθε μέρα. "
    "Σε Vercel Hobby tier τρέχουν daily-only (όχι hourly). Authentication γίνεται με "
    "<code>CRON_SECRET</code> env var.", BODY))

cron_data = [
    ["Cron Job", "Πότε τρέχει", "Τι κάνει"],
    ["expire-holds", "03:00 daily", "Διαγράφει pending_holds που έληξαν (>30 min)"],
    ["reminders-24h", "09:00 daily", "Στέλνει reminder email σε όσους έχουν shoot αύριο"],
    ["auto-complete", "04:00 daily", "Mark past bookings as 'completed' (>2h μετά end)"],
    ["expire-rolled-over", "02:00 daily", "Διαγράφει rolled-over hours που έληξαν (>60d)"],
    ["low-balance", "10:00 daily", "Στέλνει warning email σε members με <2h balance"],
]
cron_tbl = Table(cron_data, colWidths=[4 * cm, 3 * cm, 9.5 * cm])
cron_tbl.setStyle(TableStyle([
    ("FONT", (0, 0), (-1, 0), "Body-Bold", 9.5),
    ("FONT", (0, 1), (-1, -1), "Body", 9),
    ("BACKGROUND", (0, 0), (-1, 0), BRAND),
    ("TEXTCOLOR", (0, 0), (-1, 0), CREAM),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ("TOPPADDING", (0, 0), (-1, -1), 6),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [CREAM, SOFT]),
]))
story.append(cron_tbl)

story.append(Paragraph("Manual trigger για testing", H3))
story.append(Paragraph(
    "Αν θες να τρέξεις cron χειροκίνητα (π.χ. για να ελέγξεις reminders):", BODY))
story.append(Paragraph(
    "SECRET=$(grep CRON_SECRET .env.local | cut -d= -f2)<br/>"
    "curl -H \"Authorization: Bearer $SECRET\" https://ceestudio.ch/api/cron/reminders-24h", CODE))

story.append(PageBreak())

# ============================================================
# 12. DATABASE
# ============================================================
story.append(Paragraph("12. Database Tables", H1))
story.append(Paragraph("Τι αποθηκεύεται και γιατί", BODY_SM))

story.append(Paragraph("Σημαντικές tables", H3))
db_data = [
    ["Table", "Τι περιέχει"],
    ["users", "Όλοι οι users (customers + members + admins). Email = unique key."],
    ["memberships", "Active subscriptions. Plan, hours_balance, status, renewal date."],
    ["bookings", "ΟΛΑ τα bookings (η μεγαλύτερη table). Source of truth."],
    ["booking_addons", "Per-booking line items (lighting, backdrops, podcast)."],
    ["pending_holds", "Temp 30-min locks while Stripe Checkout in progress."],
    ["blocked_dates", "Admin-blocked dates/times (vacation, maintenance)."],
    ["settings", "Singleton (id=1). Door code, WiFi, prices, B2B emails, Stripe price IDs."],
    ["email_log", "Log κάθε email που στάλθηκε — για debugging deliverability."],
]
db_tbl = Table(db_data, colWidths=[4.5 * cm, 12 * cm])
db_tbl.setStyle(TableStyle([
    ("FONT", (0, 0), (-1, 0), "Body-Bold", 9.5),
    ("FONT", (0, 1), (-1, -1), "Body", 9),
    ("BACKGROUND", (0, 0), (-1, 0), BRAND),
    ("TEXTCOLOR", (0, 0), (-1, 0), CREAM),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ("TOPPADDING", (0, 0), (-1, -1), 5),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [CREAM, SOFT]),
]))
story.append(db_tbl)

story.append(Paragraph(
    "<b>Πού βλέπω το data:</b> Supabase Dashboard (<i>supabase.com</i>) → επιλέγεις το project "
    "→ Table Editor. Μπορείς να δεις, ψάξεις, και ακόμα και να διορθώσεις rows manually αν "
    "χρειαστεί (αλλά πρόσεχε — direct DB edits παρακάμπτουν τα policies).", CALLOUT))

story.append(PageBreak())

# ============================================================
# 13. DEPLOYMENT
# ============================================================
story.append(Paragraph("13. Deployment Architecture", H1))
story.append(Paragraph("Πώς το site ανεβαίνει live · Branches · Environment vars", BODY_SM))

story.append(Paragraph("Δύο Git Branches", H3))
branches_data = [
    ["Branch", "DEFAULT_MODE", "Τι κάνει"],
    ["main", "full", "Όλο το booking system, members, admin λειτουργεί"],
    ["marketing-only", "marketing", "Backend hidden — όλα redirect σε /coming-soon"],
]
branches_tbl = Table(branches_data, colWidths=[4 * cm, 4 * cm, 8.5 * cm])
branches_tbl.setStyle(TableStyle([
    ("FONT", (0, 0), (-1, 0), "Body-Bold", 9.5),
    ("FONT", (0, 1), (-1, -1), "Body", 9),
    ("BACKGROUND", (0, 0), (-1, 0), BRAND),
    ("TEXTCOLOR", (0, 0), (-1, 0), CREAM),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ("TOPPADDING", (0, 0), (-1, -1), 6),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [CREAM, SOFT]),
]))
story.append(branches_tbl)

story.append(Paragraph("Vercel Setup", H3))
story.append(Paragraph(
    "• <b>Production Branch</b>: marketing-only (αυτό deploys στο cee-studio.vercel.app)<br/>"
    "• <b>Preview Deployments</b>: κάθε push σε άλλο branch → unique preview URL<br/>"
    "• <b>Auto Deploy</b>: git push → Vercel rebuild ~2-3 min → live<br/>"
    "• <b>Custom Domain</b>: όταν ready, Settings → Domains → add ceestudio.ch", BODY))

story.append(Paragraph("Environment Variables (στο Vercel)", H3))
envs_data = [
    ["Variable", "Σε ποιο service αντιστοιχεί"],
    ["NEXT_PUBLIC_SUPABASE_URL", "Supabase project URL"],
    ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "Supabase anon (client-side) key"],
    ["SUPABASE_SERVICE_ROLE_KEY", "Supabase admin (server-side) key"],
    ["STRIPE_SECRET_KEY", "Stripe sk_live_... ή sk_test_..."],
    ["NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY", "Stripe pk_live_... ή pk_test_..."],
    ["STRIPE_WEBHOOK_SECRET", "Stripe webhook signing secret"],
    ["RESEND_API_KEY", "Resend API key"],
    ["RESEND_FROM", "CEE Studio <bookings@ceestudio.ch>"],
    ["CRON_SECRET", "Random string για cron auth"],
    ["ADMIN_ALLOWED_EMAILS", "Comma-separated admin emails"],
    ["NEXT_PUBLIC_SITE_URL", "https://ceestudio.ch (όταν custom domain)"],
]
envs_tbl = Table(envs_data, colWidths=[7 * cm, 9.5 * cm])
envs_tbl.setStyle(TableStyle([
    ("FONT", (0, 0), (-1, 0), "Body-Bold", 9),
    ("FONT", (0, 1), (-1, -1), "Body", 8.5),
    ("BACKGROUND", (0, 0), (-1, 0), BRAND),
    ("TEXTCOLOR", (0, 0), (-1, 0), CREAM),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ("TOPPADDING", (0, 0), (-1, -1), 5),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [CREAM, SOFT]),
]))
story.append(envs_tbl)

story.append(Paragraph("Πώς να switch-άρεις σε full mode (post-launch)", H3))
story.append(Paragraph(
    "Όταν είσαι έτοιμη να βγουν live τα bookings/payments:<br/>"
    "<b>Option A</b>: Vercel project → Settings → Git → Production Branch → άλλαξε σε <b>main</b>. "
    "Auto-redeploy.<br/>"
    "<b>Option B</b>: Στο marketing-only branch, άλλαξε το <code>DEFAULT_MODE</code> από "
    "<code>'marketing'</code> σε <code>'full'</code> στο <code>lib/launch-mode.ts</code> και κάνε commit + push.", BODY))

story.append(PageBreak())

# ============================================================
# 14. DAILY OPERATIONS
# ============================================================
story.append(Paragraph("14. Καθημερινές Λειτουργίες", H1))
story.append(Paragraph("Τι κάνει η αδερφή σου κάθε μέρα", BODY_SM))

story.append(Paragraph("Πρωί (5 λεπτά)", H3))
story.append(Paragraph(
    "• Έλεγχος <b>Gmail inbox</b> για νέα owner notification emails<br/>"
    "• Άνοιγμα <b>/admin</b> → δες σημερινά bookings + αύριο<br/>"
    "• Επιβεβαίωση ότι door code είναι σωστό στο /admin/settings<br/>"
    "• Έλεγχος WhatsApp/Instagram DMs για phone booking requests", BODY))

story.append(Paragraph("Όταν χτυπάει το τηλέφωνο / έρχεται email request", H3))
story.append(Paragraph(
    "• Άνοιξε <b>/admin/manual</b> → φτιάξε το booking manually<br/>"
    "• Διάλεξε payment method: 'Prepaid' αν πληρώθηκαν, 'Cash' αν θα πληρώσουν επιτόπου<br/>"
    "• Toggle 'Send email' για να πάρει confirmation από το σύστημα", BODY))

story.append(Paragraph("Αν customer ζητάει refund / cancel", H3))
story.append(Paragraph(
    "• Αν είναι μέσα στους κανόνες (weekday >48h): πες του να ακυρώσει μόνος του "
    "μέσω του link στο email του.<br/>"
    "• Αν θες να κάνεις exception (π.χ. emergency, goodwill): /admin/bookings → "
    "Refund. Αυτό bypasses τους κανόνες.", BODY))

story.append(Paragraph("Hebdomatic (1×/εβδομάδα)", H3))
story.append(Paragraph(
    "• Έλεγχος <b>Resend dashboard</b> (<i>resend.com/emails</i>) για bounced emails<br/>"
    "• Έλεγχος <b>Stripe dashboard</b> για παγωμένες πληρωμές / failed renewals<br/>"
    "• Δες <b>Google Search Console</b> για SEO progress<br/>"
    "• Reply σε Google Reviews (αν υπάρχουν νέες)", BODY))

story.append(Paragraph("Μηνιαία (1×/μήνα)", H3))
story.append(Paragraph(
    "• <b>Stripe Dashboard</b>: monthly revenue summary, payout to bank account<br/>"
    "• <b>Members</b>: δες ποιοι μπήκαν / έφυγαν στο /admin/bookings<br/>"
    "• <b>Blog</b>: 4 νέα articles (εβδομαδιαία)<br/>"
    "• Backup: τα data είναι ήδη στο Supabase (auto-backup), αλλά μπορείς να εξάγεις "
    "manual όλα τα bookings σε CSV από το Supabase Table Editor αν θέλεις offline copy", BODY))

story.append(PageBreak())

# ============================================================
# 15. TROUBLESHOOTING
# ============================================================
story.append(Paragraph("15. Troubleshooting", H1))
story.append(Paragraph("Συχνά προβλήματα + γρήγορες λύσεις", BODY_SM))

story.append(Paragraph("Customer δεν έλαβε confirmation email", H3))
story.append(Paragraph(
    "<b>Διάγνωση:</b><br/>"
    "1. Resend dashboard → ψάξε για το email — αν είναι 'Delivered', πιθανώς spam.<br/>"
    "2. Αν δεν υπάρχει στο dashboard → δεν στάλθηκε. Πιθανότατα booking δεν δημιουργήθηκε "
    "(Stripe webhook problem). Check /admin/bookings — υπάρχει το booking;<br/>"
    "3. Αν booking υπάρχει αλλά email δεν στάλθηκε → check email_log table στο Supabase για errors.", BODY))
story.append(Paragraph(
    "<b>Λύση:</b> Από το /admin/bookings μπορείς να ανοίξεις το booking και να κάνεις "
    "manual resend (αν το feature υπάρχει), ή στείλε customer το /booking/manage/[token] "
    "link χειροκίνητα.", BODY))

story.append(Paragraph("Customer είδε 'Booking is being processed' και δεν εμφανίστηκε", H3))
story.append(Paragraph(
    "<b>Αιτία:</b> Stripe webhook δεν έφτασε στο server.<br/>"
    "<b>Έλεγχος:</b> Stripe Dashboard → Developers → Webhooks → click στο webhook → "
    "δες events. Αν το event status είναι 'Failed', click για details.<br/>"
    "<b>Λύση:</b> Δες αν το booking υπάρχει ήδη στο /admin/bookings. Αν όχι, μπορείς να το "
    "δημιουργήσεις μέσω /admin/manual + κάνε refund το Stripe payment manual αν χρειάζεται.", BODY))

story.append(Paragraph("Member δεν μπορεί να κλείσει με ώρες (error)", H3))
story.append(Paragraph(
    "<b>Έλεγχος:</b> Supabase Table Editor → memberships table → δες την κατάσταση "
    "του membership row. Αν status != 'active' ή hours_balance = 0, αυτό εξηγεί.<br/>"
    "<b>Λύση:</b> Αν είναι θέμα balance, μπορείς να δώσεις manually επιπλέον ώρες "
    "(direct DB edit, σε emergency).", BODY))

story.append(Paragraph("Slot εμφανίζεται booked ενώ είναι ελεύθερο", H3))
story.append(Paragraph(
    "<b>Αιτία:</b> Stale pending_hold που δεν διαγράφηκε.<br/>"
    "<b>Λύση:</b> Run cron manually: <code>curl -H \"Authorization: Bearer $CRON_SECRET\" "
    "https://ceestudio.ch/api/cron/expire-holds</code>", BODY))

story.append(Paragraph("Vercel deployment failed", H3))
story.append(Paragraph(
    "<b>Έλεγχος:</b> Vercel project → Deployments → click στο failed deploy → δες logs.<br/>"
    "<b>Συνήθεις αιτίες:</b><br/>"
    "• TypeScript error → fix στο κώδικα + push<br/>"
    "• Missing env var → add it στο Vercel project settings<br/>"
    "• Build timeout → contact support (rare)", BODY))

story.append(Paragraph("Stripe webhook signature mismatch", H3))
story.append(Paragraph(
    "<b>Αιτία:</b> STRIPE_WEBHOOK_SECRET δεν ταιριάζει με αυτό στο Stripe.<br/>"
    "<b>Λύση:</b> Stripe Dashboard → Webhooks → endpoint → reveal signing secret → "
    "αντιγραφή στο Vercel env vars.", BODY))

story.append(Paragraph(
    "<b>⚠️ Όταν χρειαστείς βοήθεια από τον προγραμματιστή:</b><br/>"
    "1. Πάρε screenshot του προβλήματος<br/>"
    "2. Πες ακριβώς τι έγινε (βήμα-βήμα)<br/>"
    "3. Δώσε το booking ID ή customer email αν εφαρμόζεται<br/>"
    "Με αυτά τα 3 πληροφορίες, το debugging είναι 90% πιο γρήγορο.", CALLOUT))

story.append(PageBreak())

# ============================================================
# APPENDIX
# ============================================================
story.append(Paragraph("Παράρτημα — Quick Reference Links", H1))

story.append(Paragraph("URLs που θα χρησιμοποιείς συχνά", H3))
links_data = [
    ["Service", "URL"],
    ["Live site", "https://ceestudio.ch (όταν live)"],
    ["Vercel project", "vercel.com/[your-account]/cee-studio"],
    ["Supabase project", "supabase.com/dashboard/project/vhsfdfaziafkibzpevsq"],
    ["Stripe dashboard", "dashboard.stripe.com"],
    ["Resend dashboard", "resend.com/emails"],
    ["Google Business Profile", "business.google.com"],
    ["Google Search Console", "search.google.com/search-console"],
    ["GitHub repo", "github.com/harabalos/cee_studio"],
]
links_tbl = Table(links_data, colWidths=[5 * cm, 11.5 * cm])
links_tbl.setStyle(TableStyle([
    ("FONT", (0, 0), (-1, 0), "Body-Bold", 9.5),
    ("FONT", (0, 1), (-1, -1), "Body", 9),
    ("BACKGROUND", (0, 0), (-1, 0), BRAND),
    ("TEXTCOLOR", (0, 0), (-1, 0), CREAM),
    ("VALIGN", (0, 0), (-1, -1), "TOP"),
    ("LEFTPADDING", (0, 0), (-1, -1), 6),
    ("RIGHTPADDING", (0, 0), (-1, -1), 6),
    ("TOPPADDING", (0, 0), (-1, -1), 5),
    ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
    ("ROWBACKGROUNDS", (0, 1), (-1, -1), [CREAM, SOFT]),
]))
story.append(links_tbl)

story.append(Spacer(1, 1 * cm))
story.append(HRFlowable(width="100%", thickness=0.5, color=ACCENT))
story.append(Spacer(1, 0.5 * cm))
story.append(Paragraph("CEE Studio · System Guide v1.0 · 2026", ParagraphStyle(
    "Footer", parent=BODY, alignment=TA_CENTER, textColor=MUTED, fontSize=9)))
story.append(Paragraph("Φτιάχτηκε με ❤️ στη Ζυρίχη", ParagraphStyle(
    "Footer2", parent=BODY, alignment=TA_CENTER, textColor=MUTED, fontSize=9, fontName="Body-Italic")))


# --- Build ---------------------------------------------------------
def header_footer(canvas, doc):
    """Page header + footer with brand mark + page number."""
    canvas.saveState()
    # Footer
    canvas.setFont("Body", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(2 * cm, 1.5 * cm, "CEE Studio · System Guide")
    canvas.drawRightString(A4[0] - 2 * cm, 1.5 * cm, f"Σελίδα {doc.page}")
    # Subtle accent line
    canvas.setStrokeColor(ACCENT)
    canvas.setLineWidth(0.3)
    canvas.line(2 * cm, 1.9 * cm, A4[0] - 2 * cm, 1.9 * cm)
    canvas.restoreState()


doc = SimpleDocTemplate(
    OUT, pagesize=A4,
    rightMargin=2 * cm, leftMargin=2 * cm,
    topMargin=2 * cm, bottomMargin=2.5 * cm,
    title="CEE Studio — Πλήρης Οδηγός Συστήματος",
    author="CEE Studio",
)

doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
print(f"✅ Generated: {OUT}")
print(f"   {os.path.getsize(OUT) / 1024:.1f} KB")
