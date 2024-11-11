import React from 'react';
import { signInWithLinkedIn } from '../../lib/firebase';
import { Linkedin } from 'lucide-react';

export default function LoginButton() {
  return (
    <button
      onClick={signInWithLinkedIn}
      className="flex items-center justify-center space-x-2 w-full px-4 py-2 text-white bg-[#0077b5] hover:bg-[#006399] rounded-lg transition-colors"
    >
      <Linkedin className="w-5 h-5" />
      <span>Continue with LinkedIn</span>
    </button>
  );
}