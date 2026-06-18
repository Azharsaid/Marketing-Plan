#!/usr/bin/env python3
"""Convert IQVIA Excel extracts to a compact browser-ready JSON/JS file.
No external spreadsheet libraries are required; it reads XLSX OpenXML directly.

Expected file names: JO-MAT-04.xlsx, JO-YTD-04.xlsx, KSA-MAT-04.xlsx, etc.
Output: data/iqvia-data.js containing window.IQVIA_DATA.
"""
import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from pathlib import Path

NS = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'
REL_NS = 'http://schemas.openxmlformats.org/package/2006/relationships'
OFFICE_REL_NS = 'http://schemas.openxmlformats.org/officeDocument/2006/relationships'

SCHEMA = [
    'atc1','atc2','atc3','atc4','molecule','product','manufacturer','sku','pack','nfc',
    'py1Usd','cyUsd','py1Unit','cyUnit','py2Usd','py2Unit','companyBrand','strength','dosage','brandName','month'
]

COUNTRY_ALIASES = {
    'JORDAN': 'JO', 'JO': 'JO',
    'SAUDI ARABIA': 'KSA', 'KSA': 'KSA', 'SAUDI': 'KSA',
    'UAE': 'UAE', 'UNITED ARAB EMIRATES': 'UAE',
    'IRAQ': 'IRQ', 'IRQ': 'IRQ',
    'ALGERIA': 'ALG', 'ALG': 'ALG',
}

def col_to_num(col: str) -> int:
    n = 0
    for ch in col:
        n = n * 26 + ord(ch) - 64
    return n

def cell_text(cell, shared):
    t = cell.attrib.get('t')
    v = cell.find(f'{{{NS}}}v')
    if t == 's' and v is not None and v.text not in (None, ''):
        return shared[int(v.text)]
    if t == 'inlineStr':
        return ''.join(tn.text or '' for tn in cell.iter(f'{{{NS}}}t'))
    if v is not None and v.text is not None:
        return v.text
    return ''

def read_xlsx_rows(path: Path):
    with zipfile.ZipFile(path) as z:
        shared = []
        if 'xl/sharedStrings.xml' in z.namelist():
            root = ET.fromstring(z.read('xl/sharedStrings.xml'))
            for si in root.findall(f'{{{NS}}}si'):
                shared.append(''.join(t.text or '' for t in si.iter(f'{{{NS}}}t')))

        # Resolve first worksheet path robustly.
        wb = ET.fromstring(z.read('xl/workbook.xml'))
        rels = ET.fromstring(z.read('xl/_rels/workbook.xml.rels'))
        rid_target = {r.attrib['Id']: r.attrib['Target'] for r in rels}
        first_sheet = wb.find(f'{{{NS}}}sheets').find(f'{{{NS}}}sheet')
        rid = first_sheet.attrib.get(f'{{{OFFICE_REL_NS}}}id')
        target = rid_target[rid]
        ws_path = ('xl/' + target) if not target.startswith('/') else target[1:]

        header = None
        for _, elem in ET.iterparse(z.open(ws_path), events=('end',)):
            if elem.tag == f'{{{NS}}}row':
                row = []
                for cell in elem.findall(f'{{{NS}}}c'):
                    ref = cell.attrib.get('r', '')
                    m = re.match(r'([A-Z]+)(\d+)', ref)
                    col_idx = col_to_num(m.group(1)) if m else len(row) + 1
                    while len(row) < col_idx - 1:
                        row.append('')
                    row.append(cell_text(cell, shared))
                while row and row[-1] == '':
                    row.pop()
                if header is None:
                    header = row
                else:
                    yield {header[i]: (row[i] if i < len(row) else '') for i in range(len(header))}
                elem.clear()

def to_number(value):
    if value is None or value == '':
        return 0.0
    try:
        return float(str(value).replace(',', '').strip())
    except Exception:
        return 0.0

def norm_country(value):
    v = (value or '').strip().upper()
    return COUNTRY_ALIASES.get(v, v[:3] if v else '')

def infer_country_period(path: Path, rows_sample):
    name = path.stem.upper()
    period = 'MAT' if 'MAT' in name else ('YTD' if 'YTD' in name else 'DATA')
    country = None
    for key in ['KSA', 'UAE', 'JO', 'IRQ', 'ALG']:
        if name.startswith(key):
            country = key
            break
    if not country and rows_sample:
        country = norm_country(rows_sample.get('Country'))
    return country or 'UNK', period

def convert_folder(input_folder: Path, out_file: Path):
    data = {
        'generatedAt': datetime.now(timezone.utc).isoformat(),
        'schema': SCHEMA,
        'sources': [],
        'data': {},
    }
    files = sorted(input_folder.glob('*.xlsx'))
    if not files:
        raise SystemExit(f'No .xlsx files found in {input_folder}')

    for path in files:
        all_rows = []
        first_row = None
        total = filtered = excluded_sector = excluded_formula = 0
        for r in read_xlsx_rows(path):
            if first_row is None:
                first_row = r
            total += 1
            sector = (r.get('Sector') or '').strip().upper()
            formula = (r.get('Formula Type') or '').strip().upper()
            if sector != 'RETAIL':
                excluded_sector += 1
                continue
            if formula != 'MEDICINE FORMULAS':
                excluded_formula += 1
                continue
            filtered += 1
            all_rows.append([
                r.get('Anatomical Therapeutic Chemical') or '',
                r.get('ATC2') or '',
                r.get('ATC3') or '',
                r.get('ATC4') or '',
                r.get('Molecule List') or '',
                r.get('Products') or '',
                r.get('Manufacturer') or '',
                r.get('SKU') or '',
                r.get('Pack') or '',
                r.get('NFC') or '',
                round(to_number(r.get('PY1 USD')), 4),
                round(to_number(r.get('CY USD')), 4),
                round(to_number(r.get('PY1 Unit')), 4),
                round(to_number(r.get('CY Unit')), 4),
                round(to_number(r.get('PY2 USD')), 4),
                round(to_number(r.get('PY2 Unit')), 4),
                r.get('Company Brand') or '',
                r.get('Strength') or '',
                r.get('By Dosage') or '',
                r.get('Brand Name') or '',
                r.get('Month') or '',
            ])
        country, period = infer_country_period(path, first_row)
        data['data'].setdefault(country, {})[period] = {'rows': all_rows}
        data['sources'].append({
            'file': path.name,
            'country': country,
            'period': period,
            'totalRows': total,
            'keptRetailMedicineRows': filtered,
            'excludedNonRetailRows': excluded_sector,
            'excludedOtherFormulaRows': excluded_formula,
        })

    json_payload = json.dumps(data, ensure_ascii=False, separators=(',', ':'))
    out_file.parent.mkdir(parents=True, exist_ok=True)
    out_file.write_text('window.IQVIA_DATA = ' + json_payload + ';\n', encoding='utf-8')
    print(f'Wrote {out_file} ({out_file.stat().st_size:,} bytes)')

if __name__ == '__main__':
    folder = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('iqvia_unzipped')
    out = Path(sys.argv[2]) if len(sys.argv) > 2 else Path('data/iqvia-data.js')
    convert_folder(folder, out)
