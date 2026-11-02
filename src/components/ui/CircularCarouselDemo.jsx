import { CircularCarousel } from '@/components/ui/CircularCarousel'

const items = [
  {
    id: '1',
    title: 'Nebula Engine',
    description: 'Real-time rendering pipeline built for immersive 3D worlds.',
    tag: 'Graphics',
  },
  {
    id: '2',
    title: 'Quantum Sync',
    description: 'Instant state replication across every connected device.',
    tag: 'Realtime',
  },
  {
    id: '3',
    title: 'Aurora Analytics',
    description: 'Insightful dashboards that surface trends as they happen.',
    tag: 'Data',
  },
  {
    id: '4',
    title: 'Pulse Notifications',
    description: 'Timely, contextual alerts that keep users in the loop.',
    tag: 'Messaging',
  },
  {
    id: '5',
    title: 'Vault Security',
    description: 'End-to-end encryption with zero-trust access controls.',
    tag: 'Security',
  },
  {
    id: '6',
    title: 'Forge CI',
    description: 'Blazing-fast build and deploy pipelines out of the box.',
    tag: 'DevOps',
  },
]

export function CircularCarouselDemo() {
  return (
    <div className="circular-carousel-wrapper" style={{ minHeight: '480px' }}>
      <CircularCarousel items={items} />
    </div>
  )
}

export default CircularCarouselDemo
