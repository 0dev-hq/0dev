import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

const activities = [
  { id: 1, user: 'John Doe', action: 'Started a new chat', time: '2 minutes ago' },
  { id: 2, user: 'Jane Smith', action: 'Resolved a ticket', time: '10 minutes ago' },
  { id: 3, user: 'Bob Johnson', action: 'Escalated an issue', time: '1 hour ago' },
]

export function RecentActivities() {
  return (
    <div className="space-y-8">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={`/placeholder.svg?height=36&width=36`} alt={activity.user} />
            <AvatarFallback>{activity.user.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{activity.user}</p>
            <p className="text-sm text-muted-foreground">{activity.action}</p>
          </div>
          <div className="ml-auto font-medium text-sm text-muted-foreground">
            {activity.time}
          </div>
        </div>
      ))}
    </div>
  )
}

