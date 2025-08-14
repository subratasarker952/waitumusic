import { PRORegistration } from "@/components/PRORegistration";
import { useContext } from "react";
import { AuthContext } from "@/contexts/AuthContext";

export default function PRORegistrationPage() {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8">
        <PRORegistration userId={user?.id} />
      </div>
    </div>
  );
}