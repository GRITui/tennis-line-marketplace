from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.platypus import Paragraph
from reportlab.pdfgen import canvas


OUT = "docs/demo/tennis-line-marketplace-mvp-presentation.pdf"
W, H = landscape((13.333 * inch, 7.5 * inch))

INK = colors.HexColor("#17211C")
GREEN = colors.HexColor("#173D2C")
MINT = colors.HexColor("#F6F8F5")
LIME = colors.HexColor("#D8F36A")
MID = colors.HexColor("#718076")
LINE = colors.HexColor("#DFE8DF")
PALE = colors.HexColor("#F5F8F4")
CORAL = colors.HexColor("#F0C7C2")
GOLD = colors.HexColor("#EAD8A6")

styles = getSampleStyleSheet()
BODY = ParagraphStyle("body", parent=styles["BodyText"], fontName="Helvetica", fontSize=14, leading=20, textColor=MID)
SMALL = ParagraphStyle("small", parent=BODY, fontSize=10, leading=14)
TITLE = ParagraphStyle("title", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=34, leading=38, textColor=INK)
WHITE_TITLE = ParagraphStyle("white_title", parent=TITLE, textColor=colors.white)
CENTER = ParagraphStyle("center", parent=BODY, alignment=TA_CENTER)


def rr(c, x, y, w, h, fill, radius=18, stroke=None, sw=1):
    c.setFillColor(fill)
    c.setStrokeColor(stroke or fill)
    c.setLineWidth(sw)
    c.roundRect(x, y, w, h, radius, fill=1, stroke=1 if stroke else 0)


def text(c, value, x, y, style=BODY, width=None):
    if width:
        p = Paragraph(value, style)
        _, ph = p.wrap(width, H)
        p.drawOn(c, x, y - ph)
        return ph
    c.setFillColor(style.textColor)
    c.setFont(style.fontName, style.fontSize)
    c.drawString(x, y, value)
    return style.fontSize


def pill(c, label, x, y, fill=LIME, fg=GREEN):
    width = stringWidth(label, "Helvetica-Bold", 9) + 54
    rr(c, x, y - 15, width, 24, fill, 12)
    c.setFillColor(fg)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(x + 15, y - 7, label.upper())
    return width


def footer(c, page, dark=False):
    c.setFillColor(colors.HexColor("#B8C8BA") if dark else colors.HexColor("#9AA69D"))
    c.setFont("Helvetica", 8)
    c.drawString(42, 22, "Tennis Line · MVP selling presentation")
    c.drawRightString(W - 42, 22, f"{page:02d}")


def mock_phone(c, x, y, w=190, h=370, accent=LIME):
    rr(c, x, y, w, h, colors.white, 24, stroke=LINE, sw=1)
    rr(c, x + 10, y + h - 44, w - 20, 27, GREEN, 10)
    c.setFillColor(accent)
    c.circle(x + 27, y + h - 30, 7, fill=1, stroke=0)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(x + 43, y + h - 34, "Tennis Line")
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 15)
    c.drawString(x + 18, y + h - 75, "Find your next")
    c.drawString(x + 18, y + h - 94, "good court day.")
    rr(c, x + 18, y + h - 130, w - 36, 26, PALE, 9)
    c.setFillColor(MID)
    c.setFont("Helvetica", 8)
    c.drawString(x + 29, y + h - 120, "Search coach, location or court")
    for i, (coach, court, price) in enumerate([
        ("Coach Nok", "Asoke Tennis Club", "฿1,200"),
        ("Coach Ben", "Ari Clay Courts", "฿1,500"),
    ]):
        cy = y + h - 188 - i * 91
        rr(c, x + 18, cy, w - 36, 76, colors.white, 12, stroke=LINE)
        c.setFillColor(LIME)
        c.circle(x + 36, cy + 52, 10, fill=1, stroke=0)
        c.setFillColor(GREEN)
        c.setFont("Helvetica-Bold", 8)
        c.drawCentredString(x + 36, cy + 49, coach.split()[-1][0])
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(x + 54, cy + 55, coach)
        c.setFillColor(MID)
        c.setFont("Helvetica", 7)
        c.drawString(x + 54, cy + 42, court)
        c.drawString(x + 54, cy + 29, "Tomorrow · 09:00 · Hard court")
        c.setFillColor(GREEN)
        c.setFont("Helvetica-Bold", 9)
        c.drawRightString(x + w - 27, cy + 20, price)
    c.setFillColor(MID)
    c.setFont("Helvetica", 7)
    c.drawCentredString(x + w / 2, y + 18, "Discover     Sessions     Passport")


