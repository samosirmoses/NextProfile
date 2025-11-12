// src/app/page.tsx

import Chatbot from '@/components/Chatbot';

export default function Home() {
    return (
        <main className="h-screen w-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
            </div>

            {/* Full Screen Chat Container */}
            <div className="relative z-10 h-full w-full flex items-center justify-center p-0 sm:p-4 md:p-6 lg:p-8">
                <div className="w-full h-full sm:h-[95vh] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl xl:max-w-5xl sm:rounded-3xl overflow-hidden shadow-2xl border-0 sm:border sm:border-white/20 backdrop-blur-sm">
                    <Chatbot />
                </div>
            </div>
        </main>
    );
}