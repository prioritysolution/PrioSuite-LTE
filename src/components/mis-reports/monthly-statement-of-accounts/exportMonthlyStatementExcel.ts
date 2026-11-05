import type { MonthlyStatementData, StatementSidePairRow } from "@/container/mis-reports/monthly-statement-of-accounts/MonthlyStatementType";

const fmt = (val: number | undefined | null) => {
  if (val === undefined || val === null || val === 0) return "";
  return new Intl.NumberFormat("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);
};

const html = (value: string) => value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");

export const exportMonthlyStatementToExcel = (report: MonthlyStatementData) => {
  const { summary, pairedRows } = report;

  const rowsToRender: StatementSidePairRow[] = [...pairedRows];
  while (rowsToRender.length < 24) {
    rowsToRender.push({});
  }

  const tableRowsHtml = rowsToRender
    .map((pair) => {
      const rec = pair.receipt;
      const pay = pair.payment;

      const recLabel = rec ? html(rec.label) : "";
      const recPrev = rec && !rec.isHeader ? fmt(rec.previousMonth) : "";
      const recCurr = rec && !rec.isHeader ? fmt(rec.currentMonth) : "";
      const recCum = rec && !rec.isHeader ? fmt(rec.cumulative) : "";

      const payLabel = pay ? html(pay.label) : "";
      const payPrev = pay && !pay.isHeader ? fmt(pay.previousMonth) : "";
      const payCurr = pay && !pay.isHeader ? fmt(pay.currentMonth) : "";
      const payCum = pay && !pay.isHeader ? fmt(pay.cumulative) : "";

      const recBg = rec?.isHeader ? "background-color: #F1F5F9; font-weight: bold;" : "";
      const payBg = pay?.isHeader ? "background-color: #F1F5F9; font-weight: bold;" : "";

      return `
        <tr>
          <td style="text-align: left; padding: 4px; border: 1px solid #000; ${recBg}">${recLabel}</td>
          <td style="text-align: right; padding: 4px; border: 1px solid #000; ${recBg}">${recPrev}</td>
          <td style="text-align: right; padding: 4px; border: 1px solid #000; font-weight: 600; ${recBg}">${recCurr}</td>
          <td style="text-align: right; padding: 4px; border: 1px solid #000; border-right: 2px solid #000; ${recBg}">${recCum}</td>

          <td style="text-align: left; padding: 4px; border: 1px solid #000; ${payBg}">${payLabel}</td>
          <td style="text-align: right; padding: 4px; border: 1px solid #000; ${payBg}">${payPrev}</td>
          <td style="text-align: right; padding: 4px; border: 1px solid #000; font-weight: 600; ${payBg}">${payCurr}</td>
          <td style="text-align: right; padding: 4px; border: 1px solid #000; ${payBg}">${payCum}</td>
        </tr>
      `;
    })
    .join("");

  const htmlContent = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <style>
          table { border-collapse: collapse; width: 100%; font-family: Arial, sans-serif; font-size: 11px; }
          th, td { border: 1px solid #000000; padding: 4px 6px; }
          .title-org { font-size: 16px; font-weight: bold; text-align: center; }
          .title-sub { font-size: 12px; font-weight: bold; text-align: center; }
          .title-sheet { font-size: 14px; font-weight: bold; text-align: center; text-decoration: underline; }
          .header-receipt { background-color: #DBEAFE; font-weight: bold; text-align: center; font-size: 12px; }
          .header-payment { background-color: #E0E7FF; font-weight: bold; text-align: center; font-size: 12px; }
          .sub-receipt { background-color: #EFF6FF; font-weight: bold; text-align: center; font-size: 10px; }
          .sub-payment { background-color: #EEF2FF; font-weight: bold; text-align: center; font-size: 10px; }
          .total-row { background-color: #BFDBFE; font-weight: bold; font-size: 12px; }
        </style>
      </head>
      <body>
        <table>
          <tr>
            <td colspan="8" class="title-org">${html(report.organizationName)}</td>
          </tr>
          <tr>
            <td colspan="8" class="title-sub">${html(report.organizationAddress)}</td>
          </tr>
          <tr>
            <td colspan="8" class="title-sheet">MONTHLY STATEMENT OF ACCOUNTS</td>
          </tr>
          <tr>
            <td colspan="3" style="text-align: left; font-weight: bold; border: none;">Br. Off. Name: ${html(summary.branchName)}</td>
            <td colspan="3" style="text-align: center; font-weight: bold; border: none;">Period: ${html(summary.fromDate)} to ${html(summary.toDate)}</td>
            <td colspan="2" style="text-align: right; font-weight: bold; border: none;">FY: ${html(report.financialYear.from || "")} to ${html(report.financialYear.to || "")}</td>
          </tr>
          <tr>
            <th colspan="4" class="header-receipt">RECEIPTS</th>
            <th colspan="4" class="header-payment">PAYMENTS</th>
          </tr>
          <tr>
            <th class="sub-receipt" style="text-align: left;">Particulars</th>
            <th class="sub-receipt">Up to Previous Period Rs</th>
            <th class="sub-receipt">This Period Rs</th>
            <th class="sub-receipt">Cumulative Rs</th>
            <th class="sub-payment" style="text-align: left;">Particulars</th>
            <th class="sub-payment">Up to Previous Period Rs</th>
            <th class="sub-payment">This Period Rs</th>
            <th class="sub-payment">Cumulative Rs</th>
          </tr>
          ${tableRowsHtml}
          <tr class="total-row">
            <td style="text-align: center;">TOTAL</td>
            <td style="text-align: right;">${fmt(summary.totalReceiptsPrevious)}</td>
            <td style="text-align: right; font-weight: bold;">${fmt(summary.totalReceiptsCurrent)}</td>
            <td style="text-align: right;">${fmt(summary.totalReceiptsCumulative)}</td>
            <td style="text-align: center;">TOTAL</td>
            <td style="text-align: right;">${fmt(summary.totalPaymentsPrevious)}</td>
            <td style="text-align: right; font-weight: bold;">${fmt(summary.totalPaymentsCurrent)}</td>
            <td style="text-align: right;">${fmt(summary.totalPaymentsCumulative)}</td>
          </tr>
          <tr><td colspan="8">Status: ${html(summary.status)}; Difference: ${fmt(summary.reconciliationDifference) || "0.00"}</td></tr>
          ${report.warnings.map((warning) => `<tr><td colspan="8">${html(warning)}</td></tr>`).join("")}
          <tr><td colspan="8" style="border: none; height: 16px;"></td></tr>
          <tr>
            <td colspan="4" style="border: none; text-align: left; font-weight: bold; padding-top: 15px;">
              Signature of the Manager: ${html(summary.managerName || "")}
            </td>
            <td colspan="4" style="border: none; text-align: right; font-weight: bold; padding-top: 15px;">
              Checked by Accountant: ____________________
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

  const blob = new Blob([htmlContent], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const fileName = `Monthly_Statement_${summary.branchName.replace(/\s+/g, "_")}_${summary.fromDate}_to_${summary.toDate}.xls`;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportMonthlyStatementToCsv = (report: MonthlyStatementData) => {
  const { summary, pairedRows } = report;

  const lines = [
    [`"${report.organizationName.replaceAll('"', '""')}"`],
    [`"${report.organizationAddress.replaceAll('"', '""')}"`],
    [`"MONTHLY STATEMENT OF ACCOUNTS"`],
    [`"Br. Off. Name: ${summary.branchName.replaceAll('"', '""')}"`, `""`, `""`, `""`, `"Period: ${summary.fromDate} to ${summary.toDate}"`, `""`, `""`, `"FY: ${report.financialYear.from || ""} to ${report.financialYear.to || ""}"`],
    [`"RECEIPTS"`, `""`, `""`, `""`, `"PAYMENTS"`, `""`, `""`, `""`],
    [
      `"Particulars"`,
      `"Up to Previous Period Rs"`,
      `"This Period Rs"`,
      `"Cumulative Rs"`,
      `"Particulars"`,
      `"Up to Previous Period Rs"`,
      `"This Period Rs"`,
      `"Cumulative Rs"`,
    ],
    ...pairedRows.map((pair) => {
      const rec = pair.receipt;
      const pay = pair.payment;
      return [
        `"${(rec ? rec.label : "").replaceAll('"', '""')}"`,
        rec && !rec.isHeader ? rec.previousMonth : "",
        rec && !rec.isHeader ? rec.currentMonth : "",
        rec && !rec.isHeader ? rec.cumulative : "",
        `"${(pay ? pay.label : "").replaceAll('"', '""')}"`,
        pay && !pay.isHeader ? pay.previousMonth : "",
        pay && !pay.isHeader ? pay.currentMonth : "",
        pay && !pay.isHeader ? pay.cumulative : "",
      ];
    }),
    [
      `"TOTAL"`,
      summary.totalReceiptsPrevious,
      summary.totalReceiptsCurrent,
      summary.totalReceiptsCumulative,
      `"TOTAL"`,
      summary.totalPaymentsPrevious,
      summary.totalPaymentsCurrent,
      summary.totalPaymentsCumulative,
    ],
    [],
    [`"Status: ${summary.status.replaceAll('"', '""')}"`, `"Difference"`, summary.reconciliationDifference ?? ""],
    ...report.warnings.map((warning) => [`"${warning.replaceAll('"', '""')}"`]),
    [`"Signature of the Manager: ${(summary.managerName || "").replaceAll('"', '""')}"`, `""`, `""`, `""`, `"Checked by Accountant:"`],
  ];

  const csvContent = lines.map((l) => l.join(",")).join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Monthly_Statement_${summary.branchName.replace(/\s+/g, "_")}_${summary.fromDate}_to_${summary.toDate}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

