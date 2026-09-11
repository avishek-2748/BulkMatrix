"""
Generates a professional PDF documentation for BulkMatrix using ReportLab
"""

import sys
from pathlib import Path
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
from reportlab.pdfgen import canvas

# Reconfigure stdout to UTF-8
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')


class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def draw_page_number(self, page_count):
        self.saveState()
        self.setFont("Helvetica", 9)
        self.setFillColor(colors.HexColor("#64748B"))
        
        # Header banner (on page 2+)
        if self._pageNumber > 1:
            self.drawString(54, 11 * inch - 36, "BulkMatrix — AI Freight Forecasting & Vessel Chartering Documentation")
            self.setStrokeColor(colors.HexColor("#E2E8F0"))
            self.setLineWidth(0.5)
            self.line(54, 11 * inch - 42, 8.5 * inch - 54, 11 * inch - 42)

        # Footer
        footer_text = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(8.5 * inch - 54, 36, footer_text)
        self.drawString(54, 36, "CONFIDENTIAL & PROPRIETARY — SIH 2026 BULKMATRIX PLATFORM")
        self.setStrokeColor(colors.HexColor("#E2E8F0"))
        self.setLineWidth(0.5)
        self.line(54, 48, 8.5 * inch - 54, 48)
        
        self.restoreState()


