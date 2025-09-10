import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/games')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/games"!</div>
}
