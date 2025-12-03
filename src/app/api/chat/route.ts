import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/jwt";
import { groq, groqConfig } from "@/lib/groq";
import { SYSTEM_PROMPT, CHAT_CONFIG, WELCOME_MESSAGE } from "@/lib/chatConfig";

// Rate limiting store (in-memory, consider Redis for production)
const rateLimitStore = new Map<number, { count: number; resetTime: number }>();

function checkRateLimit(userId: number): boolean {
    const now = Date.now();
    const userLimit = rateLimitStore.get(userId);

    if (!userLimit || now > userLimit.resetTime) {
        // Reset limit
        rateLimitStore.set(userId, {
            count: 1,
            resetTime: now + 60000, // 1 minute
        });
        return true;
    }

    if (userLimit.count >= CHAT_CONFIG.rateLimitPerMinute) {
        return false;
    }

    userLimit.count++;
    return true;
}

// GET /api/chat - Get chat sessions for user
export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get("token")?.value;

        // If no token, return empty session for anonymous users
        if (!token) {
            return NextResponse.json({
                success: true,
                session: null,
                isAuthenticated: false,
            });
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.json({
                success: true,
                session: null,
                isAuthenticated: false,
            });
        }

        // Get user's latest chat session with messages
        const session = await prisma.chatSession.findFirst({
            where: { nguoi_dung_id: payload.userId },
            orderBy: { updated_at: "desc" },
            include: {
                messages: {
                    orderBy: { created_at: "asc" },
                    take: CHAT_CONFIG.maxMessagesPerSession,
                },
            },
        });

        return NextResponse.json({
            success: true,
            session: session || null,
            isAuthenticated: true,
        });
    } catch (error) {
        console.error("Get chat sessions error:", error);
        return NextResponse.json(
            { error: "Failed to fetch chat sessions" },
            { status: 500 }
        );
    }
}