def build_pdf(filename="BulkMatrix_Project_Documentation.pdf"):
    pdf_path = Path(filename)
    doc = SimpleDocTemplate(
        str(pdf_path),
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=54,
        bottomMargin=54
    )

    styles = getSampleStyleSheet()

    # Custom styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=colors.HexColor("#1E3A8A"),
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubTitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#475569"),
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Heading1'],
        fontName='Helvetica-Bold',
        fontSize=16,
        leading=20,
        textColor=colors.HexColor("#1D4ED8"),
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'SectionH2',
        parent=styles['Heading2'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=colors.HexColor("#0F172A"),
        spaceBefore=10,
        spaceAfter=4,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyTextCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#334155"),
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'BulletCustom',
        parent=body_style,
        leftIndent=15,
        firstLineIndent=-10,
        spaceAfter=4
    )

    code_style = ParagraphStyle(
        'CodeStyle',
        parent=styles['Normal'],
        fontName='Courier',
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#0F172A"),
        backColor=colors.HexColor("#F8FAFC"),
        borderColor=colors.HexColor("#E2E8F0"),
        borderWidth=1,
        borderPadding=6,
        spaceBefore=6,
        spaceAfter=8
    )

    story = []

    # Title Banner
    story.append(Paragraph("🚢 BulkMatrix — Technical & System Documentation", title_style))
    story.append(Paragraph("Smart India Hackathon (SIH 2026) | AI-powered Freight Forecasting & Vessel Chartering Platform", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#1D4ED8"), spaceAfter=15))

    # 1. Executive Summary
    story.append(Paragraph("1. Executive Summary", h1_style))
    story.append(Paragraph(
        "<b>BulkMatrix</b> is an enterprise decision-support dashboard for dry bulk shipping, freight rate forecasting, and vessel chartering optimization. "
        "Built specifically for SIH 2026, it addresses key operational pain points faced by Indian bulk importers (coal, iron ore, grains) by combining machine learning forecasts, "
        "vessel-to-port draft constraint checking, financial voyage cost modeling, and live weather hazard warnings.",
        body_style
    ))
    
    story.append(Paragraph("<b>Key Features & Innovations:</b>", h2_style))
    features = [
        "<b>15/30/90-Day Freight Rate Forecasts</b>: Per-route CatBoost regularized models providing price projections with lower/upper confidence bounds.",
        "<b>Vessel-to-Port Feasibility Engine</b>: Automatically screens Handysize, Supramax, Panamax, and Capesize vessels against Indian East Coast port draft, LOA, beam, and DWT limits.",
        "<b>Financial Voyage Optimizer</b>: Compares Voyage Charter vs. Time Charter costs, factoring in bunker fuel consumption, daily rates, port stay days, and demurrage risks.",
        "<b>Market Entry Buy/Hold Signals</b>: Delivers automated contract entry signals for short and medium-term chartering commitments.",
        "<b>Live Weather & Marine Intelligence</b>: Parallel integration with Open-Meteo atmospheric and marine wave APIs for real-time harbor safety monitoring."
    ]
    for feat in features:
        story.append(Paragraph(f"• {feat}", bullet_style))

    story.append(Spacer(1, 10))

    # 2. System Architecture
    story.append(Paragraph("2. System Architecture & Tech Stack", h1_style))
    story.append(Paragraph(
        "BulkMatrix uses a modern 4-tier decoupled architecture: a React 19 single-page frontend, a Node.js Express API gateway with MongoDB, a Python 3.10 FastAPI Machine Learning engine, and background data processing pipelines.",
        body_style
    ))

    arch_code = """+-----------------------------------------------------------------------------+
|                          PRESENTATION LAYER (Frontend)                      |
|  React 19 + Vite + Tailwind CSS + Lucide Icons + Recharts + React Leaflet   |
+--------------------------------------v--------------------------------------+
                                       | HTTP / REST API
                   +-------------------+-------------------+
                   v                                       v
+------------------------------------+   +------------------------------------+
|    NODE.JS + EXPRESS API GATEWAY   |   |     PYTHON FASTAPI ML ENGINE       |
| Auth, MongoDB, Proxy, Weather API  |   |  Charter Engine & Prediction ML    |
+------------------v-----------------+   +------------------v-----------------+
                   |                                        |
                   v                                        v
           MongoDB Database                         ML Models & Datasets
  (Users, Saved Charters, Sessions)           (CatBoost PKLs, Parquet, Raw CSVs)"""
    story.append(Paragraph(arch_code.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_style))

    story.append(Spacer(1, 10))

    # 3. Work Completed
    story.append(Paragraph("3. Summary of Completed Integration & Development", h1_style))
    completed_items = [
        "<b>Node.js ↔ Python FastAPI Integration Bridge</b>: Implemented <code>mlService.js</code> with live <code>fetch()</code> proxies connecting Express routes to FastAPI ML endpoints, featuring automatic mock fallbacks.",
        "<b>Dataset-Driven Analytics APIs</b>: Implemented real CSV dataset readers serving BDI daily indices, port traffic congestion time series, weather risk flags, port infrastructure rules, and model performance metrics.",
        "<b>Open-Meteo Weather & Marine API Integration</b>: Built <code>weatherService.js</code> and <code>weatherController.js</code> integrating live weather (temp, wind, cloud cover) and marine (wave height, wave period, sea temp) data with a maritime risk engine for Indian ports.",
        "<b>Frontend Model Evaluation Benchmarks</b>: Updated <code>ForecastHistory.jsx</code> to render live CatBoost vs XGBoost vs LightGBM evaluation cards and resolved JSX tag nesting syntax issues.",
        "<b>Automated SIH Test Scenario Suite</b>: Created <code>scripts/test_scenarios.py</code> verifying 3 core SIH dry bulk chartering scenarios against <code>CharterEngine</code> (100% test pass rate).",
        "<b>MongoDB Connection Resilience</b>: Created <code>backend/.env</code> and added fallback URI connection handling in <code>db.js</code> to ensure zero app crashes when MongoDB is offline.",
        "<b>Multi-Container Docker Composition</b>: Authored <code>docker-compose.yml</code>, <code>Dockerfile.ml</code>, <code>backend/Dockerfile</code>, and <code>frontend/Dockerfile</code> for one-command containerized deployment."
    ]
    for item in completed_items:
        story.append(Paragraph(f"✓ {item}", bullet_style))

    story.append(Spacer(1, 10))

    # 4. ML Performance Metrics Table
    story.append(Paragraph("4. Machine Learning Model Evaluation Benchmarks", h1_style))
    story.append(Paragraph("Evaluation metrics comparing CatBoost, XGBoost, and LightGBM across 15-day, 30-day, and 90-day forecast horizons:", body_style))

    table_data = [
        [Paragraph("<b>Horizon</b>", body_style), Paragraph("<b>Primary Model</b>", body_style), Paragraph("<b>MAE</b>", body_style), Paragraph("<b>RMSE</b>", body_style), Paragraph("<b>MAPE (%)</b>", body_style), Paragraph("<b>Status</b>", body_style)],
        [Paragraph("15-Day", body_style), Paragraph("CatBoost (Regularized)", body_style), Paragraph("397.07", body_style), Paragraph("540.56", body_style), Paragraph("<b>20.40%</b>", body_style), Paragraph("⭐ Selected", body_style)],
        [Paragraph("15-Day", body_style), Paragraph("XGBoost", body_style), Paragraph("620.35", body_style), Paragraph("757.06", body_style), Paragraph("30.54%", body_style), Paragraph("Evaluated", body_style)],
        [Paragraph("15-Day", body_style), Paragraph("LightGBM", body_style), Paragraph("655.51", body_style), Paragraph("791.92", body_style), Paragraph("34.31%", body_style), Paragraph("Evaluated", body_style)],
        [Paragraph("30-Day", body_style), Paragraph("CatBoost (Regularized)", body_style), Paragraph("502.24", body_style), Paragraph("631.75", body_style), Paragraph("<b>26.03%</b>", body_style), Paragraph("⭐ Selected", body_style)],
        [Paragraph("30-Day", body_style), Paragraph("XGBoost", body_style), Paragraph("487.89", body_style), Paragraph("625.07", body_style), Paragraph("26.60%", body_style), Paragraph("Evaluated", body_style)],
        [Paragraph("90-Day", body_style), Paragraph("CatBoost (Regularized)", body_style), Paragraph("465.33", body_style), Paragraph("604.78", body_style), Paragraph("<b>24.98%</b>", body_style), Paragraph("⭐ Selected", body_style)],
        [Paragraph("90-Day", body_style), Paragraph("XGBoost", body_style), Paragraph("472.52", body_style), Paragraph("596.37", body_style), Paragraph("25.84%", body_style), Paragraph("Evaluated", body_style)],
    ]

    t = Table(table_data, colWidths=[65, 145, 60, 60, 70, 75])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor("#0F172A")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t)

    story.append(Spacer(1, 10))

    # 5. REST API Table
    story.append(Paragraph("5. API Endpoint Summary", h1_style))
    
    api_data = [
        [Paragraph("<b>Category</b>", body_style), Paragraph("<b>Endpoint</b>", body_style), Paragraph("<b>Method</b>", body_style), Paragraph("<b>Description</b>", body_style)],
        [Paragraph("Auth", body_style), Paragraph("/api/auth/login", body_style), Paragraph("POST", body_style), Paragraph("Authenticates user and returns JWT token.", body_style)],
        [Paragraph("Charter ML", body_style), Paragraph("/api/charter/recommendation", body_style), Paragraph("POST", body_style), Paragraph("Generates vessel class, port draft feasibility, and cost breakdown.", body_style)],
        [Paragraph("Forecast ML", body_style), Paragraph("/api/forecast", body_style), Paragraph("POST", body_style), Paragraph("Returns 15/30/90-day freight projections with confidence bounds.", body_style)],
        [Paragraph("Weather", body_style), Paragraph("/api/weather/current/:portId", body_style), Paragraph("GET", body_style), Paragraph("Returns live weather, marine waves, and calculated cyclone risk.", body_style)],
        [Paragraph("Analytics", body_style), Paragraph("/api/analytics/model-performance", body_style), Paragraph("GET", body_style), Paragraph("Exposes CatBoost, XGBoost, and LightGBM MAE/MAPE metrics.", body_style)],
        [Paragraph("Fleet", body_style), Paragraph("/api/fleet", body_style), Paragraph("GET", body_style), Paragraph("Returns active dry bulk vessel fleet position and ETA status.", body_style)],
    ]

    t_api = Table(api_data, colWidths=[70, 150, 55, 200])
    t_api.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor("#F1F5F9")),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('PADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(t_api)

    story.append(Spacer(1, 10))

    # 6. How to Run
    story.append(Paragraph("6. Deployment & Execution Guide", h1_style))
    story.append(Paragraph("<b>Development Mode (3 Terminals):</b>", h2_style))
    dev_code = """# Terminal 1: Python FastAPI ML Engine
python backend/main.py   (http://localhost:8000)

# Terminal 2: Node.js Express Gateway
cd backend && npm run dev   (http://localhost:5000)

# Terminal 3: React Frontend UI
cd frontend && npm run dev   (http://localhost:5173)"""
    story.append(Paragraph(dev_code.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_style))

    story.append(Paragraph("<b>Docker Containerized Mode (Single Command):</b>", h2_style))
    docker_code = """docker-compose up --build"""
    story.append(Paragraph(docker_code.replace("\n", "<br/>").replace(" ", "&nbsp;"), code_style))

    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"✅ PDF successfully generated at: {pdf_path.absolute()}")
    return pdf_path.absolute()


if __name__ == "__main__":
    build_pdf()
