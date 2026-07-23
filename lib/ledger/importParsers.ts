export type ParsedImportRow = {
  postedAt: string;
  amount: number;
  description: string;
  merchant?: string;
  externalId?: string;
};

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
}

function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/[$,]/g, '').trim();
  if (!cleaned) return null;
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : null;
}

function parseDate(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  // Already ISO-ish
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.slice(0, 10);
  }

  // MM/DD/YYYY
  const us = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (us) {
    const [, m, d, y] = us;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }

  const parsed = new Date(trimmed);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString().slice(0, 10);
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (ch === ',' && !inQuotes) {
      cells.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  cells.push(current);
  return cells;
}

/**
 * Parse a simple bank CSV. Looks for date/amount/description columns by header name.
 * Amounts are kept signed: positive = inflow, negative = outflow when the file uses that convention.
 * If a separate Debit/Credit pair exists, debit becomes negative and credit positive.
 */
export function parseBankCsv(text: string): ParsedImportRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 2) {
    throw new Error('CSV must include a header row and at least one data row.');
  }

  const headers = splitCsvLine(lines[0]).map(normalizeHeader);
  const indexOf = (...candidates: string[]) =>
    headers.findIndex((h) => candidates.includes(h));

  const dateIdx = indexOf('date', 'postedat', 'posteddate', 'transactiondate');
  const amountIdx = indexOf('amount', 'value');
  const debitIdx = indexOf('debit', 'withdrawal', 'outflow');
  const creditIdx = indexOf('credit', 'deposit', 'inflow');
  const descIdx = indexOf(
    'description',
    'memo',
    'name',
    'payee',
    'merchant',
    'details',
  );
  const merchantIdx = indexOf('merchant', 'payee');
  const idIdx = indexOf('id', 'transactionid', 'fitid', 'externalid');

  if (dateIdx === -1) {
    throw new Error('CSV is missing a Date column.');
  }
  if (amountIdx === -1 && debitIdx === -1 && creditIdx === -1) {
    throw new Error('CSV is missing an Amount (or Debit/Credit) column.');
  }

  const rows: ParsedImportRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    const postedAt = parseDate(cells[dateIdx] ?? '');
    if (!postedAt) continue;

    let amount: number | null = null;
    if (amountIdx !== -1) {
      amount = parseAmount(cells[amountIdx] ?? '');
    } else {
      const debit = parseAmount(cells[debitIdx] ?? '');
      const credit = parseAmount(cells[creditIdx] ?? '');
      if (debit != null && debit !== 0) amount = -Math.abs(debit);
      else if (credit != null) amount = Math.abs(credit);
    }

    if (amount == null || amount === 0) continue;

    const description =
      (descIdx !== -1 ? cells[descIdx] : '')?.trim() || 'Imported transaction';
    const merchant =
      merchantIdx !== -1 ? cells[merchantIdx]?.trim() || undefined : undefined;
    const externalId =
      idIdx !== -1 ? cells[idIdx]?.trim() || undefined : undefined;

    rows.push({
      postedAt,
      amount,
      description,
      merchant,
      externalId: externalId || `csv-${postedAt}-${amount}-${description}`.slice(0, 180),
    });
  }

  if (rows.length === 0) {
    throw new Error('No valid transactions found in CSV.');
  }

  return rows;
}

/**
 * Minimal OFX/QFX parser for STMTTRN blocks (Wealthfront Quicken export).
 * Amounts follow OFX sign: positive credit (in), negative debit (out).
 */
export function parseOfxOrQfx(text: string): ParsedImportRow[] {
  const blocks = text.match(/<STMTTRN>[\s\S]*?<\/STMTTRN>/gi) ?? [];
  if (blocks.length === 0) {
    // Some QFX files omit closing tags — split on STMTTRN open tags instead.
    const loose = text.split(/<STMTTRN>/i).slice(1);
    if (loose.length === 0) {
      throw new Error('No STMTTRN transactions found in OFX/QFX file.');
    }
    return loose.map(parseOfxTxnFragment).filter(Boolean) as ParsedImportRow[];
  }

  return blocks
    .map(parseOfxTxnFragment)
    .filter(Boolean) as ParsedImportRow[];
}

function parseOfxTag(fragment: string, tag: string): string | null {
  const re = new RegExp(`<${tag}>([^<\\r\\n]+)`, 'i');
  const match = fragment.match(re);
  return match ? match[1].trim() : null;
}

function parseOfxTxnFragment(fragment: string): ParsedImportRow | null {
  const amountRaw = parseOfxTag(fragment, 'TRNAMT');
  const dateRaw =
    parseOfxTag(fragment, 'DTPOSTED') ?? parseOfxTag(fragment, 'DTUSER');
  const fitid = parseOfxTag(fragment, 'FITID');
  const name = parseOfxTag(fragment, 'NAME');
  const memo = parseOfxTag(fragment, 'MEMO');

  if (!amountRaw || !dateRaw) return null;
  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount === 0) return null;

  const yyyy = dateRaw.slice(0, 4);
  const mm = dateRaw.slice(4, 6);
  const dd = dateRaw.slice(6, 8);
  const postedAt = `${yyyy}-${mm}-${dd}`;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(postedAt)) return null;

  const description = [name, memo].filter(Boolean).join(' — ') || 'OFX import';

  return {
    postedAt,
    amount,
    description,
    merchant: name || undefined,
    externalId: fitid || `ofx-${postedAt}-${amount}-${description}`.slice(0, 180),
  };
}

export function parseImportFile(filename: string, text: string): ParsedImportRow[] {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.csv')) return parseBankCsv(text);
  if (lower.endsWith('.ofx') || lower.endsWith('.qfx')) return parseOfxOrQfx(text);
  // Sniff content
  if (text.includes('<OFX') || text.includes('<STMTTRN')) return parseOfxOrQfx(text);
  return parseBankCsv(text);
}
