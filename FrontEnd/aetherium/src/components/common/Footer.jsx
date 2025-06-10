import { Link } from "react-router-dom"

const Footer = () => {
  return (
    <footer className="bg-[#2a2b4a] text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center space-y-8">
          <div className="flex items-center space-x-2">
            <div className="w-12 h-12 bg-cyan-400 rounded-full flex items-center justify-center">
              <span className="text-[#1a1b3a] font-bold text-xl">AE</span>
            </div>
            <div>
              <span className="text-2xl font-bold">AETHERIUM</span>
              <div className="text-sm text-gray-300">
                <span className="text-cyan-400">Premium</span>
                <br />
                Online Courses
              </div>
            </div>
          </div>

          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Subscribe to get our Newsletter</h3>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your Email"
                className="flex-1 px-4 py-3 rounded-full bg-gray-700 text-white placeholder-gray-400 border border-gray-600 focus:outline-none focus:border-cyan-400"
              />
              <button className="bg-purple-600 hover:bg-purple-700 px-8 py-3 rounded-full font-semibold transition-colors">
                Subscribe
              </button>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-300">
            <Link to="/careers" className="hover:text-cyan-400 transition-colors">
              Careers
            </Link>
            <Link to="/privacy" className="hover:text-cyan-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-cyan-400 transition-colors">
              Terms & Conditions
            </Link>
          </div>

          <div className="text-center text-gray-400 text-sm">© 2025 Aetherium Technologies Inc.</div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
