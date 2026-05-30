from __future__ import annotations

from datetime import datetime, timezone
from html import escape
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


OUT = Path("EMC2Ops_Channel_Growth_Strategy.docx")


def w_text(text: str) -> str:
    return escape(text, quote=False)


def r(text: str, bold: bool = False, color: str | None = None, size: int | None = None) -> str:
    props = []
    if bold:
        props.append("<w:b/>")
    if color:
        props.append(f'<w:color w:val="{color}"/>')
    if size:
        props.append(f'<w:sz w:val="{size * 2}"/>')
    rpr = f"<w:rPr>{''.join(props)}</w:rPr>" if props else ""
    preserve = ' xml:space="preserve"' if text.startswith(" ") or text.endswith(" ") else ""
    return f"<w:r>{rpr}<w:t{preserve}>{w_text(text)}</w:t></w:r>"


def p(
    text: str = "",
    style: str | None = None,
    runs: list[str] | None = None,
    spacing_after: int | None = None,
    spacing_before: int | None = None,
    num: bool = False,
    keep_next: bool = False,
) -> str:
    pr = []
    if style:
        pr.append(f'<w:pStyle w:val="{style}"/>')
    if keep_next:
        pr.append("<w:keepNext/>")
    if num:
        pr.append('<w:numPr><w:ilvl w:val="0"/><w:numId w:val="1"/></w:numPr>')
    spacing = []
    if spacing_before is not None:
        spacing.append(f'w:before="{spacing_before}"')
    if spacing_after is not None:
        spacing.append(f'w:after="{spacing_after}"')
    if spacing:
        pr.append(f"<w:spacing {' '.join(spacing)}/>")
    ppr = f"<w:pPr>{''.join(pr)}</w:pPr>" if pr else ""
    body = "".join(runs) if runs is not None else (r(text) if text else "")
    return f"<w:p>{ppr}{body}</w:p>"


def heading(text: str, level: int) -> str:
    return p(text, style=f"Heading{level}", keep_next=True)


def bullet(text: str) -> str:
    return p(text, num=True, spacing_after=80)


def callout(label: str, body: str) -> str:
    return (
        '<w:tbl><w:tblPr><w:tblW w:w="9360" w:type="dxa"/>'
        '<w:tblBorders><w:top w:val="single" w:sz="8" w:color="D8DEE9"/>'
        '<w:left w:val="single" w:sz="8" w:color="D8DEE9"/>'
        '<w:bottom w:val="single" w:sz="8" w:color="D8DEE9"/>'
        '<w:right w:val="single" w:sz="8" w:color="D8DEE9"/>'
        '<w:insideH w:val="nil"/><w:insideV w:val="nil"/></w:tblBorders>'
        '<w:tblCellMar><w:top w:w="180" w:type="dxa"/><w:left w:w="220" w:type="dxa"/>'
        '<w:bottom w:w="180" w:type="dxa"/><w:right w:w="220" w:type="dxa"/></w:tblCellMar></w:tblPr>'
        '<w:tblGrid><w:gridCol w:w="9360"/></w:tblGrid><w:tr><w:tc>'
        '<w:tcPr><w:tcW w:w="9360" w:type="dxa"/><w:shd w:fill="F4F7FB"/></w:tcPr>'
        + p(label.upper(), runs=[r(label.upper(), bold=True, color="64748B", size=9)], spacing_after=60)
        + p(body, runs=[r(body, bold=True, color="0B2545", size=13)], spacing_after=0)
        + "</w:tc></w:tr></w:tbl>"
    )


