import { Check, Music, Headphones, Briefcase, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const roleConfig: Record<string, { color: string; Icon: any }> = {
  managed: { color: "text-green-600 border-green-600", Icon: Check },
  artist: { color: "text-purple-600 border-purple-600", Icon: Music },
  musician: { color: "text-blue-600 border-blue-600", Icon: Headphones },
  professional: { color: "text-orange-600 border-orange-600", Icon: Briefcase },
  fan: { color: "text-pink-600 border-pink-600", Icon: Heart }
}

export function RoleBadges({ roles }: { roles: { id: number; name: string }[] }) {
  return (
    <div className="flex justify-between flex-col md:flex-row gap-4 text-center">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Unified Dashboard</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Manage everything in one place
        </p>
      </div>

      <div className="flex gap-2 justify-center items-center">
        {roles.map(role => {
          const config = roleConfig[role.name.toLowerCase()]
          const Icon = config?.Icon

          return (
            <Badge
              key={role.id}
              variant="outline"
              className={`flex items-center flex-shrink-0 ${config?.color ?? ""}`}
            >
              {Icon && <Icon className="h-3 w-3 mr-1" />}
              {role.name}
            </Badge>
          )
        })}
      </div>
    </div>
  )
}
