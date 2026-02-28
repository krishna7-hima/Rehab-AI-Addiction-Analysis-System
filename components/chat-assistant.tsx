"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { MessageCircle, X, Send, Bot, User, Loader2, Sparkles } from "lucide-react"

interface Message {
    role: "user" | "assistant"
    content: string
}

const INITIAL_MESSAGES: Message[] = [
    {
        role: "assistant",
        content: "Hi there! I'm your RecoverAI Assistant. Whether you're feeling a craving, need advice on your recovery plan, or just want to talk, I'm here to support you 24/7. How can I help you today?",
    },
]

const SUGGESTIONS = [
    "How to handle a sudden craving?",
    "Explain my risk assessment",
    "Tips for better sleep",
    "Motivational quote",
]

export function ChatAssistant() {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES)
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isOpen])

    const handleSend = async (content: string = input) => {
        if (!content.trim() || isLoading) return

        const userMessage: Message = { role: "user", content }
        setMessages((prev) => [...prev, userMessage])
        setInput("")
        setIsLoading(true)

        try {
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...messages, userMessage] }),
            })

            if (!response.ok) throw new Error("Failed to get response")

            const data = await response.json()
            const assistantMessage: Message = { role: "assistant", content: data.content }
            setMessages((prev) => [...prev, assistantMessage])
        } catch (error) {
            setMessages((prev) => [
                ...prev,
                { role: "assistant", content: "I'm sorry, I'm having trouble connecting right now. Please try again in a moment." },
            ])
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            {isOpen && (
                <div className="w-[350px] sm:w-[400px] animate-in fade-in zoom-in slide-in-from-bottom-4 duration-300">
                    <Card className="shadow-2xl border-primary/20 bg-background overflow-hidden flex flex-col h-[500px]">
                        <CardHeader className="bg-primary text-primary-foreground p-4 flex flex-row items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="bg-white/20 p-1.5 rounded-lg">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-sm font-serif">RecoverAI Assistant</CardTitle>
                                    <p className="text-[10px] text-primary-foreground/70 uppercase tracking-widest font-bold">Always Available</p>
                                </div>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-primary-foreground hover:bg-white/10" onClick={() => setIsOpen(false)}>
                                <X className="w-4 h-4" />
                            </Button>
                        </CardHeader>

                        <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                                <div className="space-y-4 pb-4">
                                    {messages.map((message, i) => (
                                        <div key={i} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                                            <div className={`flex gap-3 max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${message.role === "user" ? "bg-primary/10" : "bg-secondary"}`}>
                                                    {message.role === "user" ? <User className="w-4 h-4 text-primary" /> : <Sparkles className="w-4 h-4 text-primary" />}
                                                </div>
                                                <div className={`p-3 rounded-2xl text-sm leading-relaxed ${message.role === "user"
                                                        ? "bg-primary text-primary-foreground rounded-tr-none shadow-sm"
                                                        : "bg-secondary text-foreground rounded-tl-none border border-border"
                                                    }`}>
                                                    {message.content}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="flex gap-3">
                                                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center shrink-0">
                                                    <Loader2 className="w-4 h-4 text-primary animate-spin" />
                                                </div>
                                                <div className="bg-secondary p-3 rounded-2xl rounded-tl-none border border-border">
                                                    <span className="flex gap-1">
                                                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" />
                                                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.2s]" />
                                                        <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce [animation-delay:0.4s]" />
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>

                            {messages.length === 1 && (
                                <div className="p-4 pt-0 flex flex-wrap gap-2">
                                    {SUGGESTIONS.map((suggestion) => (
                                        <button
                                            key={suggestion}
                                            onClick={() => handleSend(suggestion)}
                                            className="text-[11px] bg-primary/5 text-primary border border-primary/20 px-3 py-1.5 rounded-full hover:bg-primary/10 transition-colors"
                                        >
                                            {suggestion}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="p-3 border-t bg-muted/30">
                            <form
                                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                                className="flex w-full items-center gap-2"
                            >
                                <Input
                                    placeholder="Ask anything..."
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="flex-1 bg-background h-9 text-sm focus-visible:ring-primary"
                                    disabled={isLoading}
                                />
                                <Button type="submit" size="icon" className="h-9 w-9 shrink-0" disabled={isLoading || !input.trim()}>
                                    <Send className="w-4 h-4" />
                                </Button>
                            </form>
                        </CardFooter>
                    </Card>
                </div>
            )}

            <Button
                size="icon"
                className="w-14 h-14 rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all bg-primary hover:bg-primary/90"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
            </Button>
        </div>
    )
}