def table(headers: list[str], rows: list[list[str]], widths: list[int]) -> str:
    total = sum(widths)
    out = [
        '<w:tbl><w:tblPr><w:tblW w:w="9360" w:type="dxa"/>'
        '<w:tblInd w:w="120" w:type="dxa"/>'
        '<w:tblBorders><w:top w:val="single" w:sz="6" w:color="CFD8E3"/>'
        '<w:left w:val="single" w:sz="6" w:color="CFD8E3"/>'
        '<w:bottom w:val="single" w:sz="6" w:color="CFD8E3"/>'
        '<w:right w:val="single" w:sz="6" w:color="CFD8E3"/>'
        '<w:insideH w:val="single" w:sz="6" w:color="CFD8E3"/>'
        '<w:insideV w:val="single" w:sz="6" w:color="CFD8E3"/></w:tblBorders>'
        '<w:tblCellMar><w:top w:w="100" w:type="dxa"/><w:left w:w="130" w:type="dxa"/>'
        '<w:bottom w:w="100" w:type="dxa"/><w:right w:w="130" w:type="dxa"/></w:tblCellMar>'
        "</w:tblPr><w:tblGrid>"
    ]
    for width in widths:
        out.append(f'<w:gridCol w:w="{width}"/>')
    out.append("</w:tblGrid><w:tr>")
    for header, width in zip(headers, widths):
        out.append(
            f'<w:tc><w:tcPr><w:tcW w:w="{width}" w:type="dxa"/><w:shd w:fill="F2F4F7"/></w:tcPr>'
            + p(header, runs=[r(header, bold=True, color="0B2545")], spacing_after=0)
            + "</w:tc>"
        )
    out.append("</w:tr>")
    for row in rows:
        out.append("<w:tr>")
        for cell, width in zip(row, widths):
            out.append(
                f'<w:tc><w:tcPr><w:tcW w:w="{width}" w:type="dxa"/></w:tcPr>'
                + p(cell, spacing_after=0)
                + "</w:tc>"
            )
        out.append("</w:tr>")
    out.append("</w:tbl>")
    assert total == 9360
    return "".join(out)


def page_break() -> str:
    return ""


