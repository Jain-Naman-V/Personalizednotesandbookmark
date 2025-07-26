export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold mb-4 bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
              NotesKeeper
            </h3>
            <p className="text-purple-200 mb-4">
              Organize your thoughts and favorite links in one beautiful, intuitive platform.
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Features</h4>
            <ul className="space-y-2 text-purple-200">
              <li className="hover:text-white transition-colors duration-200 cursor-pointer">Personal Notes</li>
              <li className="hover:text-white transition-colors duration-200 cursor-pointer">Bookmark Manager</li>
              <li className="hover:text-white transition-colors duration-200 cursor-pointer">Tag Organization</li>
              <li className="hover:text-white transition-colors duration-200 cursor-pointer">Search & Filter</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-purple-200">
              <li className="hover:text-white transition-colors duration-200 cursor-pointer">Help Center</li>
              <li className="hover:text-white transition-colors duration-200 cursor-pointer">Contact Us</li>
              <li className="hover:text-white transition-colors duration-200 cursor-pointer">Privacy Policy</li>
              <li className="hover:text-white transition-colors duration-200 cursor-pointer">Terms of Service</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-purple-700 mt-8 pt-8 text-center">
          <p className="text-purple-300">© {currentYear} NotesKeeper. Made with ❤️ for productivity enthusiasts.</p>
        </div>
      </div>
    </footer>
  )
}
