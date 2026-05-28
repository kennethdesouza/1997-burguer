import { ShoppingBag, Clock, CheckCircle, TrendingUp } from 'lucide-react'
import { Card } from '@/components/ui/card'

const stats = [
  { label: 'Pedidos hoje', value: '0', icon: ShoppingBag, color: 'text-orange-400' },
  { label: 'Em preparo', value: '0', icon: Clock, color: 'text-yellow-400' },
  { label: 'Entregues', value: '0', icon: CheckCircle, color: 'text-green-400' },
  { label: 'Faturamento hoje', value: 'R$ 0,00', icon: TrendingUp, color: 'text-blue-400' },
]

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-zinc-500 text-sm mb-6">Visão geral do dia</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="bg-zinc-900 border-zinc-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-zinc-400">{label}</p>
              <Icon className={cn('h-4 w-4', color)} />
            </div>
            <p className="text-2xl font-bold">{value}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}

function cn(...classes: string[]) {
  return classes.filter(Boolean).join(' ')
}