def document_xml() -> str:
    parts = [
        p("EMC2Ops Channel Growth Strategy", style="Title"),
        p(
            "A 90-day organic content and audience-building plan for LinkedIn, X, and Instagram.",
            style="Subtitle",
        ),
        p(
            "Prepared for EMC2Ops | Focus: AI automation for property management operations",
            runs=[r("Prepared for EMC2Ops | Focus: AI automation for property management operations", color="6B7280", size=9)],
            spacing_after=240,
        ),
        callout(
            "Core Positioning",
            "EMC2Ops helps property management companies automate leasing, maintenance, tenant communication, and CRM workflows so teams respond faster and do less manual admin work.",
        ),
        heading("Strategic Focus", 1),
        p(
            "EMC2Ops should not market as a generic AI automation company. The strongest angle is specific operational pain inside property management. Every channel should make property managers feel that EMC2Ops understands the daily workflow issues that cost time, leads, and revenue."
        ),
        p(
            "The main conversion goal across all channels should be simple: drive qualified visitors to book a free ops audit on the EMC2Ops website."
        ),
        heading("Primary Problems to Own", 2),
        bullet("Missed leasing calls and slow lead follow-up."),
        bullet("Maintenance request intake and routing chaos."),
        bullet("Tenant communication overload."),
        bullet("Manual CRM updates and inconsistent pipeline visibility."),
        bullet("Owner and vendor update delays."),
        heading("Channel Roles", 1),
        table(
            ["Channel", "Role", "Best Content"],
            [
                [
                    "LinkedIn",
                    "Primary B2B trust and lead-generation channel.",
                    "Founder POV, workflow breakdowns, property management pain posts, audit checklists, and simple case-study style posts.",
                ],
                [
                    "X",
                    "Fast feedback, daily visibility, and relationship building with operators, founders, proptech people, and AI builders.",
                    "Short observations, build-in-public updates, automation lessons, reposted LinkedIn ideas, and replies to relevant operators.",
                ],
                [
                    "Instagram",
                    "Visual proof and simple explanations for busy operators.",
                    "Reels, carousel diagrams, before/after workflows, founder videos, and screenshots of automation flows.",
                ],
            ],
            [1700, 3100, 4560],
        ),
        page_break(),
        heading("Content Pillars", 1),
        heading("1. Pain", 2),
        p("Describe workflow problems property managers already feel: missed calls, slow responses, scattered maintenance requests, and CRM gaps."),
        heading("2. Workflow Breakdowns", 2),
        p("Show simple process maps: missed call to text-back, lead qualification, showing booked, CRM updated, and team alerted."),
        heading("3. Education", 2),
        p("Explain the difference between chatbots and operational automation. A chatbot answers questions. A workflow automation moves the lead, updates the CRM, alerts the team, and books the next step."),
        heading("4. Proof and Demos", 2),
        p("Use mock workflows, dashboard screenshots, Loom-style walkthroughs, and simple diagrams before full client case studies exist."),
        heading("5. Founder POV", 2),
        p("Share what EMC2Ops is building, what conversations with property managers reveal, and what operational problems keep showing up."),
        heading("Posting Cadence", 1),
        bullet("LinkedIn: 4 posts per week."),
        bullet("X: 1 to 3 short posts per day plus meaningful replies."),
        bullet("Instagram: 3 reels per week plus lightweight stories when possible."),
        heading("Weekly Schedule", 2),
        table(
            ["Day", "Theme", "Example Angle"],
            [
                ["Monday", "Property management pain", "Why slow response time causes lost leasing opportunities."],
                ["Tuesday", "Workflow demo", "Missed call to AI text-back to booked showing."],
                ["Wednesday", "Education", "Chatbot versus workflow automation."],
                ["Thursday", "Audit checklist", "Five signs your leasing follow-up process is leaking revenue."],
                ["Friday", "Founder/building in public", "What we learned from mapping property management workflows this week."],
                ["Weekend", "Repurpose", "Turn the best post into a reel, carousel, or short X thread."],
            ],
            [1450, 2850, 5060],
        ),
        page_break(),
        heading("Post Examples", 1),
        heading("LinkedIn Example", 2),
        p("Most property management teams do not need “more AI.” They need faster response times."),
        p("A simple missed-call workflow can text back in seconds, qualify the lead, ask move-in date and budget, route to the right person, and log the conversation in the CRM."),
        p("That is the kind of automation EMC2Ops builds."),
        heading("X Example", 2),
        p("Property managers do not lose leads because they lack effort."),
        p("They lose leads because calls, texts, maintenance requests, and CRM updates are scattered across too many manual steps."),
        heading("Instagram Reel Example", 2),
        bullet("Hook: If you manage rentals, this missed call is costing you money."),
        bullet("Visual: Missed call to instant SMS to lead qualified to CRM updated."),
        bullet("CTA: Book a free ops audit at emc2ops.com."),
        heading("Growth Loops", 1),
        bullet("Comment on 20 posts per week from property managers, real estate operators, leasing consultants, proptech founders, and local real estate businesses."),
        bullet("Send 10 useful, non-pitch DMs per week to property managers after engaging with their content."),
        bullet("Turn strong comments into short posts."),
        bullet("Turn strong posts into reels or carousels."),
        bullet("Turn good questions from prospects into educational posts."),
        bullet("Add the EMC2Ops links page to every social profile."),
        page_break(),
        heading("90-Day Targets", 1),
        table(
            ["Phase", "Focus", "Targets"],
            [
                ["Month 1", "Foundation and volume", "Complete profiles, publish 50 to 70 total posts, start 100 targeted conversations, and book 5 to 10 audit calls."],
                ["Month 2", "Proof and repetition", "Publish more demos, document property manager pain points, start an email list, and test light retargeting if traffic exists."],
                ["Month 3", "Conversion assets", "Publish client stories or anonymized case studies, create a checklist lead magnet, and double down on posts that create qualified conversations."],
            ],
            [1700, 2600, 5060],
        ),
        callout(
            "Operating Rule",
            "A small audience of the right 500 property management operators is more valuable than 10,000 random AI followers. Optimize for qualified conversations and audit bookings, not vanity metrics.",
        ),
        heading("Measurement Dashboard", 1),
        bullet("Leading metrics: posts shipped, comments left, DMs sent, profile visits, link clicks, and replies."),
        bullet("Conversion metrics: audit form submissions, booked calls, qualified opportunities, and closed clients."),
        bullet("Content metrics: saves, comments, shares, watch time, and posts that generate inbound questions."),
        heading("Source Notes", 1),
        p(
            "LinkedIn recommends maintaining an active Page, reviewing analytics, and using targeting options for organic Page posts. X requires complete profiles and recent posting for creator monetization eligibility. These platform details support the recommendation to keep profiles complete, post consistently, and measure channel performance.",
            runs=[r("LinkedIn recommends maintaining an active Page, reviewing analytics, and using targeting options for organic Page posts. X requires complete profiles and recent posting for creator monetization eligibility. These platform details support the recommendation to keep profiles complete, post consistently, and measure channel performance.", color="5B677A", size=9)],
        ),
    ]
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
        "<w:body>"
        + "".join(parts)
        + '<w:sectPr><w:pgSz w:w="12240" w:h="15840"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="708" w:footer="708" w:gutter="0"/></w:sectPr>'
        + "</w:body></w:document>"
    )


