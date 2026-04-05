import { MessageCircleMore, Users } from "lucide-react";
import { useFriendStore } from "../../stores/useFriendStore";
import { DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { Card } from "../ui/card";
import UserAvatar from "../chat/UserAvatar";
import { useChatStore } from "../../stores/useChatStore";

const FriendListModel = () => {
    const { friends } = useFriendStore();
    const { createConversation } = useChatStore();

    if (friends.length <= 0) {
        return (
            <div></div>
        );
    }

    const handleAddConversation = async (friendId: string) => {
        await createConversation("direct", "", [friendId]);
    };

    return (
        <DialogContent className="glass max-w-md">
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl capitalize">
                    <MessageCircleMore className="size-5"/> Start a new conversation.
                </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
                <h1 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">Friends</h1>

                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {
                        friends.map((f) => (
                            <Card 
                                key={f._id} 
                                className="p-3 cursor-pointer transition-smooth hover:shadow-soft glass hover:bg-muted/30 group/friendCard"
                                onClick={() => {
                                    handleAddConversation(f._id);
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <UserAvatar
                                            type="sidebar"
                                            name={f.displayName}
                                            avatarUrl={f.avatarUrl}
                                        />
                                    </div>

                                    <div className="flex-1 mix-w-0 flex flex-col">
                                        <h2 className="font-semibold text-sm truncate">
                                            { f.displayName }
                                        </h2>
                                        <span className="text-sm text-muted-foreground">@{f.username}</span>
                                    </div>
                                </div>
                            </Card>
                        ))
                    }

                    {
                        friends.length <= 0 && (
                            <div className="text-center py-8 text-muted-foreground">
                                <Users className="size-12 mx-auto mb-3 opacity-50"/>
                                You have no friend.
                            </div>
                        )
                    }
                </div>
            </div>
        </DialogContent>
    );
}
export default FriendListModel;