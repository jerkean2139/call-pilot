import { Link } from 'react-router-dom';
import { Logo } from '../ui/logo';

export function Header() {
  return (
    <header className="bg-white border-b border-gray-100">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <Logo />
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link to="/leakage" className="text-gray-600 hover:text-[#FF0000] font-medium">Leakage Calculator</Link>
            <Link to="/assessment" className="text-gray-600 hover:text-[#FF0000]">Talent Assessment</Link>
            <Link to="/guide" className="text-gray-600 hover:text-[#FF0000]">User Guide</Link>
            <Link to="/reports" className="text-gray-600 hover:text-[#FF0000]">Reports</Link>
            <Link to="/leakage" className="bg-[#FF0000] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#FF0000]/90 transition-colors">Find Your Leakage</Link>
          </nav>
        </div>
      </div>
    </header>
  );
}