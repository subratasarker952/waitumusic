import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, FileText } from "lucide-react";

function DocumentsCard({ booking, token }: { booking: any; token: string }) {
  // Token-authenticated download function
  const handleDownload = async (invoiceId: number, fileName: string) => {
    try {
      const response = await fetch(`/api/financial/invoice/${invoiceId}/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch PDF");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("Failed to download PDF. Please try again.");
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Documents</CardTitle>
        <CardDescription>
          View or download your agreement and invoices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3 mt-4">
          {/* Agreement */}
          {booking?.agreementSigned ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleDownload(booking.agreementInvoiceId, "agreement.pdf")
              }
            >
              <FileText className="h-4 w-4 mr-1" /> View Agreement
            </Button>
          ) : (
            <Button disabled variant="outline" size="sm">
              <FileText className="h-4 w-4 mr-1" /> Agreement Pending
            </Button>
          )}

          {/* Due Invoice */}
          {booking?.agreementSigned && !booking?.paymentCompleted && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleDownload(
                  booking.invoices.find((i: any) => i.status !== "paid")?.id,
                  "due_invoice.pdf"
                )
              }
            >
              <Download className="h-4 w-4 mr-1" /> Download Due Invoice
            </Button>
          )}

          {/* Paid Invoice */}
          {booking?.paymentCompleted && booking?.paidInvoiceUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleDownload(
                  booking.invoices.find((i: any) => i.status === "paid")?.id,
                  "paid_invoice.pdf"
                )
              }
            >
              <Download className="h-4 w-4 mr-1" /> Download Paid Invoice
            </Button>
          )}

          {/* Receipt */}
          {booking?.paymentCompleted && booking?.receipts?.length > 0 &&
            booking.receipts.map((r: any) => (
              <Button
                key={r.id}
                variant="outline"
                size="sm"
                onClick={() => handleDownload(r.id, `receipt_${r.receiptNumber}.pdf`)}
              >
                <Download className="h-4 w-4 mr-1" /> Download Receipt
              </Button>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default DocumentsCard;