STYLES = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:styles xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:docDefaults><w:rPrDefault><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/><w:color w:val="1F2937"/></w:rPr></w:rPrDefault><w:pPrDefault><w:pPr><w:spacing w:after="120" w:line="264" w:lineRule="auto"/></w:pPr></w:pPrDefault></w:docDefaults>
  <w:style w:type="paragraph" w:default="1" w:styleId="Normal"><w:name w:val="Normal"/><w:qFormat/><w:rPr><w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/><w:sz w:val="22"/><w:color w:val="1F2937"/></w:rPr><w:pPr><w:spacing w:after="120" w:line="264" w:lineRule="auto"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="Title"><w:name w:val="Title"/><w:basedOn w:val="Normal"/><w:qFormat/><w:rPr><w:b/><w:sz w:val="48"/><w:color w:val="0B2545"/></w:rPr><w:pPr><w:spacing w:after="160" w:line="252" w:lineRule="auto"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="Subtitle"><w:name w:val="Subtitle"/><w:basedOn w:val="Normal"/><w:qFormat/><w:rPr><w:sz w:val="25"/><w:color w:val="4B5563"/></w:rPr><w:pPr><w:spacing w:after="220" w:line="276" w:lineRule="auto"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading1"><w:name w:val="heading 1"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:rPr><w:b/><w:sz w:val="32"/><w:color w:val="2E74B5"/></w:rPr><w:pPr><w:keepNext/><w:spacing w:before="320" w:after="120"/></w:pPr></w:style>
  <w:style w:type="paragraph" w:styleId="Heading2"><w:name w:val="heading 2"/><w:basedOn w:val="Normal"/><w:next w:val="Normal"/><w:qFormat/><w:rPr><w:b/><w:sz w:val="26"/><w:color w:val="1F4D78"/></w:rPr><w:pPr><w:keepNext/><w:spacing w:before="220" w:after="80"/></w:pPr></w:style>
</w:styles>
"""


NUMBERING = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:numbering xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:abstractNum w:abstractNumId="1">
    <w:multiLevelType w:val="singleLevel"/>
    <w:lvl w:ilvl="0"><w:start w:val="1"/><w:numFmt w:val="bullet"/><w:lvlText w:val="•"/><w:lvlJc w:val="left"/><w:pPr><w:tabs><w:tab w:val="num" w:pos="720"/></w:tabs><w:ind w:left="720" w:hanging="360"/></w:pPr><w:rPr><w:rFonts w:ascii="Symbol" w:hAnsi="Symbol"/></w:rPr></w:lvl>
  </w:abstractNum>
  <w:num w:numId="1"><w:abstractNumId w:val="1"/></w:num>
</w:numbering>
"""


CONTENT_TYPES = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
  <Override PartName="/word/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.styles+xml"/>
  <Override PartName="/word/numbering.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.numbering+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>
"""


RELS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
"""


DOC_RELS = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/numbering" Target="numbering.xml"/>
</Relationships>
"""


def core_xml() -> str:
    now = datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    return f"""<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>EMC2Ops Channel Growth Strategy</dc:title>
  <dc:creator>OpenAI Codex</dc:creator>
  <cp:lastModifiedBy>OpenAI Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">{now}</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">{now}</dcterms:modified>
</cp:coreProperties>
"""


APP = """<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>OpenAI Codex</Application>
</Properties>
"""


def main() -> None:
    with ZipFile(OUT, "w", ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", CONTENT_TYPES)
        z.writestr("_rels/.rels", RELS)
        z.writestr("word/_rels/document.xml.rels", DOC_RELS)
        z.writestr("word/document.xml", document_xml())
        z.writestr("word/styles.xml", STYLES)
        z.writestr("word/numbering.xml", NUMBERING)
        z.writestr("docProps/core.xml", core_xml())
        z.writestr("docProps/app.xml", APP)


if __name__ == "__main__":
    main()
