import { toast } from "sonner";
import { useFriendStore } from "../../stores/useFriendStore";
import { Button } from "../ui/button";
import FriendRequestItem from "./FriendRequestItem";

const ReceivedRequests = () => {
    const { receivedList, acceptRequest, declineRequest, loading } = useFriendStore();

    if (!receivedList || receivedList.length <= 0) {
        return (
            <p className="text-sm text-muted-foreground">
                There is no friend requests.
            </p>
        )
    }
    const handleAccept = async (requestId: string) => {
        try {
            await acceptRequest(requestId);
            toast.success("Request accepted.");
        } catch (error) {
            console.error(error);
            toast.error("Accept request fail.");
        }
    }
    const handleDecline = async (requestId: string) => {
        try {
            await declineRequest(requestId);
            toast.success("Request declined.");
        } catch (error) {
            console.error(error);
            toast.error("Decline request fail.");
        }
    }
    return (
        <div className="space-y-3 mt-4">
            <>
                { receivedList.map((req) => (
                    <FriendRequestItem key={req._id} requestInfo={req} type="received" action={
                        <div className="flex gap-2">
                            <Button 
                                size="sm" 
                                variant="primary" 
                                onClick={() => {
                                    handleAccept(req._id)
                                }}
                                disabled={loading}
                            >
                                Accept
                            </Button>

                            <Button 
                                size="sm" 
                                variant="destructiveOutline" 
                                onClick={() => {
                                    handleDecline(req._id)
                                }}
                                disabled={loading}
                            >
                                Decline
                            </Button>
                        </div>
                    }/>
                ))}
            </>
        </div>
    );
}
export default ReceivedRequests;