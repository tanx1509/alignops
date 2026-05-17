export default function Loading() {
  return (
    <div className="space-y-6 p-5 xl:p-8">
      <div className="space-y-3">
        <div className="h-4 w-32 animate-pulse rounded-full bg-muted" />
        <div className="h-10 w-80 max-w-full animate-pulse rounded-xl bg-muted" />
        <div className="h-4 w-[28rem] max-w-full animate-pulse rounded-full bg-muted" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div className="premium-card h-36 animate-pulse" key={index} />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-[1fr_24rem]">
        <div className="premium-card h-96 animate-pulse" />
        <div className="premium-card h-96 animate-pulse" />
      </div>
    </div>
  );
}
