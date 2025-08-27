export default function DashboardHeader({ roles }: { roles: { id: number; name: string }[] }) {
    const roleNames = roles.map(r => r.name).join(", ");
  
    return (
      <div className="flex-1">
        <h1 className="text-2xl sm:text-3xl font-bold">Unified Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Manage everything in one place ({roleNames})
        </p>
      </div>
    );
  }
  