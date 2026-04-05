import type { ReactNode } from "react";
import type { FriendRequest } from "../../types/user";
import UserAvatar from "../chat/UserAvatar";

interface IRequestItem {
    requestInfo: FriendRequest;
    action: ReactNode;
    type: "sent" | "received";
}

const FriendRequestItem = ({ requestInfo, action, type }: IRequestItem) => {
    if (!requestInfo) {
        return;
    }
    const info = type == "sent" ? requestInfo.to : requestInfo.from;
    if (!info) {
        return;
    }
    return (
        <div className="flex items-center justify-between rounded-lg shadow-md border border-primary-foreground p-3">
            <div className="flex items-center gap-3">
                <UserAvatar type="sidebar" name={info.displayName}/>

                <div>
                    <p className="font-medium">{ info.displayName }</p>
                    <p className="text-sm text-muted-foreground">@{ info.username }</p>
                </div>
            </div>
            { action }
        </div>
    );
}

export default FriendRequestItem;