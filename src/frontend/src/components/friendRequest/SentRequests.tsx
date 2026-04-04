import { useFriendStore } from "../../stores/useFriendStore";
import FriendRequestItem from "./FriendRequestItem";

const SentRequests = () => {
    const { sentList } = useFriendStore();

    if (!sentList || sentList.length <= 0) {
        return (
            <p className="text-sm text-muted-foreground">
                There is no request sent.
            </p>
        )
    }
    return (
        <div className="space-y-3 mt-4">
            <>
                { sentList.map((req) => (
                    <FriendRequestItem key={req._id} requestInfo={req} type="sent" action={
                        <p className="text-muted-foreground text-sm">Waiting for your reply...</p>
                    }/>
                ))}
            </>
        </div>
    );
}

export default SentRequests;