def mock_dashboard(c, x, y, w=440, h=300):
    rr(c, x, y, w, h, colors.white, 20, stroke=LINE)
    rr(c, x, y + h - 38, w, 38, GREEN, 20)
    c.setFillColor(LIME)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(x + 18, y + h - 24, "Tennis Line  /  Coach workspace")
    for i, (label, value) in enumerate([("Bookings", "8"), ("Customers", "12"), ("Utilization", "78%"), ("Open sessions", "4")]):
        bx = x + 16 + i * 104
        by = y + h - 108
        rr(c, bx, by, 91, 55, PALE, 12)
        c.setFillColor(MID)
        c.setFont("Helvetica-Bold", 7)
        c.drawString(bx + 10, by + 38, label.upper())
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 18)
        c.drawString(bx + 10, by + 15, value)
    c.setFillColor(MID)
    c.setFont("Helvetica-Bold", 8)
    c.drawString(x + 18, y + h - 139, "UPCOMING SESSIONS")
    for i, name in enumerate(["Beginner foundations", "Match play · intermediate", "Serve mechanics"]):
        ry = y + h - 178 - i * 35
        c.setFillColor(PALE)
        c.roundRect(x + 16, ry, w - 32, 26, 8, fill=1, stroke=0)
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 8)
        c.drawString(x + 28, ry + 10, name)
        c.setFillColor(MID)
        c.setFont("Helvetica", 8)
        c.drawRightString(x + w - 28, ry + 10, f"{i + 2}/4 booked")


def page_cover(c):
    c.setFillColor(GREEN)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(LIME)
    c.circle(W - 105, H - 90, 170, fill=1, stroke=0)
    c.setFillColor(colors.HexColor("#24553D"))
    c.circle(W - 170, 90, 220, fill=1, stroke=0)
    pill(c, "MVP selling presentation", 54, H - 58, fill=LIME)
    text(c, "Better court days,\nbooked with intention.", 54, H - 125, WHITE_TITLE, 640)
    text(c, "Tennis Line connects players with the right coach, court and moment — while giving coaches a calmer way to fill their calendar.", 58, H - 285, ParagraphStyle("coverbody", parent=BODY, fontSize=16, leading=23, textColor=colors.HexColor("#C7D8C9")), 570)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(58, 68, "Player marketplace  ·  Coach workspace  ·  LINE-ready MVP")
    c.setFillColor(GREEN)
    c.setFont("Helvetica-Bold", 24)
    c.drawString(W - 160, H - 98, "TL")
    footer(c, 1, dark=True)


def page_problem(c):
    c.setFillColor(MINT)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    pill(c, "The opportunity", 54, H - 58)
    text(c, "Tennis is personal.\nBooking still feels generic.", 54, H - 112, TITLE, 600)
    text(c, "Players want confidence before they commit. Coaches want demand without another spreadsheet, chat thread or empty hour.", 58, H - 222, BODY, 540)
    cards = [
        ("01", "Players lose momentum", "Availability is fragmented across messages, calendars and last-minute decisions."),
        ("02", "Coaches lose time", "Great coaches spend energy coordinating instead of coaching."),
        ("03", "Progress gets forgotten", "The best insight from a session often disappears after the final ball."),
    ]
    for i, (num, head, body) in enumerate(cards):
        x = 58 + i * 270
        rr(c, x, 105, 235, 190, colors.white, 18, stroke=LINE)
        c.setFillColor(LIME)
        c.circle(x + 31, 258, 16, fill=1, stroke=0)
        c.setFillColor(GREEN)
        c.setFont("Helvetica-Bold", 9)
        c.drawCentredString(x + 31, 255, num)
        text(c, head, x + 20, 220, ParagraphStyle("cardhead", parent=BODY, fontName="Helvetica-Bold", fontSize=15, leading=18, textColor=INK), 190)
        text(c, body, x + 20, 178, SMALL, 190)
    footer(c, 2)


