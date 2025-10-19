// src/app/page.tsx

import Chatbot from '@/components/Chatbot';

export default function Home() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-gray-100 p-4 sm:p-24">
            <Chatbot />
        </main>
    );
}