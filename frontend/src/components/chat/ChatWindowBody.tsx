import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useChatStore } from "../../stores/useChatStore";
import ChatWelcomeScreen from "./ChatWelcomScreen";
import MessageItem from "./MessageItem";
import InfiniteScroll from "react-infinite-scroll-component";

const ChatWindowBody = () => {
    const { activeConversationId, conversations, messages: allMessages, fetchMessages } = useChatStore();
    const messages = allMessages[activeConversationId!]?.items ?? [];
    const revertMessages = [...messages].reverse();
    const hasMore = allMessages[activeConversationId!]?.hasMore ?? false;
    const selectedConvo = conversations.find((c) => c._id === activeConversationId);
    const messageEndRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const key = `chat-scroll-${activeConversationId}`;
    const [lastMessageStatus, setLastMessageStatus] = useState<"delivered" | "seen">("delivered");
    useEffect(() => {
        const lastMessage = selectedConvo?.lastMessage;
        if (!lastMessage) {
            return;
        }
        const seenBy = selectedConvo?.seenBy ?? [];
        const performInit = async () => {
            setLastMessageStatus(seenBy.length > 0 ? "seen" : "delivered");
        }
        performInit();
    }, [selectedConvo]);

    /**
     * useLayoutEffect: update immediately after DOM updated && 
     * before browser re-render layout
     */
    useLayoutEffect(() => {
        if (!messageEndRef.current) {
            return;
        }
        messageEndRef.current.scrollIntoView({
            behavior: "smooth",
            block: "end"
        });
    }, [activeConversationId]);

    useLayoutEffect(() => {
        const container = containerRef.current;
        if (!container) {
            return;
        }
        const item = sessionStorage.getItem(key);
        if (item) {
            const { scrollTop } = JSON.parse(item);
            /**
             * requestAnimationFrame: only scroll after finished calculation layout.
             */
            requestAnimationFrame(() => {
                container.scrollTop = scrollTop;
            });
        }
    }, [messages.length]);

    const fetchMoreMessage = async () => {
        if (!activeConversationId) {
            return;
        }
        try {
            await fetchMessages(activeConversationId);
        } catch (error) {
            console.error("Error while fetching more message: ", error);
        }
    }

    const handleScrollSave = () => {
        const container = containerRef.current;
        if (!container || !activeConversationId) {
            return;
        }
        sessionStorage.setItem(
            key,
            JSON.stringify({
                scrollTop: container.scrollTop, // current scroll position.
                scrollHeight: container.scrollHeight // height to scroll
            })
        )
    }

    if (!selectedConvo) {
        return <ChatWelcomeScreen/>
    }
    if (!messages || messages.length <= 0) {
        return (
            <div className="flex h-full items-center justify-center text-muted-foreground">
                There is no message in this conversation.
            </div>
        );
    }
    
    return (
        <div className="p-4 bg-primary-foreground h-full flex flex-col overflow-hidden">
            <div 
                id="scrollableDiv" 
                ref={containerRef} 
                className="flex flex-col-reverse overflow-y-auto overflow-x-hidden beautiful-scrollbar"
                onScroll={handleScrollSave}
            >
                <div ref={messageEndRef}></div>

                <InfiniteScroll 
                    dataLength={messages.length} 
                    next={fetchMoreMessage}
                    hasMore={hasMore}
                    scrollableTarget="scrollableDiv"
                    inverse={true}
                    style={{
                        display: "flex",
                        flexDirection: "column-reverse",
                        overflow: "visible"
                    }}
                    loader={
                        <p>Loading...</p>
                    }
                >
                    {
                        revertMessages.map((m, index) => (
                            <MessageItem 
                                key={m._id ?? index} 
                                message={m} index={index} 
                                messages={revertMessages} 
                                selectedConvo={selectedConvo} 
                                lastMessageStatus={lastMessageStatus}
                            />
                        ))
                    }
                </InfiniteScroll>
            </div>
        </div>
    )
}

export default ChatWindowBody;