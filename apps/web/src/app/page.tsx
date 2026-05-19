export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">CaptionSan</h1>
        <p className="mt-4 text-lg text-gray-600">
          Tulis satu ide, hasilkan konten untuk semua platform.
        </p>
        <div className="mt-8">
          <a
            href="/login"
            className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800 transition-colors"
          >
            Masuk
          </a>
        </div>
      </div>
    </main>
  );
}
