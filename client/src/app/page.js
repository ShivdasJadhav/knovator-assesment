import Link from "next/link";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <Link href={"/admin/import-history"} className="bg-blue-500 rounded-md py-1 px-2 text-white">Go to Logs</Link>
    </div>
  );
}
