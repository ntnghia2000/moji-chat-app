import type { UseFormRegister } from "react-hook-form";
import type { IFormValues } from "../chat/AddFriendModel";
import { Label } from "@radix-ui/react-label";
import { Textarea } from "../ui/textarea";
import { DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { UserPlus } from "lucide-react";

interface ISendFriendRequestProps {
    register: UseFormRegister<IFormValues>;
    loading: boolean;
    searchedUsername: string;
    onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
    onBack: () => void;
}

const SendFriendRequestForm = ({
    register, loading, searchedUsername, onSubmit, onBack
}: ISendFriendRequestProps) => {

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
                <span className="success-message">
                    Found <span className="font-semibold">@{searchedUsername}</span>!
                </span>

                <div className="space-y-2">
                    <Label htmlFor="message" className="text-sm font-semibold">Introduction</Label>
                    <Textarea 
                        id="message" 
                        rows={3} 
                        placeholder="Hi, can we be friends?" 
                        className="glass border-border/50 focus:border-primary/50 transition-smooth resize-none"
                        {...register("message")}
                    />
                </div>
            </div>

            <DialogFooter>
                <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 glass hover:text-destructive"
                    onClick={onBack}
                >Back</Button>

                <Button 
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-chat text-white hover:opacity-90 transition-smooth"
                >
                    { 
                        loading ? 
                        (<span>Sending...</span>)
                        :
                        (<> <UserPlus className="size-4 mr-2"/>Add friend </>)
                    }
                </Button>
            </DialogFooter>
        </form>
    );
}

export default SendFriendRequestForm;