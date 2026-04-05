import { useState } from "react";
import { useFriendStore } from "../../stores/useFriendStore";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { UserPlus, Users } from "lucide-react";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import type { Friend } from "../../types/user";
import InviteSuggestionList from "../newGroupChat/InviteSuggestionList";
import SelectedUserList from "../newGroupChat/SelectedUserList";
import { toast } from "sonner";
import { useChatStore } from "../../stores/useChatStore";

const NewGroupChatModel = () => {
    const [groupName, setGroupName] = useState("");
    const [search, setSearch] = useState("");
    const [invitedUsers, setInvitedUsers] = useState<Friend[]>([]);
    const { friends, getFriends } = useFriendStore();
    const { loading, createConversation } = useChatStore();

    const handleGetFriends = async () => {
        await getFriends();
    }

    const handleSelectFriend = (friend: Friend) => {
        setInvitedUsers([...invitedUsers, friend]);
        setSearch("");
    }

    const handleRemoveSelectedUser = (friend: Friend) => {
        setInvitedUsers(invitedUsers.filter((user) => user._id != friend._id));
    }

    const handleSubmit = async (event: React.SubmitEvent) => {
        try {
            event.preventDefault();
            if (!invitedUsers || invitedUsers.length <= 0) {
                toast.warning("Your have to invite at least one friend to create a group.");
                return;
            }
            await createConversation("group", groupName, invitedUsers.map((user) => user._id));
            setSearch("");
            setInvitedUsers([]);
        } catch (error) {
            console.error("Error while handling submit create group chat: ", error);
        }
    }

    const filteredFriends = friends.filter((friend) => 
        friend.displayName.toLowerCase().includes(search.toLowerCase()) && !invitedUsers.some((user) => user._id === friend._id)
    )

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button 
                    variant="ghost"
                    onClick={handleGetFriends}
                    className="flex z-10 justify-center items-center size-5 rounded-full hover:bg-sidebar-accent transition cursor-pointer"
                >
                    <Users className="size-4"/>
                    <span className="sr-only">Create group</span>
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[425px] border-none">
                <DialogHeader>
                    <DialogTitle className="capitalize">Create new group</DialogTitle>
                </DialogHeader>

                <form
                    className="space-y-4"
                    onSubmit={handleSubmit}
                >
                    <div className="space-y-2">
                        <Label htmlFor="groupName" className="text-sm font-semibold">Group name</Label>

                        <Input 
                            id="groupName" 
                            placeholder="Enter group's name..." 
                            className="glass border:border/50 focus:border-primary/50 transition-smooth"
                            value={groupName}
                            onChange={(event) => { setGroupName(event.target.value); }}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="invite"
                            className="text-sm font-semibold"
                        >
                            Invite participant
                        </Label>

                        <Input
                            id="invite"
                            placeholder="Searching by display name"
                            value={search}
                            onChange={(event) => { setSearch(event.target.value) }}
                        />

                        { search && filteredFriends.length > 0 && (
                            <InviteSuggestionList 
                                filterFriends={filteredFriends} 
                                onSelect={handleSelectFriend}
                            />
                        )}

                        <SelectedUserList
                            invitedUsers={invitedUsers}
                            onRemove={handleRemoveSelectedUser}
                        />
                    </div>
                </form>

                <DialogFooter>
                    <Button 
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-gradient-chat text-white hover:opacity-90 transition-smooth"
                    >
                        {
                            loading ? (
                                <span>Loading...</span>
                            ) : (
                                <>
                                    <UserPlus className="size-4 mr-2"/>
                                    Create group
                                </>
                            )
                        }
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default NewGroupChatModel;