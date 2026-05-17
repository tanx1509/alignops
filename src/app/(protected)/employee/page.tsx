import { prisma } from '@/lib/prisma'

export default async function EmployeePage() {
  const sheet = await prisma.goalSheet.findFirst({
    where: {
      employee: {
        email: 'sanya.malhotra@alignops.local',
      },
    },
    include: {
      goals: true,
    },
    orderBy: {
      updatedAt: 'desc',
    },
  })

  if (!sheet) {
    return (
      <main className="p-8">
        No goal sheet found.
      </main>
    )
  }

  return (
    <main className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          My Goal Workspace
        </h1>

        <p className="text-gray-500">
          Status: {sheet.status}
        </p>
      </div>

      <div className="space-y-4">
        {sheet.goals.map((goal) => (
          <div
            key={goal.id}
            className="rounded-xl border p-5"
          >
            <h2 className="text-xl font-semibold">
              {goal.title}
            </h2>

            <p className="mt-2 text-gray-600">
              {goal.description}
            </p>

            <p className="mt-4">
              Weightage:{' '}
              {goal.weightage.toString()}%
            </p>

            <p>
              Status: {goal.status}
            </p>
          </div>
        ))}
      </div>

      {sheet.status === 'DRAFT' && (
  <form
    action={`/api/sheets/${sheet.id}/submit`}
    method="POST"
  >
    <input
      type="hidden"
      name="updatedAt"
      value={sheet.updatedAt.toISOString()}
    />

    <button
      type="submit"
      className="rounded-lg bg-black px-5 py-3 text-white"
    >
      Submit Goals
    </button>
  </form>
)}
    </main>
  )
}