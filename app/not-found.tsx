import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">404</h2>
        <h3 className="text-2xl font-semibold text-gray-900 mb-2">Page Not Found</h3>
        <p className="text-gray-600 mb-6">The page you are looking for does not exist.</p>
        <Link
          href="/"
          className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