// POST /api/chat - Send message and get AI response
export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get("token")?.value;
        const body = await request.json();
        const { message, sessionId, conversationHistory = [] } = body;

        if (!message || message.trim().length === 0) {
            return NextResponse.json(
                { error: "Message is required" },
                { status: 400 }
            );
        }

        if (message.length > CHAT_CONFIG.maxMessageLength) {
            return NextResponse.json(
                { error: `Message too long. Max ${CHAT_CONFIG.maxMessageLength} characters` },
                { status: 400 }
            );
        }

        // Check if user is authenticated
        let userId: number | null = null;
        let isAuthenticated = false;

        if (token) {
            const payload = await verifyToken(token);
            if (payload) {
                userId = payload.userId;
                isAuthenticated = true;

                // Rate limiting only for authenticated users
                if (!checkRateLimit(userId)) {
                    return NextResponse.json(
                        { error: "Quá nhiều yêu cầu. Vui lòng chờ 1 phút." },
                        { status: 429 }
                    );
                }
            }
        }

        // AUTHENTICATED USER FLOW - Save to database
        if (isAuthenticated && userId) {
            // Get or create session
            let session;
            if (sessionId) {
                session = await prisma.chatSession.findFirst({
                    where: {
                        id: sessionId,
                        nguoi_dung_id: userId,
                    },
                    include: {
                        messages: {
                            orderBy: { created_at: "asc" },
                        },
                    },
                });
            }

            if (!session) {
                // Create new session
                session = await prisma.chatSession.create({
                    data: {
                        nguoi_dung_id: userId,
                        title: message.substring(0, 50),
                    },
                    include: {
                        messages: true,
                    },
                });
            }

            // Save user message
            await prisma.chatMessage.create({
                data: {
                    session_id: session.id,
                    role: "user",
                    content: message,
                },
            });

            // Prepare conversation history
            const dbConversationHistory = session.messages.map((msg: any) => ({
                role: msg.role as "user" | "assistant" | "system",
                content: msg.content,
            }));

            // Add new user message
            dbConversationHistory.push({
                role: "user",
                content: message,
            });

            try {
                // Call Groq API
                const completion = await groq.chat.completions.create({
                    messages: [
                        {
                            role: "system",
                            content: SYSTEM_PROMPT,
                        },
                        ...dbConversationHistory,
                    ],
                    model: groqConfig.model,
                    temperature: groqConfig.temperature,
                    max_tokens: groqConfig.maxTokens,
                });

                const aiResponse = completion.choices[0]?.message?.content || "Xin lỗi, tôi không hiểu câu hỏi của bạn. Bạn có thể hỏi lại không?";

                // Save AI response
                const aiMessage = await prisma.chatMessage.create({
                    data: {
                        session_id: session.id,
                        role: "assistant",
                        content: aiResponse,
                    },
                });

                // Update session timestamp
                await prisma.chatSession.update({
                    where: { id: session.id },
                    data: { updated_at: new Date() },
                });

                return NextResponse.json({
                    success: true,
                    message: aiResponse,
                    sessionId: session.id,
                    messageId: aiMessage.id,
                    isAuthenticated: true,
                });
            } catch (groqError: any) {
                console.error("Groq API error:", groqError);

                const fallbackResponse = "Xin lỗi, hiện tại tôi gặp sự cố kỹ thuật. Vui lòng thử lại sau hoặc liên hệ bộ phận hỗ trợ.";

                const aiMessage = await prisma.chatMessage.create({
                    data: {
                        session_id: session.id,
                        role: "assistant",
                        content: fallbackResponse,
                    },
                });

                return NextResponse.json({
                    success: true,
                    message: fallbackResponse,
                    sessionId: session.id,
                    messageId: aiMessage.id,
                    warning: "AI service temporarily unavailable",
                    isAuthenticated: true,
                });
            }
        }

        // ANONYMOUS USER FLOW - No database persistence
        else {
            try {
                // Call Groq API directly with conversation history from client
                const completion = await groq.chat.completions.create({
                    messages: [
                        {
                            role: "system",
                            content: SYSTEM_PROMPT,
                        },
                        ...conversationHistory,
                        {
                            role: "user",
                            content: message,
                        },
                    ],
                    model: groqConfig.model,
                    temperature: groqConfig.temperature,
                    max_tokens: groqConfig.maxTokens,
                });

                const aiResponse = completion.choices[0]?.message?.content || "Xin lỗi, tôi không hiểu câu hỏi của bạn. Bạn có thể hỏi lại không?";

                return NextResponse.json({
                    success: true,
                    message: aiResponse,
                    isAuthenticated: false,
                    note: "Chat history not saved. Login to save conversations.",
                });
            } catch (groqError: any) {
                console.error("Groq API error (anonymous):", groqError);

                return NextResponse.json({
                    success: true,
                    message: "Xin lỗi, hiện tại tôi gặp sự cố kỹ thuật. Vui lòng thử lại sau.",
                    warning: "AI service temporarily unavailable",
                    isAuthenticated: false,
                });
            }
        }
    } catch (error) {
        console.error("Chat error:", error);
        return NextResponse.json(
            { error: "Chat failed" },
            { status: 500 }
        );
    }
}

// DELETE /api/chat - Delete all chat sessions for user
export async function DELETE(request: NextRequest) {
    try {
        const token = request.cookies.get("token")?.value;
        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const payload = await verifyToken(token);
        if (!payload) {
            return NextResponse.json({ error: "Invalid token" }, { status: 401 });
        }

        // Delete all sessions (messages will cascade delete)
        await prisma.chatSession.deleteMany({
            where: { nguoi_dung_id: payload.userId },
        });

        return NextResponse.json({
            success: true,
            message: "Chat history cleared",
        });
    } catch (error) {
        console.error("Delete chat error:", error);
        return NextResponse.json(
            { error: "Failed to delete chat history" },
            { status: 500 }
        );
    }
}
