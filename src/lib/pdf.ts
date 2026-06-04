/**
 * Simple tabular PDF export. jsPDF is heavy, so it's loaded on demand the first
 * time a user exports. NOTE: jsPDF's built-in fonts are Latin-only, so Korean
 * glyphs may not render — pass ASCII headers for PDF where possible.
 */
export async function exportTablePDF(opts: {
  title: string;
  subtitle?: string;
  head: string[];
  body: Array<Array<string | number>>;
  filename: string;
}): Promise<void> {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  doc.setFontSize(16);
  doc.text(opts.title, 40, 48);
  if (opts.subtitle) {
    doc.setFontSize(10);
    doc.setTextColor(120);
    doc.text(opts.subtitle, 40, 66);
    doc.setTextColor(0);
  }
  autoTable(doc, {
    head: [opts.head],
    body: opts.body.map((r) => r.map((c) => String(c))),
    startY: opts.subtitle ? 82 : 64,
    styles: { fontSize: 9, cellPadding: 5 },
    headStyles: { fillColor: [124, 71, 48] },
  });
  doc.save(opts.filename.endsWith('.pdf') ? opts.filename : `${opts.filename}.pdf`);
}
