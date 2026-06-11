export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">School Arrival Dashboard</h1>
          <p className="text-gray-400 mt-1">Monday, 11 June 2026</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Total Students</p>
            <p className="text-3xl font-bold mt-1">600</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Arrived Today</p>
            <p className="text-3xl font-bold mt-1 text-green-400">432</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Not Yet Arrived</p>
            <p className="text-3xl font-bold mt-1 text-yellow-400">168</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-5">
            <p className="text-gray-400 text-sm">Absent / Alerted</p>
            <p className="text-3xl font-bold mt-1 text-red-400">12</p>
          </div>
        </div>

        {/* Recent Arrivals Table */}
        <div className="bg-gray-900 rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4">Recent Arrivals</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-gray-800">
                <th className="text-left pb-3">Student</th>
                <th className="text-left pb-3">Class</th>
                <th className="text-left pb-3">Time</th>
                <th className="text-left pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {[
                { name: 'Amara Okafor', cls: 'JSS 1A', time: '07:42', status: 'Arrived' },
                { name: 'Chidi Nwosu', cls: 'JSS 2B', time: '07:55', status: 'Arrived' },
                { name: 'Fatima Bello', cls: 'SSS 1C', time: '08:03', status: 'Arrived' },
                { name: 'Emeka Eze', cls: 'SSS 3A', time: '08:21', status: 'Arrived' },
                { name: 'Ngozi Adeyemi', cls: 'JSS 3B', time: '—', status: 'Absent' },
              ].map((s, i) => (
                <tr key={i} className="py-3">
                  <td className="py-3 font-medium">{s.name}</td>
                  <td className="py-3 text-gray-400">{s.cls}</td>
                  <td className="py-3 text-gray-400">{s.time}</td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      s.status === 'Arrived'
                        ? 'bg-green-900 text-green-400'
                        : 'bg-red-900 text-red-400'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}