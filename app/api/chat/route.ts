import { NextResponse } from "next/server"

// Simulation of an AI counselor logic
const RECOVERY_KNOWLEDGE = [
    { keywords: ["craving", "urge", "want to use", "tempted"], response: "Cravings are like waves; they peak and then subside. Try the 'urge surfing' technique: acknowledge the feeling, breathe through it, and know that it will pass in 15-20 minutes. Can you try 5 minutes of deep breathing right now?" },
    { keywords: ["sleep", "insomnia", "cant sleep"], response: "Difficulty sleeping is common in early recovery. Try to maintain a strict sleep schedule, avoid caffeine after 2 PM, and keep your bedroom cool and dark. Magnesium-rich foods like almonds or a warm herbal tea can also help." },
    { keywords: ["stress", "anxious", "anxiety", "overwhelmed"], response: "When stress hits, try the 5-4-3-2-1 grounding technique: notice 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you can taste. This brings your brain back to the present moment." },
    { keywords: ["depressed", "sad", "lonely", "low"], response: "Recovery can be lonely, but you're not alone. Reach out to a support person or try a small 'opposite action'—if you feel like staying in bed, try walking to the mailbox or calling one friend just to say hi." },
    { keywords: ["risk", "severity", "score", "assessment"], response: "Your assessment score helps us understand where you need the most support. Don't be discouraged by a high score; it's just a starting point for your growth. Which part of your report concerns you most?" },
    { keywords: ["hello", "hi", "hey"], response: "Hello! I'm your RecoverAI support assistant. I'm here to help you navigate your journey. What's on your mind today?" },
    { keywords: ["thank", "thanks"], response: "You're very welcome! I'm here for you whenever you need a boost. One day at a time!" },
    { keywords: ["quote", "motivation", "motivate"], response: "Here's a thought for today: 'Recovery is not for people who need it, it\'s for people who want it.' You've already taken the biggest step by being here." },
]

export async function POST(req: Request) {
    try {
        const { messages } = await req.json()
        const lastMessage = messages[messages.length - 1].content.toLowerCase()

        // Find a matching response based on keywords
        let assistantResponse = "That's a valid point. Recovery is a journey with many steps. Would you like to talk more about how you're feeling right now, or should we look at some specific tips for your daily plan?"

        for (const item of RECOVERY_KNOWLEDGE) {
            if (item.keywords.find(k => lastMessage.includes(k))) {
                assistantResponse = item.response
                break
            }
        }

        // Simulate network delay for "AI" feel
        await new Promise(resolve => setTimeout(resolve, 800))

        return NextResponse.json({ content: assistantResponse })
    } catch (error) {
        return NextResponse.json({ error: "Failed to process chat" }, { status: 500 })
    }
}