def page_player(c):
    c.setFillColor(MINT)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    pill(c, "For players", 54, H - 58)
    text(c, "Make the next session\nthe easy decision.", 54, H - 112, TITLE, 405)
    text(c, "A focused marketplace for finding trusted court time, holding a slot and keeping your progress in one place.", 58, H - 220, BODY, 385)
    benefits = [("Find the fit", "Coach, surface, location and time — in one view."), ("Hold with confidence", "Keep a good slot while you decide, without losing momentum."), ("Build your story", "Coach notes and focus areas follow you from session to session.")]
    for i, (head, body) in enumerate(benefits):
        y = H - 300 - i * 70
        c.setFillColor(LIME)
        c.circle(68, y + 7, 10, fill=1, stroke=0)
        c.setFillColor(GREEN)
        c.setFont("Helvetica-Bold", 10)
        c.drawCentredString(68, y + 4, str(i + 1))
        text(c, head, 92, y + 12, ParagraphStyle("benefit", parent=BODY, fontName="Helvetica-Bold", fontSize=13, leading=16, textColor=INK), 320)
        text(c, body, 92, y - 8, SMALL, 330)
    mock_phone(c, W - 310, 76)
    footer(c, 3)


def page_coach(c):
    c.setFillColor(GREEN)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    pill(c, "For coaches", 54, H - 58, fill=LIME)
    text(c, "Turn availability\ninto a healthier week.", 54, H - 112, WHITE_TITLE, 385)
    text(c, "Tennis Line gives coaches a simple operating layer for demand, sessions and relationships — so every opening has a better chance to fill.", 58, H - 220, ParagraphStyle("darkbody", parent=BODY, textColor=colors.HexColor("#C7D8C9")), 365)
    benefits = [("Fill with signal", "See utilization and open sessions before the week gets away from you."), ("Know your players", "Keep a clear view of returning customers and booking patterns."), ("Stay in your craft", "Less admin overhead. More time coaching the point in front of you.")]
    for i, (head, body) in enumerate(benefits):
        y = H - 300 - i * 70
        c.setFillColor(LIME)
        c.circle(68, y + 7, 10, fill=1, stroke=0)
        c.setFillColor(GREEN)
        c.setFont("Helvetica-Bold", 10)
        c.drawCentredString(68, y + 4, str(i + 1))
        text(c, head, 92, y + 12, ParagraphStyle(f"darkbenefit{i}", parent=BODY, fontName="Helvetica-Bold", fontSize=13, leading=16, textColor=colors.white), 330)
        text(c, body, 92, y - 8, ParagraphStyle(f"darksmall{i}", parent=SMALL, textColor=colors.HexColor("#C7D8C9")), 335)
    mock_dashboard(c, W - 510, 125, 440, 300)
    footer(c, 4, dark=True)


def page_loop(c):
    c.setFillColor(MINT)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    pill(c, "The product loop", 54, H - 58)
    text(c, "One marketplace.\nTwo sides of a better match.", 54, H - 112, TITLE, 600)
    text(c, "The MVP is designed around a simple promise: make the right session easier to discover, commit to and learn from.", 58, H - 222, BODY, 600)
    nodes = [("1", "Discover", "Player sees a clear, relevant opening."), ("2", "Hold", "A short hold protects intent."), ("3", "Book", "Checkout confirms the court and coach."), ("4", "Improve", "Coach notes make the next session better.")]
    start_x = 75
    for i, (num, head, body) in enumerate(nodes):
        x = start_x + i * 260
        c.setFillColor(LIME if i < 3 else GREEN)
        c.circle(x, 300, 27, fill=1, stroke=0)
        c.setFillColor(GREEN if i < 3 else colors.white)
        c.setFont("Helvetica-Bold", 15)
        c.drawCentredString(x, 295, num)
        text(c, head, x - 55, 245, ParagraphStyle(f"nodeh{i}", parent=BODY, fontName="Helvetica-Bold", fontSize=16, leading=18, textColor=INK), 150)
        text(c, body, x - 55, 215, SMALL, 150)
        if i < 3:
            c.setStrokeColor(colors.HexColor("#B7C8B9"))
            c.setLineWidth(2)
            c.line(x + 34, 300, x + 235, 300)
            c.setFillColor(colors.HexColor("#B7C8B9"))
            c.line(x + 225, 306, x + 235, 300)
            c.line(x + 225, 294, x + 235, 300)
    footer(c, 5)


