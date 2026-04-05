import { cn, formatMessageTime } from "../../lib/utils";
import type { Conversation, Message, Participant } from "../../types/chat";
import { Badge } from "../ui/badge";
import { Card } from "../ui/card";
import UserAvatar from "./UserAvatar";

const MAX_TIME_BREAK_GROUP = 300000; // ms

interface IMessageItem {
    message: Message,
    index: number,
    messages: Message[],
    selectedConvo: Conversation,
    lastMessageStatus: "delivered" | "seen",
}

const MessageItem = ({ message, index, messages, selectedConvo, lastMessageStatus }: IMessageItem) => {
    const prevMessage = (index + 1) < messages.length ? messages[index + 1] : undefined;
    const isShowTime = index === 0 ||
        (new Date(message.createdAt).getTime() - new Date(prevMessage?.createdAt).getTime()) > MAX_TIME_BREAK_GROUP;
    const isGroupBreak = isShowTime || message.senderId !== prevMessage?.senderId;

    const participant = selectedConvo.participants.find((p: Participant) => 
        p._id.toString() === message.senderId.toString()
    );
    
    return (
        <>
            {
                isShowTime && (
                    <span className="text-xs text-muted-foreground px-1">
                        { formatMessageTime(new Date(message.createdAt)) }
                    </span>
                )
            }
            <div className={cn("flex gap-2 message-bounce mt-1",
                message.isOwn ? "justify-end" : "justify-start"
            )}>
                { !message.isOwn && (
                    <div className="w-8">
                        { isGroupBreak && (
                            <UserAvatar
                                type="chat"
                                name={participant?.displayName || "Moji"}
                                avatarUrl={participant?.avatarUrl || undefined}
                            />
                        )}
                    </div>
                )}
                <div className={cn("max-w-xs lg:max-w-md space-y-1 flex flex-col",
                    message.isOwn ? "items-end" : "items-start"
                )}>
                    <Card className={cn("p-3",
                        message.isOwn ? "chat-bubble-sent border-0" : "chat-bubble-received"
                    )}>
                        <p className="text-sm leading-relaxed break-words">{ message.content }</p>
                    </Card>
                    {
                        message.isOwn && message._id === selectedConvo.lastMessage?._id && (
                            <Badge variant="outline" className={cn("text-xs px-1.5 py-0.5 h-4 border-0",
                                lastMessageStatus === "seen" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                            )}>
                                { lastMessageStatus }
                            </Badge>
                        )
                    }
                </div>
            </div>
        </>
    )
}
export default MessageItem;