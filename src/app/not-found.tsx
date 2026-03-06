import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>
        <p className="text-slate-500 mb-4">Page not found</p>
        <Link href="/" className="text-brand-600 hover:text-brand-700 font-medium">
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