def page_mvp(c):
    c.setFillColor(MINT)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    pill(c, "What ships in MVP", 54, H - 58)
    text(c, "A credible first release,\nready for real conversations.", 54, H - 112, TITLE, 600)
    columns = [
        ("Player app", ["Discovery marketplace", "Date / surface / search filters", "Slot hold + checkout flow", "Sessions history", "Player passport + coach notes"]),
        ("Coach workspace", ["Calendar overview", "Bookings + utilization", "Customer relationship view", "Create and remove sessions", "Reports and next actions"]),
        ("Foundation", ["LINE-ready identity path", "API contracts with demo fallback", "Responsive mobile-first UI", "Accessible states and controls", "Premium visual system"]),
    ]
    for i, (head, items) in enumerate(columns):
        x = 58 + i * 285
        rr(c, x, 117, 250, 285, colors.white, 20, stroke=LINE)
        c.setFillColor(GREEN if i != 1 else LIME)
        c.circle(x + 28, 370, 12, fill=1, stroke=0)
        c.setFillColor(colors.white if i != 1 else GREEN)
        c.setFont("Helvetica-Bold", 10)
        c.drawCentredString(x + 28, 367, str(i + 1))
        text(c, head, x + 52, 378, ParagraphStyle(f"colh{i}", parent=BODY, fontName="Helvetica-Bold", fontSize=16, leading=18, textColor=INK), 175)
        for j, item in enumerate(items):
            yy = 330 - j * 37
            c.setFillColor(LIME)
            c.circle(x + 30, yy, 4, fill=1, stroke=0)
            text(c, item, x + 45, yy + 4, SMALL, 180)
    footer(c, 6)


def page_demo(c):
    c.setFillColor(GREEN)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    pill(c, "Demo story", 54, H - 58, fill=LIME)
    text(c, "From “I should play this week”\nto “I’m booked.”", 54, H - 112, WHITE_TITLE, 440)
    text(c, "A five-minute product walkthrough for player and coach conversations.", 58, H - 220, ParagraphStyle("demobody", parent=BODY, textColor=colors.HexColor("#C7D8C9")), 420)
    steps = [("01", "Player opens LINE", "A trusted entry point, no new habit to learn."), ("02", "Finds the right session", "The choice is concrete: who, where, when, how much."), ("03", "Holds and checks out", "Intent becomes a confirmed court time."), ("04", "Coach sees a healthier week", "Demand, customers and next actions become visible.")]
    for i, (num, head, body) in enumerate(steps):
        y = 330 - i * 58
        c.setFillColor(LIME)
        c.setFont("Helvetica-Bold", 9)
        c.drawString(72, y, num)
        c.setFillColor(colors.white)
        c.setFont("Helvetica-Bold", 12)
        c.drawString(112, y, head)
        text(c, body, 112, y - 7, ParagraphStyle(f"demostep{i}", parent=SMALL, textColor=colors.HexColor("#C7D8C9")), 380)
    rr(c, W - 390, 118, 300, 230, colors.HexColor("#24553D"), 24)
    c.setFillColor(LIME)
    c.setFont("Helvetica-Bold", 34)
    c.drawString(W - 350, 294, "TL")
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 19)
    c.drawString(W - 350, 250, "Train with")
    c.drawString(W - 350, 225, "intention.")
    c.setFillColor(colors.HexColor("#C7D8C9"))
    c.setFont("Helvetica", 10)
    c.drawString(W - 350, 184, "Player marketplace")
    c.drawString(W - 350, 166, "Coach workspace")
    footer(c, 7, dark=True)


def page_close(c):
    c.setFillColor(MINT)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    pill(c, "The ask", 54, H - 58)
    text(c, "Start with the court day.\nGrow from there.", 54, H - 112, TITLE, 600)
    text(c, "Tennis Line is ready to be tested with real players and coaches: validate demand, learn where trust matters most, then deepen the loop around progress.", 58, H - 220, BODY, 560)
    rr(c, 58, 115, 510, 130, GREEN, 20)
    c.setFillColor(LIME)
    c.setFont("Helvetica-Bold", 13)
    c.drawString(83, 209, "Next conversation")
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 22)
    c.drawString(83, 175, "Who is your next great session for?")
    c.setFillColor(colors.HexColor("#C7D8C9"))
    c.setFont("Helvetica", 10)
    c.drawString(83, 147, "Player demand · Coach supply · Better court days")
    c.setFillColor(GREEN)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(W - 300, 185, "MVP shipped")
    c.setFillColor(MID)
    c.setFont("Helvetica", 10)
    c.drawString(W - 300, 161, "Player + coach surfaces")
    c.drawString(W - 300, 143, "Responsive · LINE-ready")
    footer(c, 8)


def build():
    c = canvas.Canvas(OUT, pagesize=(W, H))
    for page in (page_cover, page_problem, page_player, page_coach, page_loop, page_mvp, page_demo, page_close):
        page(c)
        c.showPage()
    c.save()


if __name__ == "__main__":
    build()
