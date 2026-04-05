import { useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFriendStore } from "@/stores/useFriendStore";
import SentRequests from "./SentRequests";
import ReceivedRequests from "./ReceivedRequests";

interface IFriendRequestDialog {
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
}

const FriendRequestDialog = ({open, setOpen}: IFriendRequestDialog) => {
    const [tab, setTab] = useState("received");
    const { getAllFriendRequests } = useFriendStore();

    /**
     * Run only once when open.
     */
    useEffect(() => {
        const loadRequest = async () => {
            try {
                await getAllFriendRequests();
            } catch (error) {
                console.error("Error while loading friend request.", error);
            }
        }
        loadRequest();
    }, []);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Request received</DialogTitle>
                </DialogHeader>

                <Tabs value={tab} onValueChange={setTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="received">Received</TabsTrigger>
                        <TabsTrigger value="sent">Sent</TabsTrigger>
                    </TabsList>

                    <TabsContent value="received">
                        <ReceivedRequests/>
                    </TabsContent>

                    <TabsContent value="sent">
                        <SentRequests/>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default FriendRequestDialog;