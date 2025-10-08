import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Eye, Pen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
// @ts-ignore
import SignatureCanvas from "react-signature-canvas";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export function ContractsTab({ booking, onSigned }: { booking: any; onSigned?: (id: number) => void }) {
  const { toast } = useToast();
  const { user, roles } = useAuth();
  const roleIds = roles.map((r) => r.id);

  const [open, setOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [sigPad, setSigPad] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const allContracts = booking?.contracts || [];
  const allSignatures = booking?.signatures || [];

  if (!booking) return null;

  // ✅ Filter contracts relevant to the logged-in user
  const userContracts = allContracts.filter((contract: any) => {
    if (roleIds.includes(1)) return true; // Superadmin can see all

    // Booker sees booking_agreement
    if (
      user?.id === booking.bookerUserId &&
      contract.contractType === "booking_agreement"
    )
      return true;

    // Performer sees own performance_contract
    if (
      contract.contractType === "performance_contract" &&
      contract.assignedToUserId === user?.id
    )
      return true;

    return false;
  });

  const handleView = (contract: any) => {
    setSelectedContract(contract);
    setOpen(true);
  };

  const handleSign = async () => {
    if (!sigPad || sigPad.isEmpty()) {
      toast({
        title: "Signature Required",
        description: "Please sign before submitting.",
      });
      return;
    }

    try {
      setIsSubmitting(true);
      const signatureData = sigPad.getTrimmedCanvas().toDataURL("image/png");

      await apiRequest(`/api/contracts/${selectedContract.id}/sign`, {
        method: "POST",
        body: JSON.stringify({ signatureData }),
      });

      toast({
        title: "Signed Successfully",
        description: "Your signature has been saved.",
      });
      setOpen(false);

      // ✅ Optional reload callback
      if (onSigned) onSigned(selectedContract.id);
      else window.location.reload();

    } catch (err: any) {
      console.error("Sign error:", err);
      toast({
        title: "Error",
        description: err.message || "Failed to sign contract.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🖋️ Get user’s pending signature for selected contract
  const getSignatureStatus = (contractId: number) => {
    const sig = allSignatures.find(
      (s: any) =>
        s.contractId === contractId && s.signerUserId === user?.id
    );
    return sig ? sig.status : "pending";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Contracts</CardTitle>
        <CardDescription>
          Review, view, and sign contracts related to this booking
        </CardDescription>
      </CardHeader>

      <CardContent>
        {userContracts.length === 0 ? (
          <p className="text-muted-foreground">
            No contracts available for you in this booking.
          </p>
        ) : (
          <div className="space-y-4">
            {userContracts.map((contract: any) => {
              const status = getSignatureStatus(contract.id);
              const canSign = allSignatures.some(
                (s: any) =>
                  s.contractId === contract.id &&
                  s.signerUserId === user?.id &&
                  s.status !== "signed"
              );

              return (
                <div
                  key={contract.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h4 className="font-medium">{contract.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Type: {contract.contractType.replace("_", " ")}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Status:{" "}
                      <span
                        className={
                          status === "signed"
                            ? "text-green-600"
                            : "text-yellow-600"
                        }
                      >
                        {status}
                      </span>
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(contract)}
                    >
                      <Eye className="h-4 w-4 mr-1" /> View
                    </Button>
                    {canSign && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleView(contract)}
                      >
                        <Pen className="h-4 w-4 mr-1" /> Sign
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>

      {/* Signature Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedContract?.title}</DialogTitle>
          </DialogHeader>

          {/* Contract Summary */}
          <div className="p-4 border rounded mb-4 bg-muted/40">
            <p className="text-sm mb-1">
              <strong>Event:</strong> {booking.eventName}
            </p>
            <p className="text-sm mb-1">
              <strong>Venue:</strong> {booking.venueName}, {booking.venueAddress}
            </p>
            <p className="text-sm mb-1">
              <strong>Type:</strong> {booking.eventType}
            </p>
            <p className="text-sm">
              <strong>Total:</strong> ৳
              {Number(
                selectedContract?.content?.totalBookingPrice ||
                  booking.totalBudget
              ).toLocaleString()}
            </p>
          </div>

          {/* Signature Canvas */}
          <div>
            <p className="text-sm font-medium mb-2">Sign below:</p>
            <SignatureCanvas
              ref={setSigPad}
              penColor="black"
              canvasProps={{
                width: 500,
                height: 200,
                className: "border rounded-md w-full",
              }}
            />
            <div className="flex justify-between mt-2">
              <Button variant="outline" onClick={() => sigPad?.clear()}>
                Clear
              </Button>
              <Button disabled={isSubmitting} onClick={handleSign}>
                {isSubmitting ? "Submitting..." : "Submit Signature"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
