export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 px-8 md:px-22 py-10">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-[#101820] tracking-tight">
            Syncvas
          </span>
          <span className="text-sm text-gray-400">
            © {new Date().getFullYear()}
          </span>
        </div>

        <div className="flex items-center gap-6 text-sm text-gray-500">
          <a target="_main" href="https://github.com/THEJAS-BK" className="hover:text-[#101820] transition-colors">
            GitHub
          </a>
          <a target="_main" href="https://www.linkedin.com/in/thejas-bk-96a6b9330" className="hover:text-[#101820] transition-colors">
            linkedIn
          </a>
        </div>
      </div>
    </footer>
  );
}