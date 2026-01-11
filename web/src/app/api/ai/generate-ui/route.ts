import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    // Mock AI generation based on keywords
    let code = '';
    const cleanPrompt = prompt.toLowerCase();

    if (cleanPrompt.includes('login') || cleanPrompt.includes('signin')) {
      code = `export default function LoginForm() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md space-y-8 rounded-lg bg-white p-6 shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <form className="mt-8 space-y-6">
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <input
                type="email"
                required
                className="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 pl-2"
                placeholder="Email address"
              />
            </div>
            <div>
              <input
                type="password"
                required
                className="relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6 pl-2"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}`;
    } else if (cleanPrompt.includes('dashboard') || cleanPrompt.includes('stats')) {
      code = `export default function DashboardStats() {
  const stats = [
    { name: 'Total Subscribers', value: '71,897', change: '12%', changeType: 'increase' },
    { name: 'Avg. Open Rate', value: '58.16%', change: '2.02%', changeType: 'increase' },
    { name: 'Avg. Click Rate', value: '24.57%', change: '3.2%', changeType: 'decrease' },
  ];

  return (
    <div className="bg-white py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h3 className="text-base font-semibold leading-6 text-gray-900">Last 30 days</h3>
        <dl className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {stats.map((item) => (
            <div key={item.name} className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6 border border-gray-100">
              <dt className="truncate text-sm font-medium text-gray-500">{item.name}</dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900">{item.value}</dd>
              <dd className={\`mt-2 flex items-baseline text-sm font-semibold \${
                item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }\`}>
                {item.changeType === 'increase' ? '↑' : '↓'} {item.change}
                <span className="ml-2 text-gray-500">from last month</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}`;
    } else {
      // Default / Generative fallback
      code = `export default function GeneratedComponent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 text-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
      <div className="w-16 h-16 mb-4 text-4xl bg-blue-100 rounded-full flex items-center justify-center">
        ✨
      </div>
      <h3 className="text-xl font-semibold text-gray-900">AI Component Generator</h3>
      <p className="mt-2 text-gray-600 max-w-sm">
        You requested: "<strong>${prompt}</strong>"
      </p>
      <div className="mt-6 flex gap-3">
        <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700">
          Accept
        </button>
        <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
          Regenerate
        </button>
      </div>
    </div>
  );
}`;
    }

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({ 
      code, 
      generatedAt: new Date().toISOString(),
      model: 'prism-codex-v1'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to generate UI' },
      { status: 500 }
    );
  }
}
