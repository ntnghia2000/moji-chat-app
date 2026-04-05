import type { FieldErrors, UseFormRegister } from "react-hook-form";
import type { IFormValues } from "../chat/AddFriendModel";
import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import { DialogClose, DialogFooter } from "../ui/dialog";
import { Button } from "../ui/button";
import { Search } from "lucide-react";

interface ISearchProps {
    register: UseFormRegister<IFormValues>;
    errors: FieldErrors<IFormValues>;
    loading: boolean;
    usernameValue: string;
    isFound: boolean | null;
    searchedUsername: string;
    onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
}

const SearchForm = ({ 
    register, errors, usernameValue, loading, isFound, searchedUsername, onSubmit, onCancel 
}: ISearchProps) => {

    return (
        <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-4">
                <Label htmlFor="username" className="text-sm font-semibold">Search by user name</Label>

                <Input 
                    id="username" 
                    placeholder="Enter user name..." 
                    className="glass border-border/50 focus:border-primary/50 transition-smooth"
                    {...register("username", {
                        required: "User name can not be empty."
                    })}
                ></Input>

                {
                    errors.username && (
                        <p className="error-message">{ errors.username.message }</p>
                    )
                }
                { 
                    isFound == false && (
                        <span className="error-message">
                            Can not found 
                            <span className="font-semibold">@{searchedUsername}</span>
                        </span>
                    )

                }
            </div>

            <DialogFooter>
                <DialogClose asChild>
                    <Button 
                        type="button" 
                        variant="outline" 
                        className="flex-1 glass hover:text-destructive"
                        onClick={onCancel}
                    >Cancel</Button>
                </DialogClose>

                <Button 
                    type="submit"
                    disabled={loading || !usernameValue?.trim()}
                    className="flex-1 bg-gradient-chat text-white hover:opacity-90 transition-smooth"
                >
                    { 
                        loading ? 
                        (<span>Searching...</span>)
                        :
                        (<> <Search className="size-4 mr-2"/>Find </>)
                    }
                </Button>
            </DialogFooter>
        </form>
    );
}

export default SearchForm;