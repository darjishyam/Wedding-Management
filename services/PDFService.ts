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
        <td>${g.mobile || '-'}</td>
        <td>${g.familyMembers}</td>
        <td>${g.city || '-'}</td>
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
              <th>Mobile</th>
              <th>Members</th>
              <th>City</th>
            </tr>
            ${rows}
          </table>
        </body>
      </html>
    `;
  }
};
