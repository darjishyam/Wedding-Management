import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

export const PDFService = {
  async generateAndSharePDF(htmlContent: string, fileName: string) {
    try {
      if (Platform.OS === 'web') {
        // On Web, use printAsync to open the browser print dialog (Save as PDF)
        await Print.printAsync({
          html: htmlContent,
        });
      } else {
        // 1. Generate PDF
        const { uri } = await Print.printToFileAsync({
          html: htmlContent,
          base64: false,
        });

        // 2. Share
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            UTI: '.pdf',
            mimeType: 'application/pdf',
            dialogTitle: `Export ${fileName}`,
          });
        } else {
          Alert.alert("Error", "Sharing is not available on this device");
        }
      }
    } catch (error) {
      console.error("PDF Generation Error:", error);
      Alert.alert("Error", "Failed to generate PDF");
    }
  },

  generateShagunListHTML(shaguns: any[], totalRec: number, totalGiven: number) {
    const rows = shaguns.map(s => `
      <tr>
        <td>${s.relatedTo || 'N/A'}</td>
        <td>${s.name}</td>
        <td>${s.amount}</td>
        <td>${s.type === 'received' ? 'Received' : 'Given'}</td>
        <td>${new Date(s.date).toLocaleDateString()}</td>
      </tr>
    `).join('');

    return `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 20px; }
            h1 { text-align: center; color: #E74C3C; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .summary { margin-top: 20px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Shagun List</h1>
          <div class="summary">
            <p>Total Received: ₹${totalRec}</p>
            <p>Total Given: ₹${totalGiven}</p>
          </div>
          <table>
            <tr>
              <th>Related To</th>
              <th>Name</th>
              <th>Amount</th>
              <th>Type</th>
              <th>Date</th>
            </tr>
            ${rows}
          </table>
        </body>
      </html>
    `;
  },

  generateExpenseListHTML(expenses: any[], totalBudget: number, totalSpent: number) {
    const rows = expenses.map(e => `
      <tr>
        <td>${e.title}</td>
        <td>${e.category}</td>
        <td>${e.amount}</td>
        <td>${new Date(e.date).toLocaleDateString()}</td>
      </tr>
    `).join('');

    return `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 20px; }
            h1 { text-align: center; color: #4CAF50; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .summary { margin-top: 20px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Expense List</h1>
          <div class="summary">
            <p>Total Budget: ₹${totalBudget}</p>
            <p>Total Spent: ₹${totalSpent}</p>
          </div>
          <table>
            <tr>
              <th>Title</th>
              <th>Category</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
            ${rows}
          </table>
        </body>
      </html>
    `;
  },

  generateGuestListHTML(guests: any[], totalVal: number) {
    const rows = guests.map(g => `
      <tr>
        <td>${g.name}</td>
        <td>${g.familyCount || 1}</td>
        <td>${g.cityVillage || '-'}</td>
        <td>${g.category || '-'}</td>
        <td>${g.status || '-'}</td>
      </tr>
    `).join('');

    return `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 20px; }
            h1 { text-align: center; color: #2196F3; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .summary { margin-top: 20px; font-weight: bold; }
          </style>
        </head>
        <body>
          <h1>Guest List</h1>
          <div class="summary">
            <p>Total Guests: ${totalVal}</p>
          </div>
          <table>
            <tr>
              <th>Name</th>
              <th>Family Count</th>
              <th>City/Village</th>
              <th>Category</th>
              <th>Status</th>
            </tr>
            ${rows}
          </table>
        </body>
      </html>
    `;
  },

  generateVendorReportHTML(vendors: any[]) {
    const totalCost = vendors.reduce((sum, v) => sum + (v.totalAmount || 0), 0);
    const totalPaid = vendors.reduce((sum, v) => sum + (v.paidAmount || 0), 0);
    const rows = vendors.map(v => `
        <tr>
          <td>${v.name}</td>
          <td>${v.category}</td>
          <td>${v.totalAmount}</td>
          <td>${v.paidAmount}</td>
          <td>${v.status}</td>
        </tr>
      `).join('');

    return `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica', sans-serif; padding: 20px; }
              h1 { text-align: center; color: #E91E63; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .summary { margin-top: 20px; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Vendor Payment Report</h1>
            <div class="summary">
              <p>Total Estimated: ₹${totalCost}</p>
              <p>Total Paid: ₹${totalPaid}</p>
              <p>Pending: ₹${totalCost - totalPaid}</p>
            </div>
            <table>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Total</th>
                <th>Paid</th>
                <th>Status</th>
              </tr>
              ${rows}
            </table>
          </body>
        </html>
      `;
  },

  generateEventPDFHTML(event: any, guests: any[]) {
    const guestRows = guests.map(g => {
      // Find status for this event
      const assignment = g.assignedEvents?.find((ae: any) =>
        (typeof ae === 'string' ? ae === event._id : ae.event === event._id)
      );
      const status = typeof assignment === 'object' ? assignment.status : 'Invited';

      return `
            <tr>
              <td>${g.name}</td>
              <td>${g.familyCount || 1}</td>
              <td>${g.cityVillage || '-'}</td>
              <td>${g.category || '-'}</td>
              <td>${status}</td>
            </tr>
          `;
    }).join('');

    return `
        <html>
          <head>
            <style>
              body { font-family: 'Helvetica', sans-serif; padding: 20px; }
              h1 { text-align: center; color: #7E57C2; }
              .header-info { text-align: center; margin-bottom: 20px; color: #555; }
              table { width: 100%; border-collapse: collapse; margin-top: 20px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .summary { margin-top: 20px; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>${event.name}</h1>
            <div class="header-info">
              <p>Date: ${new Date(event.date).toDateString()} | Time: ${event.time || 'N/A'}</p>
              <p>Venue: ${event.venue || 'N/A'}</p>
              <p>${event.description || ''}</p>
            </div>

            <div class="summary">
              <p>Total Invited Guests: ${guests.length}</p>
              <p>Total Heads (Approx): ${guests.reduce((sum, g) => sum + (g.familyCount || 1), 0)}</p>
            </div>

            <table>
              <tr>
                <th>Guest Name</th>
                <th>Family Count</th>
                <th>City/Village</th>
                <th>Category</th>
                <th>Status</th>
              </tr>
              ${guestRows}
            </table>
          </body>
        </html>
      `;
  },

  generateInvitationHTML(imageUri: string) {
    return `
      <html>
        <body style="margin:0; padding:0; display:flex; justify-content:center; align-items:center; background-color: #f0f0f0;">
          <img src="${imageUri}" style="width:100%; max-width:800px; height:auto;" />
        </body>
      </html>
    `;
  },

  generateAllEventsPDFHTML(events: any[], allGuests: any[]) {
    const eventRows = events.map(event => {
      const eventGuests = allGuests.filter(g =>
        g.assignedEvents?.some((ae: any) => {
          const eventId = typeof ae === 'string' ? ae : ae.event;
          return eventId === event._id;
        })
      );
      const totalHeads = eventGuests.reduce((sum, g) => sum + (g.familyCount || 1), 0);

      return `
        <tr>
          <td>${event.name}</td>
          <td>${new Date(event.date).toDateString()}</td>
          <td>${event.time || 'N/A'}</td>
          <td>${event.venue || 'N/A'}</td>
          <td>${event.description || '-'}</td>
          <td>${eventGuests.length}</td>
          <td>${totalHeads}</td>
        </tr>
      `;
    }).join('');

    return `
      <html>
        <head>
          <style>
            body { font-family: 'Helvetica', sans-serif; padding: 20px; }
            h1 { text-align: center; color: #8A0030; }
            .subtitle { text-align: center; color: #666; margin-bottom: 20px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; table-layout: fixed; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; word-wrap: break-word; }
            th { background-color: #8A0030; color: #FFF; }
            tr { page-break-inside: avoid; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .summary { margin: 20px 0; font-weight: bold; padding: 15px; background: #FFF0F5; border-radius: 8px; }
            .footer { margin-top: 30px; text-align: center; color: #999; font-size: 10px; }
          </style>
        </head>
        <body>
          <h1>Wedding Events Schedule</h1>
          <p class="subtitle">Generated on ${new Date().toDateString()}</p>

          <div class="summary">
            <p>Total Events: ${events.length}</p>
            <p>Total Guests: ${allGuests.length}</p>
          </div>

          <table>
            <thead>
              <tr>
                <th>Event Name</th>
                <th>Date</th>
                <th>Time</th>
                <th>Venue</th>
                <th>Description</th>
                <th>Guests Invited</th>
                <th>Total Heads</th>
              </tr>
            </thead>
            <tbody>
              ${eventRows}
            </tbody>
          </table>

          <p class="footer">Wedding Management App &bull; All Events Report</p>
        </body>
      </html>
    `;
  },
};
