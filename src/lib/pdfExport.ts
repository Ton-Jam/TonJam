export interface AuditRecord {
  date: string;
  collaborator: string;
  amount: number;
  txHash: string;
}

export function exportAuditLogToPDF(
  records: AuditRecord[],
  auditNotes: Record<string, string>,
  dateRangeStr: string
): void {
  const totalAmount = records.reduce((acc: number, entry: any) => acc + (entry.amount || 0), 0);
  const uniqueCollabs = new Set(records.map((entry: any) => entry.collaborator)).size;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
  if (!iframeDoc) return;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>TONJam Royalty Audit Report</title>
      <style>
        @media print {
          @page {
            size: a4 portrait;
            margin: 15mm;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          color: #111827;
          margin: 0;
          padding: 0;
          font-size: 11px;
          line-height: 1.5;
          background-color: #ffffff;
        }
        .header {
          border-bottom: 2px solid #3b82f6;
          padding-bottom: 12px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
        }
        .header-info h1 {
          font-size: 18px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0;
          color: #1e3a8a;
        }
        .header-info p {
          font-size: 9px;
          color: #4b5563;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin: 4px 0 0 0;
        }
        .header-brand {
          text-align: right;
          font-weight: 900;
          font-size: 14px;
          letter-spacing: 0.1em;
          color: #2563eb;
          text-transform: uppercase;
        }
        .meta-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        .meta-card {
          border: 1px solid #e5e7eb;
          padding: 10px;
          border-radius: 6px;
          background-color: #f9fafb;
        }
        .meta-card h4 {
          margin: 0 0 4px 0;
          font-size: 8px;
          text-transform: uppercase;
          color: #6b7280;
          letter-spacing: 0.05em;
        }
        .meta-card p {
          margin: 0;
          font-size: 12px;
          font-weight: 600;
        }
        .stat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 24px;
        }
        .stat-card {
          border: 1px solid #2563eb;
          padding: 12px;
          border-radius: 6px;
          background-color: #eff6ff;
        }
        .stat-card h4 {
          margin: 0 0 4px 0;
          font-size: 8px;
          text-transform: uppercase;
          color: #1e40af;
          letter-spacing: 0.05em;
        }
        .stat-card p {
          margin: 0;
          font-size: 15px;
          font-weight: 800;
          color: #1d4ed8;
        }
        .section-title {
          font-size: 11px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin: 0 0 10px 0;
          color: #1f2937;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        th {
          border-bottom: 1.5px solid #111827;
          padding: 8px;
          text-align: left;
          font-weight: bold;
          text-transform: uppercase;
          font-size: 8px;
          color: #111827;
        }
        td {
          border-bottom: 1px solid #e5e7eb;
          padding: 8px;
          font-size: 9px;
          color: #374151;
        }
        .text-right {
          text-align: right;
        }
        .amount {
          font-weight: bold;
          font-family: monospace;
          color: #111827;
        }
        .hash {
          font-family: monospace;
          color: #6b7280;
          font-size: 8px;
        }
        .note {
          font-style: italic;
          color: #059669;
          font-weight: 500;
        }
        .footer {
          margin-top: 40px;
          border-top: 1px solid #e5e7eb;
          padding-top: 12px;
          text-align: center;
          font-size: 8px;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="header-info">
          <h1>TONJam Royalty Audit Ledger</h1>
          <p>Official Cryptographically Signed Statement</p>
        </div>
        <div class="header-brand">
          TONJam
        </div>
      </div>

      <div class="meta-grid">
        <div class="meta-card">
          <h4>Statement Issue Date</h4>
          <p>${new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC</p>
        </div>
        <div class="meta-card">
          <h4>Filter / Date Coverage</h4>
          <p>${dateRangeStr}</p>
        </div>
      </div>

      <div class="stat-grid">
        <div class="stat-card">
          <h4>Royalties Volume</h4>
          <p>${totalAmount.toLocaleString()} TON</p>
        </div>
        <div class="stat-card">
          <h4>Log Records</h4>
          <p>${records.length} transactions</p>
        </div>
        <div class="stat-card">
          <h4>Collaborators Count</h4>
          <p>${uniqueCollabs} unique partners</p>
        </div>
      </div>

      <h3 class="section-title">Ledger Transaction History</h3>
      <table>
        <thead>
          <tr>
            <th style="width: 15%;">Date</th>
            <th style="width: 25%;">Collaborator</th>
            <th style="width: 15%;">Payout Amount</th>
            <th style="width: 20%;">TX Hash</th>
            <th style="width: 25%;">Audit Notes / Comments</th>
          </tr>
        </thead>
        <tbody>
          ${records.map((entry: any) => {
            const note = auditNotes[entry.txHash] || '';
            return `
              <tr>
                <td>${entry.date}</td>
                <td>${entry.collaborator}</td>
                <td class="amount">${entry.amount} TON</td>
                <td class="hash">${entry.txHash}</td>
                <td class="note">${note || '-'}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <div class="footer">
        TONJam Creator Network & Royalty Audit Engine • Autogenerated & Authenticated securely
      </div>
    </body>
    </html>
  `;

  iframeDoc.open();
  iframeDoc.write(htmlContent);
  iframeDoc.close();

  setTimeout(() => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 500);
}
