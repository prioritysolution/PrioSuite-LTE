import type {
  MonthReportGroup,
  ReceiptPaymentScrollData,
} from "@/container/mis-reports/receipt-payment-scroll/ReceiptPaymentScrollType";

const fmtNum = (val: number | undefined | null) => {
  if (!val || val === 0) return "";
  return val.toFixed(2);
};

const fmtTot = (val: number | undefined | null) => {
  if (!val || val === 0) return "-";
  return val.toFixed(2);
};

export const exportReceiptPaymentScrollExcel = (report: ReceiptPaymentScrollData) => {
  const { summary, monthGroups, dailyRows, totals } = report;

  const groupsToRender: MonthReportGroup[] =
    monthGroups && monthGroups.length > 0
      ? monthGroups
      : [
          {
            monthKey: `${summary.year}-${summary.monthName}`,
            monthName: summary.monthName,
            year: summary.year,
            daysCount: dailyRows.length || 31,
            days: dailyRows,
            totals,
          },
        ];

  const tablesHtml = groupsToRender
    .map((group) => {
      const rowsHtml = group.days
        .map((r) => {
          const hasActivity = r.receiptTotal > 0 || r.paymentTotal > 0;
          return `
            <tr>
              <td class="center font-bold" style="background-color: #FFFFFF;">${r.day}</td>
              <td class="num">${fmtNum(r.loanPrincipal)}</td>
              <td class="num">${fmtNum(r.loanInterest)}</td>
              <td class="num">${fmtNum(r.proceCharge)}</td>
              <td class="num">${fmtNum(r.hoReceipt)}</td>
              <td class="num">${fmtNum(r.miscReceipt)}</td>
              <td class="num-bold" style="background-color: #F0F9FF;">${fmtNum(r.receiptTotal)}</td>
              <td class="num">${fmtNum(r.loanPayment)}</td>
              <td class="num">${fmtNum(r.houserent)}</td>
              <td class="num">${fmtNum(r.electricBill)}</td>
              <td class="num">${fmtNum(r.salary)}</td>
              <td class="num">${fmtNum(r.travelling)}</td>
              <td class="num">${fmtNum(r.loanLoss)}</td>
              <td class="num">${fmtNum(r.hoPayment)}</td>
              <td class="num">${fmtNum(r.miscPayment)}</td>
              <td class="num-bold" style="background-color: #FFFBEB;">${fmtNum(r.paymentTotal)}</td>
              <td class="num-bold" style="background-color: ${hasActivity ? "#F0FDF4" : "#FFFFFF"};">${hasActivity ? fmtNum(r.cashInHand) : ""}</td>
            </tr>
          `;
        })
        .join("");

      return `
        <!-- Month Block: ${group.monthName} ${group.year} -->
        <tr>
          <td colspan="17" class="no-border org-title">${summary.companyName || "SWANIRVAR FINANCE COMPANY Pvt. Ltd."}</td>
        </tr>
        <tr>
          <td colspan="17" class="no-border sub-title">Corporate Office: ${summary.corporateOffice || "4 no. ward , Panskura, Purba Medinipur"}</td>
        </tr>
        <tr>
          <td colspan="8" class="no-border header-left">Receipt and Payments Scroll of the branch</td>
          <td colspan="9" class="no-border header-right">For The Month of: ${group.monthName} ${group.year}</td>
        </tr>
        <tr>
          <td colspan="8" class="no-border header-left">BRANCH CODE: [ ${summary.branchCode || "01"} ] &nbsp;&nbsp;&nbsp; Branch Name: ${summary.branchName}</td>
          <td colspan="9" class="no-border header-right">Manager/C.O. Name: ${summary.managerCoName}</td>
        </tr>
        <tr>
          <td colspan="17" class="no-border" style="height: 6px;"></td>
        </tr>

        <!-- Table Header Row 1 -->
        <tr>
          <th rowspan="2" class="center font-bold" style="background-color: #E2E8F0; width: 45px;">Date</th>
          <th colspan="2" class="center font-bold" style="background-color: #DBEAFE;">Loan</th>
          <th rowspan="2" class="center font-bold" style="background-color: #E0E7FF; width: 85px;">Proce. Charge</th>
          <th rowspan="2" class="center font-bold" style="background-color: #EDE9FE; width: 65px;">H.O.</th>
          <th rowspan="2" class="center font-bold" style="background-color: #F3E8FF; width: 65px;">Misc.</th>
          <th rowspan="2" class="center font-bold" style="background-color: #BAE6FD; width: 90px;">TOTAL</th>
          <th colspan="9" class="center font-bold" style="background-color: #FEF3C7;">PAYMENTS</th>
          <th rowspan="2" class="center font-bold" style="background-color: #D1FAE5; width: 95px;">Cash in Hand</th>
        </tr>

        <!-- Table Header Row 2 -->
        <tr>
          <th class="num font-bold" style="background-color: #EFF6FF;">Principal</th>
          <th class="num font-bold" style="background-color: #EFF6FF;">Interest</th>
          <th class="num font-bold" style="background-color: #FFFBEB;">Loan</th>
          <th class="num font-bold" style="background-color: #FFFBEB;">Houserent</th>
          <th class="num font-bold" style="background-color: #FFFBEB;">Electric Bill</th>
          <th class="num font-bold" style="background-color: #FFFBEB;">Salary</th>
          <th class="num font-bold" style="background-color: #FFFBEB;">Travelling</th>
          <th class="num font-bold" style="background-color: #FFFBEB;">Loan loss</th>
          <th class="num font-bold" style="background-color: #FFFBEB;">H.O.</th>
          <th class="num font-bold" style="background-color: #FFFBEB;">Miscellenious</th>
          <th class="num font-bold" style="background-color: #FDE68A;">TOTAL</th>
        </tr>

        <!-- Data Rows -->
        ${rowsHtml}

        <!-- Total Row -->
        <tr class="font-bold">
          <td class="center font-bold" style="background-color: #E2E8F0;">TOTAL:</td>
          <td class="num-bold" style="background-color: #BFDBFE;">${fmtTot(group.totals.loanPrincipal)}</td>
          <td class="num-bold" style="background-color: #BFDBFE;">${fmtTot(group.totals.loanInterest)}</td>
          <td class="num-bold" style="background-color: #C7D2FE;">${fmtTot(group.totals.proceCharge)}</td>
          <td class="num-bold" style="background-color: #DDD6FE;">${fmtTot(group.totals.hoReceipt)}</td>
          <td class="num-bold" style="background-color: #E9D5FF;">${fmtTot(group.totals.miscReceipt)}</td>
          <td class="num-bold" style="background-color: #7DD3FC;">${fmtTot(group.totals.receiptTotal)}</td>
          <td class="num-bold" style="background-color: #FDE68A;">${fmtTot(group.totals.loanPayment)}</td>
          <td class="num-bold" style="background-color: #FDE68A;">${fmtTot(group.totals.houserent)}</td>
          <td class="num-bold" style="background-color: #FDE68A;">${fmtTot(group.totals.electricBill)}</td>
          <td class="num-bold" style="background-color: #FDE68A;">${fmtTot(group.totals.salary)}</td>
          <td class="num-bold" style="background-color: #FDE68A;">${fmtTot(group.totals.travelling)}</td>
          <td class="num-bold" style="background-color: #FDE68A;">${fmtTot(group.totals.loanLoss)}</td>
          <td class="num-bold" style="background-color: #FDE68A;">${fmtTot(group.totals.hoPayment)}</td>
          <td class="num-bold" style="background-color: #FDE68A;">${fmtTot(group.totals.miscPayment)}</td>
          <td class="num-bold" style="background-color: #FCD34D;">${fmtTot(group.totals.paymentTotal)}</td>
          <td class="num-bold" style="background-color: #A7F3D0;">${fmtTot(group.totals.closingCashInHand)}</td>
        </tr>

        <!-- Signatures Row -->
        <tr>
          <td colspan="17" class="no-border" style="height: 14px;"></td>
        </tr>
        <tr>
          <td colspan="6" class="no-border sign-row" style="text-align: center; border-top: 1pt solid #000000 !important;">
            Signature of the C.O./M.O.
          </td>
          <td colspan="5" class="no-border"></td>
          <td colspan="6" class="no-border sign-row" style="text-align: center; border-top: 1pt solid #000000 !important;">
            Signature of the Branch Manager
          </td>
        </tr>
        <tr>
          <td colspan="17" class="no-border" style="height: 30px;"></td>
        </tr>
      `;
    })
    .join("");

  const html = `
<html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:x="urn:schemas-microsoft-com:office:excel"
      xmlns="http://www.w3.org/TR/REC-html40">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <!--[if gte mso 9]>
  <xml>
    <x:ExcelWorkbook>
      <x:ExcelWorksheets>
        <x:ExcelWorksheet>
          <x:Name>Receipt & Payment Scroll</x:Name>
          <x:WorksheetOptions>
            <x:DisplayGridlines/>
            <x:Print>
              <x:ValidPrinterInfo/>
              <x:Orientation>Landscape</x:Orientation>
            </x:Print>
          </x:WorksheetOptions>
        </x:ExcelWorksheet>
      </x:ExcelWorksheets>
    </x:ExcelWorkbook>
  </xml>
  <![endif]-->
  <style>
    body { font-family: Calibri, Arial, sans-serif; font-size: 10pt; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 0.5pt solid #000000; padding: 4px 6px; }
    .no-border { border: none !important; }
    .org-title { font-size: 14pt; font-weight: bold; text-align: center; }
    .sub-title { font-size: 10pt; text-align: center; color: #333333; }
    .header-left { text-align: left; font-weight: bold; font-size: 10pt; }
    .header-right { text-align: right; font-weight: bold; font-size: 10pt; }
    .num { text-align: right; mso-number-format: "\\#\\,\\#\\#0\\.00"; }
    .num-bold { text-align: right; font-weight: bold; mso-number-format: "\\#\\,\\#\\#0\\.00"; }
    .center { text-align: center; }
    .sign-row { font-weight: bold; font-size: 10pt; }
  </style>
</head>
<body>
  <table>
    ${tablesHtml}
  </table>
</body>
</html>
`;

  const blob = new Blob([html], { type: "application/vnd.ms-excel;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `receipt-payment-scroll-${summary.branchName.replace(/\s+/g, "_")}-${summary.fromDate}-to-${summary.toDate}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const exportReceiptPaymentScrollCsv = (report: ReceiptPaymentScrollData) => {
  const { summary, monthGroups, dailyRows, totals } = report;

  const groupsToRender: MonthReportGroup[] =
    monthGroups && monthGroups.length > 0
      ? monthGroups
      : [
          {
            monthKey: `${summary.year}-${summary.monthName}`,
            monthName: summary.monthName,
            year: summary.year,
            daysCount: dailyRows.length || 31,
            days: dailyRows,
            totals,
          },
        ];

  const allLines: string[] = [];

  for (const group of groupsToRender) {
    allLines.push(
      `"${summary.companyName || "SWANIRVAR FINANCE COMPANY Pvt. Ltd."}"`,
      `"Corporate Office: ${summary.corporateOffice || ""}"`,
      `"Receipt and Payments Scroll of the branch","","","","","","","For The Month of: ${group.monthName} ${group.year}"`,
      `"BRANCH CODE: ${summary.branchCode || "01"}","Branch Name: ${summary.branchName}","","","","","","Manager/C.O. Name: ${summary.managerCoName}"`,
      "",
      [
        "Date",
        "Principal",
        "Interest",
        "Proce. Charge",
        "H.O.",
        "Misc.",
        "Total Receipts",
        "Loan",
        "Houserent",
        "Electric Bill",
        "Salary",
        "Travelling",
        "Loan loss",
        "H.O.",
        "Miscellaneous",
        "Total Payments",
        "Cash in Hand",
      ].join(","),
      ...group.days.map((r) =>
        [
          r.day,
          r.loanPrincipal || "",
          r.loanInterest || "",
          r.proceCharge || "",
          r.hoReceipt || "",
          r.miscReceipt || "",
          r.receiptTotal || "",
          r.loanPayment || "",
          r.houserent || "",
          r.electricBill || "",
          r.salary || "",
          r.travelling || "",
          r.loanLoss || "",
          r.hoPayment || "",
          r.miscPayment || "",
          r.paymentTotal || "",
          r.receiptTotal > 0 || r.paymentTotal > 0 ? r.cashInHand : "",
        ].join(","),
      ),
      [
        "TOTAL:",
        group.totals.loanPrincipal,
        group.totals.loanInterest,
        group.totals.proceCharge,
        group.totals.hoReceipt,
        group.totals.miscReceipt,
        group.totals.receiptTotal,
        group.totals.loanPayment,
        group.totals.houserent,
        group.totals.electricBill,
        group.totals.salary,
        group.totals.travelling,
        group.totals.loanLoss,
        group.totals.hoPayment,
        group.totals.miscPayment,
        group.totals.paymentTotal,
        group.totals.closingCashInHand,
      ].join(","),
      "",
      `"Signature of the C.O./M.O.","","","","","","","","","","Signature of the Branch Manager"`,
      "",
      "--------------------------------------------------------------------------------",
      "",
    );
  }

  const csv = allLines.join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `receipt-payment-scroll-${summary.branchName.replace(/\s+/g, "_")}-${summary.fromDate}-to-${summary.toDate}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
