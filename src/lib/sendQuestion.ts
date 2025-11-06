/**
 * Mengirim pertanyaan user ke API untuk disimpan di Firestore
 * @param question Pertanyaan dari user
 * @param userId Optional user ID
 * @returns Promise dengan response dari API
 */
export async function sendQuestion(question: string, userId?: string): Promise<{ success: boolean; id?: string }> {
  try {
    // Collect device info
    const deviceType = window.innerWidth < 768 ? 'mobile' :
                       window.innerWidth < 1024 ? 'tablet' : 'desktop';

    const metadata = {
      deviceType,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      pageUrl: window.location.href,
    };

    const response = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        userId,
        ...metadata
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Failed to save question:', errorData.error);
      return { success: false };
    }

    const data = await response.json();
    console.log('✅ Question saved successfully!', data);
    return { success: true, id: data.id };
  } catch (error) {
    console.error('Error sending question:', error);
    // Tidak throw error agar tidak mengganggu flow chat
    return { success: false };
  }
}
