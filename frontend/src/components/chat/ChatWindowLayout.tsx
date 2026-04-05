import { useEffect } from "react";
import { useChatStore } from "../../stores/useChatStore";
import { SidebarInset } from "../ui/sidebar";
import ChatWelcomeScreen from "./ChatWelcomScreen";
import ChatWindowBody from "./ChatWindowBody";
import ChatWindowHeader from "./ChatWindowHeader";
import MessageInput from "./MessageInput";
import ChatWindowSkeleton from "../skeleton/ChatWindowSkeleton";

const ChatWindowLayout = () => {
    const { activeConversationId, conversations, messageLoading: loading, markAsSeen } = useChatStore();
    const selectedConvo = conversations.find((convo) => convo._id === activeConversationId) ?? null;

    useEffect(() => {
        if (!selectedConvo) {
            return;
        }
        const markSeen = async () => {
            try {
                await markAsSeen();
            } catch (error) {
                console.error("Error while mark as seen", error);
            }
        }
        markSeen();
    }, [markAsSeen, selectedConvo]);

    if (!selectedConvo) {
        return <ChatWelcomeScreen/>
    }
    if (loading) {
        return <ChatWindowSkeleton/>
    }
    return (
        <SidebarInset className="flex flex-col h-full flex-1 overflow-hidden rounded-sm shadow-sm">
            <ChatWindowHeader chat={selectedConvo}/>

            <div className="flex-1 overflow-y-auto bg-primary-foreground">
                <ChatWindowBody/>
            </div>

            <MessageInput selectedConvo={selectedConvo}/>
        </SidebarInset>
    )
}

export default ChatWindowLayout;