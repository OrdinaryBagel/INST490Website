#!/usr/bin/env python3
"""Extract Table 3c from data.pdf to a tidy congressional-district CSV.

Usage: python clean_htc_pdf.py data.pdf output.csv
Requires: PyMuPDF (pip install pymupdf).

The PDF's source is the 2011-2015 ACS, NOT 2024. Its districts must not be
joined to 119th Congress districts by state/district number without a crosswalk.
"""
import argparse
import csv
from collections import defaultdict
from decimal import Decimal, ROUND_HALF_UP
import re
import fitz
from urllib.request import urlretrieve

COLUMNS = [
    'state', 'district', 'congressional_district',
    'asian_alone_or_combination', 'asian_htc_population',
    'asian_htc_percent', 'source_page',
]

def extract(input_pdf):
    doc = fitz.open(input_pdf)
    rows = []
    total = None
    for page_num, page in enumerate(doc, 1):
        # Each word retains its on-page location; this is more reliable than
        # parsing wrapped state names from plain text.
        by_y = defaultdict(list)
        for w in page.get_text('words'):
            x0, y0, x1, y1, word, *_ = w
            if y0 < 225 or y0 > 740:
                continue
            by_y[round(y0, 1)].append((x0, word))
        active = None
        for y, words in sorted(by_y.items()):
            cols = [[] for _ in range(5)]
            for x, word in sorted(words):
                idx = 0 if x < 170 else 1 if x < 220 else 2 if x < 320 else 3 if x < 420 else 4
                cols[idx].append(word)
            cells = [' '.join(c) for c in cols]
            state, district, population, htc, percent = cells
            if state == 'Total':
                total = (int(population.replace(',', '')), int(htc.replace(',', '')), Decimal(percent))
                active = None
                break
            if re.fullmatch(r'\d{2}', district) and re.fullmatch(r'[\d,]+', population) and re.fullmatch(r'[\d,]+|-', htc) and re.fullmatch(r'\d+\.\d', percent):
                if not state:
                    raise ValueError(f'No state on PDF page {page_num}, y={y}')
                active = dict(state=state, district=district,
                              asian_alone_or_combination=int(population.replace(',', '')),
                              asian_htc_population=0 if htc == '-' else int(htc.replace(',', '')),
                              asian_htc_percent=Decimal(percent), source_page=page_num)
                rows.append(active)
            elif active and state and not any(cells[1:]):
                # Some states wrap to a second line (New Hampshire, DC).
                active['state'] += ' ' + state
            elif any(cells) and not district and not population and not htc and not percent:
                # Ignore the source and methodology footnotes after the last row.
                continue
    for row in rows:
        row['state'] = ' '.join(row['state'].split())
        row['congressional_district'] = f"Congressional District {int(row['district'])}, {row['state']}" if row['district'] != '00' else f"At-large Congressional District, {row['state']}"
        if row['district'] == '98':
            row['congressional_district'] = 'District of Columbia delegate district'
        if row['asian_htc_population'] > row['asian_alone_or_combination']:
            raise ValueError(f"Invalid HTC count: {row}")
        calculated = (Decimal(100) * row['asian_htc_population'] / row['asian_alone_or_combination']).quantize(Decimal('0.1'), rounding=ROUND_HALF_UP)
        if abs(calculated - row['asian_htc_percent']) > Decimal('0.1'):
            raise ValueError(f"Unexpected percentage in {row['state']} {row['district']}: {calculated} vs {row['asian_htc_percent']}")
    ids = [(r['state'],r['district']) for r in rows]
    if len(ids) != len(set(ids)):
        raise ValueError('Duplicate state/district rows')
    if total is None:
        raise ValueError('PDF Total row not found')
    sums = (sum(r['asian_alone_or_combination'] for r in rows), sum(r['asian_htc_population'] for r in rows))
    if sums != total[:2]:
        raise ValueError(f'Counts do not reconcile: extracted {sums}, PDF totals {total[:2]}')
    return rows,total

def main():
    p = argparse.ArgumentParser(description=__doc__)
    url = "https://civilrightsdocs.info/pdf/census/2020/Table3c-Congressional-Districts-Number-Percent-Asians-HTC.pdf"
    filename = "data.pdf"
    urlretrieve(url, filename)
    p.add_argument('pdf', nargs='?', default='data.pdf')
    p.add_argument('csv', nargs='?', default='Asian_Hard_To_Count_Congressional_Districts_Clean.csv')
    args = p.parse_args()
    rows,total = extract(args.pdf)
    with open(args.csv, 'w', newline='', encoding='utf-8') as f:
        writer = csv.DictWriter(f, fieldnames=COLUMNS)
        writer.writeheader()
        for row in rows:
            writer.writerow({**row,'asian_htc_percent':format(row['asian_htc_percent'],'.1f')})
    print(f'Wrote {len(rows)} congressional-district rows to {args.csv}')
    print(f'PDF totals: population={total[0]:,}; HTC={total[1]:,}; percent={total[2]}%')
    print(f"Unique states/territories: {len(set(r['state'] for r in rows))}")

if __name__ == '__main__':
    main()
