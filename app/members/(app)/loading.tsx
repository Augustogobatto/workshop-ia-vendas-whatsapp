import BoxLoader from '@/components/ui/box-loader'

export default function Loading() {
  return (
    <div style={{
      minHeight: '60dvh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <BoxLoader />
    </div>
  )
}
